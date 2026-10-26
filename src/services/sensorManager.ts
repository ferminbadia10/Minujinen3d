import { AudioMetrics, OrientationData } from '../types';

export class SensorManager {
  // Gyroscope / Orientation
  private orientation: OrientationData = {
    alpha: 0,
    beta: 0,
    gamma: 0,
    smoothedAlpha: 0,
    smoothedBeta: 0,
    smoothedGamma: 0,
  };
  private orientationBase: { alpha: number; beta: number; gamma: number } = {
    alpha: 0,
    beta: 0,
    gamma: 0,
  };
  private hasPhysicalGyro = false;
  private hasPhysicalAccelerometer = false;
  private isGyroListening = false;
  private isMotionListening = false;
  private gyroSmoothingFactor = 0.08; // Lerp factor for smooth motion
  private parallaxOffset = { x: 0, y: 0 };
  private smoothedParallax = { x: 0, y: 0 };

  // Audio API
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioStream: MediaStream | null = null;
  private audioDataArray: Uint8Array | null = null;
  private audioMetrics: AudioMetrics = {
    volume: 0,
    bassLevel: 0,
    midLevel: 0,
    trebleLevel: 0,
    rawFrequencies: null,
  };

  // Video / Camera API
  private videoStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private currentFacingMode: 'environment' | 'user' = 'environment';

  // Haptics
  private isHapticsSupported = false;

  constructor() {
    this.isHapticsSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  // --- HAPTICS ---
  public triggerHaptic(pattern: number | number[] = 15): void {
    try {
      if (this.isHapticsSupported && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration error in restricted iframes
    }
  }

  public getHapticsSupported(): boolean {
    return this.isHapticsSupported;
  }

  // --- DEVICE ORIENTATION ---
  public async requestGyroscopePermission(): Promise<boolean> {
    try {
      // iOS 13+ requires explicit permission request
      const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof DeviceOrientationEventAny?.requestPermission === 'function') {
        const response = await DeviceOrientationEventAny.requestPermission();
        if (response === 'granted') {
          this.startOrientationListener();
          return true;
        }
        return false;
      }

      // Android / Standard Browsers
      this.startOrientationListener();
      return true;
    } catch (err) {
      console.warn('Error requesting gyroscope permission:', err);
      return false;
    }
  }

  public startOrientationListener(): void {
    if (this.isGyroListening) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
        this.hasPhysicalGyro = true;
      }

      const rawAlpha = event.alpha ?? 0;
      const rawBeta = event.beta ?? 0;
      const rawGamma = event.gamma ?? 0;

      // Normalize relative to baseline
      this.orientation.alpha = (rawAlpha - this.orientationBase.alpha + 360) % 360;
      this.orientation.beta = rawBeta - this.orientationBase.beta;
      this.orientation.gamma = rawGamma - this.orientationBase.gamma;
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    this.isGyroListening = true;

    // Also start motion listener for camera parallax
    this.startMotionListener();
  }

  public startMotionListener(): void {
    if (this.isMotionListening) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      // Linear acceleration or acceleration including gravity
      const acc = event.acceleration || event.accelerationIncludingGravity;
      if (acc && (acc.x !== null || acc.y !== null)) {
        this.hasPhysicalAccelerometer = true;
        const ax = acc.x ?? 0;
        const ay = acc.y ?? 0;

        // Invert X for natural camera counter-shift parallax
        // Subtle clamping to +-0.35 units as requested
        const targetX = Math.max(-0.35, Math.min(0.35, -ax * 0.08));
        const targetY = Math.max(-0.35, Math.min(0.35, ay * 0.08));

        this.parallaxOffset.x = targetX;
        this.parallaxOffset.y = targetY;
      }
    };

