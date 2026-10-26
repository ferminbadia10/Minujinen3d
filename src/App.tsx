import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, RenderConfig } from './types';
import { sensorManager } from './services/sensorManager';
import { SceneManager } from './three/SceneManager';
import { MINUJIN_ARTWORKS } from './data/artworks';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PermissionsModal } from './components/PermissionsModal';
import { GalleryHeader } from './components/GalleryHeader';
import { CuratorialCard } from './components/CuratorialCard';
import { ArtworkCarouselDock } from './components/ArtworkCarouselDock';
import { SensorsSimulatorModal } from './components/SensorsSimulatorModal';
import { SnapshotModal } from './components/SnapshotModal';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // App State adhering to SDD & Minujín Contemporary Gallery Concept
  const [appState, setAppState] = useState<AppState>({
    isInitialized: false,
    showPermissionsModal: false,
    sensors: {
      gyroscopeAllowed: false,
      gyroscopeActive: false,
      micAllowed: false,
      micActive: false,
      cameraAllowed: false,
      cameraActive: false,
      hapticsSupported: sensorManager.getHapticsSupported(),
      hapticsEnabled: true,
    },
    orientationData: {
      alpha: 0,
      beta: 0,
      gamma: 0,
      smoothedAlpha: 0,
      smoothedBeta: 0,
      smoothedGamma: 0,
    },
    audioMetrics: {
      volume: 0,
      bassLevel: 0,
      midLevel: 0,
      trebleLevel: 0,
      rawFrequencies: null,
    },
    renderConfig: {
      audioSensitivity: 1.2,
      arMode: false,
      facingMode: 'environment',
      ambientLightIntensity: 0.85,
      spotlightIntensity: 2.2,
      kineticRotationSpeed: 0.45,
    },
    fps: 60,
    selectedArtworkId: null,
    isDesktopSimulation: false,
  });

  // Modals & UI overlays
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);

  // 1. Initialize Three.js SceneManager once
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const manager = new SceneManager(
      containerRef.current,
      canvasRef.current,
      appState.renderConfig,
      (artworkId: string | null) => {
        setAppState((prev) => ({ ...prev, selectedArtworkId: artworkId }));
      },
      (fps: number) => {
        setAppState((prev) => ({ ...prev, fps }));
      }
    );
    sceneManagerRef.current = manager;

    // Periodic telemetry sync for HUD indicators
    const telemetryInterval = setInterval(() => {
      const orientation = sensorManager.updateOrientationLerp();
      const audio = sensorManager.getAudioMetrics();
      setAppState((prev) => ({
        ...prev,
        orientationData: orientation,
        audioMetrics: audio,
      }));
    }, 100);

    return () => {
      clearInterval(telemetryInterval);
      manager.dispose();
      sensorManager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // 2. Sensor Requests Handlers
  const handleRequestGyro = useCallback(async (): Promise<boolean> => {
    const granted = await sensorManager.requestGyroscopePermission();
    setAppState((prev) => ({
      ...prev,
      sensors: {
        ...prev.sensors,
        gyroscopeAllowed: granted,
        gyroscopeActive: granted,
      },
    }));
    return granted;
  }, []);

  const handleRequestMic = useCallback(async (): Promise<boolean> => {
    const granted = await sensorManager.requestMicrophonePermission();
    setAppState((prev) => ({
      ...prev,
      sensors: {
        ...prev.sensors,
        micAllowed: granted,
        micActive: granted,
      },
    }));
    return granted;
  }, []);

  const handleRequestCamera = useCallback(async (): Promise<boolean> => {
    const video = await sensorManager.requestCameraPermission(appState.renderConfig.facingMode);
    const granted = video !== null;
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setCameraVideoTexture(video);
    }
    setAppState((prev) => ({
      ...prev,
      sensors: {
        ...prev.sensors,
        cameraAllowed: granted,
        cameraActive: granted,
      },
      renderConfig: {
        ...prev.renderConfig,
        arMode: granted ? true : prev.renderConfig.arMode,
      },
    }));
    return granted;
  }, [appState.renderConfig.facingMode]);

  // Start Experience Trigger (from Welcome Screen)
  const handleStartExperience = async () => {
    setAppState((prev) => ({ ...prev, showPermissionsModal: true, isInitialized: true }));
    await handleRequestGyro();
  };

  const handleStartDesktopMode = () => {
    setAppState((prev) => ({
      ...prev,
      isInitialized: true,
      showPermissionsModal: false,
      isDesktopSimulation: true,
    }));
  };

  // Toggle AR Mode
  const handleToggleArMode = async () => {
    const newArMode = !appState.renderConfig.arMode;

    if (newArMode && !appState.sensors.cameraAllowed) {
      const granted = await handleRequestCamera();
      if (!granted) return;
    }

    const updatedConfig: RenderConfig = {
      ...appState.renderConfig,
      arMode: newArMode,
    };

    setAppState((prev) => ({ ...prev, renderConfig: updatedConfig }));
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateConfig(updatedConfig);
    }

    if (appState.sensors.hapticsEnabled) {
      sensorManager.triggerHaptic(25);
    }
  };

  // Update Config
  const handleUpdateConfig = (newConfigPart: Partial<RenderConfig>) => {
    const updated = { ...appState.renderConfig, ...newConfigPart };
    setAppState((prev) => ({ ...prev, renderConfig: updated }));
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateConfig(updated);
    }
  };

  // Select / Focus Artwork
  const handleSelectArtwork = (artworkId: string) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.focusArtwork(artworkId);
    }
    setAppState((prev) => ({ ...prev, selectedArtworkId: artworkId }));
    if (appState.sensors.hapticsEnabled) {
      sensorManager.triggerHaptic(35);
    }
  };

  // Close Focus / Return to 360° Walk
  const handleCloseFocus = () => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.clearFocus();
    }
    setAppState((prev) => ({ ...prev, selectedArtworkId: null }));
    if (appState.sensors.hapticsEnabled) {
      sensorManager.triggerHaptic(20);
    }
  };

  // Cycle Next / Prev Artworks
  const handleNextArtwork = () => {
    const currentIndex = MINUJIN_ARTWORKS.findIndex((a) => a.id === appState.selectedArtworkId);
    const nextIdx = (currentIndex + 1) % MINUJIN_ARTWORKS.length;
    handleSelectArtwork(MINUJIN_ARTWORKS[nextIdx].id);
  };

  const handlePrevArtwork = () => {
    const currentIndex = MINUJIN_ARTWORKS.findIndex((a) => a.id === appState.selectedArtworkId);
    const prevIdx = (currentIndex - 1 + MINUJIN_ARTWORKS.length) % MINUJIN_ARTWORKS.length;
    handleSelectArtwork(MINUJIN_ARTWORKS[prevIdx].id);
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.resetCamera();
    }
    setAppState((prev) => ({ ...prev, selectedArtworkId: null }));
  };

  // Trigger "¡ARTE, ARTE, ARTE!" Happening celebration
  const handleTriggerArte = () => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.triggerArteHappening();
    }
  };

  // Capture Snapshot
  const handleCaptureSnapshot = () => {
    if (sceneManagerRef.current) {
      const dataUrl = sceneManagerRef.current.captureSnapshot();
      setSnapshotDataUrl(dataUrl);
      if (appState.sensors.hapticsEnabled) {
        sensorManager.triggerHaptic([30, 40, 20]);
      }
    }
  };

  // Toggle Haptics
  const handleToggleHaptics = () => {
    const nextVal = !appState.sensors.hapticsEnabled;
    if (nextVal) {
      sensorManager.triggerHaptic(30);
    }
    setAppState((prev) => ({
      ...prev,
      sensors: {
        ...prev.sensors,
        hapticsEnabled: nextVal,
      },
    }));
  };

  // Active artwork object
  const activeArtwork = MINUJIN_ARTWORKS.find((a) => a.id === appState.selectedArtworkId);
  const activeIndex = MINUJIN_ARTWORKS.findIndex((a) => a.id === appState.selectedArtworkId);

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 overflow-hidden font-sans select-none">
      {/* Layer 0: 3D Exhibition Canvas - Base WebGL layer capturing 360° orbit and raycast touch */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing overflow-hidden select-none touch-none"
        aria-label="Espacio de exhibición 3D interactivo"
      >
        <canvas id="three-canvas" ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Screen 1: Welcome & Initial User Gesture */}
      {!appState.isInitialized && (
        <WelcomeScreen
          onStartExperience={handleStartExperience}
          onStartDesktopMode={handleStartDesktopMode}
        />
      )}

      {/* Screen 2: Permissions Modal */}
      {appState.showPermissionsModal && (
        <PermissionsModal
          sensors={appState.sensors}
          onRequestGyro={handleRequestGyro}
          onRequestMic={handleRequestMic}
          onRequestCamera={handleRequestCamera}
          onClose={() => setAppState((prev) => ({ ...prev, showPermissionsModal: false }))}
          onContinue={() => setAppState((prev) => ({ ...prev, showPermissionsModal: false }))}
        />
      )}

      {/* Layer 1: Gallery HUD & Curatorial Overlays - pointer-events-none ensures transparent canvas pass-through */}
      {appState.isInitialized && (
        <div
          className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none touch-none"
          style={{ pointerEvents: 'none' }}
        >
          {/* Top Exhibition Bar with Live Sensor Telemetry */}
          <GalleryHeader
            sensors={appState.sensors}
            orientation={appState.orientationData}
            audio={appState.audioMetrics}
            fps={appState.fps}
            arMode={appState.renderConfig.arMode}
            isFocused={appState.selectedArtworkId !== null}
            onToggleArMode={handleToggleArMode}
            onOpenSimulator={() => setShowSimulatorModal(true)}
            onOpenPermissions={() => setAppState((prev) => ({ ...prev, showPermissionsModal: true }))}
            onResetOrientation={handleResetCamera}
            onCaptureSnapshot={handleCaptureSnapshot}
          />

          {/* Focused Artwork Dual-Pane Layout: Left Viewing Frame & Right Curatorial Card */}
          {activeArtwork && (
            <>
              {/* Left Artwork Viewing Frame (matching the screenshot's left boundary) */}
              <div
                className="hidden md:block fixed top-20 bottom-8 left-6 right-[415px] lg:right-[435px] rounded-2xl border border-white/20 pointer-events-none z-30 transition-all duration-300 shadow-2xl"
                style={{
                  pointerEvents: 'none',
                  boxShadow: `0 25px 60px -12px ${activeArtwork.colorAccent}25, 0 0 0 1px rgba(255,255,255,0.15)`,
                }}
              >
                {/* Subtle corner view brackets */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-white/40 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-white/40 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-white/40 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-white/40 rounded-br-sm pointer-events-none" />
              </div>

              {/* Curatorial Card in the right panel */}
              <CuratorialCard
                artwork={activeArtwork}
                currentIndex={activeIndex}
                totalArtworks={MINUJIN_ARTWORKS.length}
                onClose={handleCloseFocus}
                onNext={handleNextArtwork}
                onPrev={handlePrevArtwork}
              />
            </>
          )}

          {/* Bottom Exhibition Carousel & ARTE Celebratory Button */}
          {!activeArtwork && (
            <ArtworkCarouselDock
              config={appState.renderConfig}
              selectedArtworkId={appState.selectedArtworkId}
              hapticsSupported={appState.sensors.hapticsSupported}
              hapticsEnabled={appState.sensors.hapticsEnabled}
              onSelectArtwork={handleSelectArtwork}
              onTriggerArte={handleTriggerArte}
              onUpdateConfig={handleUpdateConfig}
              onToggleHaptics={handleToggleHaptics}
            />
          )}
        </div>
      )}

      {/* Sensors Simulator Modal */}
      {showSimulatorModal && (
        <SensorsSimulatorModal
          sensors={appState.sensors}
          orientation={appState.orientationData}
          onClose={() => setShowSimulatorModal(false)}
          onSetSimulatedOrientation={(beta, gamma, alpha) => {
            sensorManager.setSimulatedOrientation(beta, gamma, alpha);
          }}
        />
      )}

      {/* Snapshot Preview & Download Modal */}
      {snapshotDataUrl && (
        <SnapshotModal
          imageDataUrl={snapshotDataUrl}
          onClose={() => setSnapshotDataUrl(null)}
        />
      )}
    </div>
  );
}
