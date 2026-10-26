export interface SensorState {
  gyroscopeAllowed: boolean;
  gyroscopeActive: boolean;
  micAllowed: boolean;
  micActive: boolean;
  cameraAllowed: boolean;
  cameraActive: boolean;
  hapticsSupported: boolean;
  hapticsEnabled: boolean;
}

export interface OrientationData {
  alpha: number; // 0 to 360 (Yaw)
  beta: number;  // -180 to 180 (Pitch)
  gamma: number; // -90 to 90 (Roll)
  smoothedAlpha: number;
  smoothedBeta: number;
  smoothedGamma: number;
}

export interface AudioMetrics {
  volume: number;    // 0.0 to 1.0
  bassLevel: number; // 0.0 to 1.0
  midLevel: number;  // 0.0 to 1.0
  trebleLevel: number; // 0.0 to 1.0
  rawFrequencies: Uint8Array | null;
}

export interface RenderConfig {
  audioSensitivity: number;
  arMode: boolean; // Camera background feed active
  facingMode: 'environment' | 'user';
  ambientLightIntensity: number;
  spotlightIntensity: number;
  kineticRotationSpeed: number;
}

export interface AppState {
  isInitialized: boolean;
  showPermissionsModal: boolean;
  sensors: SensorState;
  orientationData: OrientationData;
  audioMetrics: AudioMetrics;
  renderConfig: RenderConfig;
  fps: number;
  selectedArtworkId: string | null;
  isDesktopSimulation: boolean;
}