    window.addEventListener('devicemotion', handleMotion, true);
    this.isMotionListening = true;
  }

  public setSimulatedParallax(normalizedX: number, normalizedY: number): void {
    if (!this.hasPhysicalAccelerometer) {
      this.parallaxOffset.x = Math.max(-0.35, Math.min(0.35, normalizedX * 0.35));
      this.parallaxOffset.y = Math.max(-0.35, Math.min(0.35, -normalizedY * 0.35));
    }
  }

  public getParallaxOffset(): { x: number; y: number } {
    // Smooth with elastic return to center
    const lerpRate = 0.09;
    this.smoothedParallax.x += (this.parallaxOffset.x - this.smoothedParallax.x) * lerpRate;
    this.smoothedParallax.y += (this.parallaxOffset.y - this.smoothedParallax.y) * lerpRate;

    // Decay the offset back towards zero so it returns elastically to center
    if (this.hasPhysicalAccelerometer) {
      this.parallaxOffset.x *= 0.93;
      this.parallaxOffset.y *= 0.93;
    }

    return { ...this.smoothedParallax };
  }

  public resetOrientationBaseline(): void {
    this.orientationBase = {
      alpha: (this.orientation.alpha + this.orientationBase.alpha) % 360,
      beta: this.orientation.beta + this.orientationBase.beta,
      gamma: this.orientation.gamma + this.orientationBase.gamma,
    };
    this.orientation.smoothedAlpha = 0;
    this.orientation.smoothedBeta = 0;
    this.orientation.smoothedGamma = 0;
    this.parallaxOffset.x = 0;
    this.parallaxOffset.y = 0;
    this.smoothedParallax.x = 0;
    this.smoothedParallax.y = 0;
    this.triggerHaptic(25);
  }

  public setSimulatedOrientation(beta: number, gamma: number, alpha: number = 0): void {
    this.orientation.beta = beta;
    this.orientation.gamma = gamma;
    this.orientation.alpha = alpha;
  }

  public updateOrientationLerp(): OrientationData {
    // Apply linear interpolation (Lerp) to avoid jitter
    const f = this.gyroSmoothingFactor;
    this.orientation.smoothedAlpha += (this.orientation.alpha - this.orientation.smoothedAlpha) * f;
    this.orientation.smoothedBeta += (this.orientation.beta - this.orientation.smoothedBeta) * f;
    this.orientation.smoothedGamma += (this.orientation.gamma - this.orientation.smoothedGamma) * f;

    return { ...this.orientation };
  }

  public getOrientation(): OrientationData {
    return { ...this.orientation };
  }

  public getHasPhysicalGyro(): boolean {
    return this.hasPhysicalGyro;
  }

  public getHasPhysicalAccelerometer(): boolean {
    return this.hasPhysicalAccelerometer;
  }

  // --- AUDIO API ---
  public async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      this.audioStream = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      // AnalyserNode configuration as per SDD section 3.2: fftSize = 64 or 128
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      source.connect(this.analyser);
      const bufferLength = this.analyser.frequencyBinCount;
      this.audioDataArray = new Uint8Array(bufferLength);

      return true;
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      return false;
    }
  }

  public updateAudioMetrics(sensitivityMultiplier: number = 1.0): AudioMetrics {
    if (!this.analyser || !this.audioDataArray) {
      return this.audioMetrics;
    }

    this.analyser.getByteFrequencyData(this.audioDataArray as unknown as Uint8Array<ArrayBuffer>);
    const count = this.audioDataArray.length; // 64 bins for fftSize=128

    let sumTotal = 0;
    let sumBass = 0;
    let sumMid = 0;
    let sumTreble = 0;

    const bassEnd = Math.floor(count * 0.2); // ~0 to 20%
    const midEnd = Math.floor(count * 0.6);  // ~20% to 60%

    for (let i = 0; i < count; i++) {
      const val = this.audioDataArray[i] / 255.0; // 0.0 to 1.0
      sumTotal += val;

      if (i < bassEnd) {
        sumBass += val;
      } else if (i < midEnd) {
        sumMid += val;
      } else {
        sumTreble += val;
      }
    }

    const avgVol = (sumTotal / count) * sensitivityMultiplier;
    const avgBass = (sumBass / Math.max(1, bassEnd)) * sensitivityMultiplier;
    const avgMid = (sumMid / Math.max(1, midEnd - bassEnd)) * sensitivityMultiplier;
    const avgTreble = (sumTreble / Math.max(1, count - midEnd)) * sensitivityMultiplier;

    this.audioMetrics = {
      volume: Math.min(1.0, avgVol),
      bassLevel: Math.min(1.0, avgBass),
      midLevel: Math.min(1.0, avgMid),
      trebleLevel: Math.min(1.0, avgTreble),
      rawFrequencies: this.audioDataArray,
    };

    return this.audioMetrics;
  }

  public getAudioMetrics(): AudioMetrics {
    return this.audioMetrics;
  }

  // --- CAMERA / VIDEO FEED (WebRTC) ---
  public async requestCameraPermission(facingMode: 'environment' | 'user' = 'environment'): Promise<HTMLVideoElement | null> {
    try {
      this.stopCameraStream();

      this.currentFacingMode = facingMode;
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback to any available video source if environment camera isn't found
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      this.videoStream = stream;

      // Create or reuse hidden video element in DOM
      let video = this.videoElement;
      if (!video) {
        video = document.createElement('video');
        video.id = 'sensor-video-feed';
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.style.display = 'none';
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        document.body.appendChild(video);
        this.videoElement = video;
      }

      video.srcObject = stream;
      await video.play();

      return video;
    } catch (err) {
      console.warn('Camera permission denied or unavailable:', err);
      return null;
    }
  }

  public getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  public stopCameraStream(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  public dispose(): void {
    this.stopCameraStream();
    if (this.videoElement && this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
      this.videoElement = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((t) => t.stop());
      this.audioStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

export const sensorManager = new SensorManager();
