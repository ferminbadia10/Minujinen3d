import React from 'react';
import { Compass, Mic, Camera, Sliders, RotateCcw, Image, Sparkles } from 'lucide-react';
import { AudioMetrics, OrientationData, SensorState } from '../types';

interface GalleryHeaderProps {
  sensors: SensorState;
  orientation: OrientationData;
  audio: AudioMetrics;
  fps: number;
  arMode: boolean;
  isFocused: boolean;
  onToggleArMode: () => void;
  onOpenSimulator: () => void;
  onOpenPermissions: () => void;
  onResetOrientation: () => void;
  onCaptureSnapshot: () => void;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  sensors,
  orientation,
  audio,
  fps,
  arMode,
  isFocused,
  onToggleArMode,
  onOpenSimulator,
  onOpenPermissions,
  onResetOrientation,
  onCaptureSnapshot,
}) => {
  const audioPercent = Math.min(Math.round((audio.volume || 0) * 100), 100);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-3 md:p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Museum Branding & View Mode */}
        <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-xl pointer-events-auto shadow-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
          <div>
            <h1 className="text-xs md:text-sm font-bold tracking-wider uppercase text-white font-serif">
              Marta Minujín
              <span className="text-slate-400 font-normal font-sans ml-1.5 hidden sm:inline">
                • Sala Contemporánea
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">
              {isFocused ? 'Enfoque de Obra en Sala' : 'Rotación Libre 360° • Colchones & Cuadros'}
            </p>
          </div>
        </div>

        {/* Right: Sensor Indicators & Quick Actions */}
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-xl pointer-events-auto text-xs shadow-2xl">
          {/* Gyroscope Indicator */}
          <button
            onClick={onOpenPermissions}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
              sensors.gyroscopeActive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
            title="Estado del Giroscopio 360°"
          >
            <Compass className={`w-3.5 h-3.5 ${sensors.gyroscopeActive ? 'animate-spin-slow' : ''}`} />
            <span className="font-mono text-[11px] hidden sm:inline">
              {sensors.gyroscopeActive
                ? `${Math.round(orientation.smoothedAlpha)}°`
                : 'Giro 360°'}
            </span>
          </button>

          {/* Mic VU Meter */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
              sensors.micActive
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                : 'bg-white/5 text-slate-400'
            }`}
            title="Sensibilidad de Voz / ¡ARTE!"
          >
            <Mic className="w-3.5 h-3.5" />
            <div className="w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden flex items-center">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-pink-500 transition-all duration-75"
                style={{ width: `${audioPercent}%` }}
              />
            </div>
          </div>

          {/* AR Mode Toggle */}
          <button
            onClick={onToggleArMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
              arMode
                ? 'bg-pink-500 text-white font-medium'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Activar Fondo de Realidad Aumentada (Cámara)"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AR</span>
          </button>

          {/* Snapshot Photo Button */}
          <button
            onClick={onCaptureSnapshot}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Capturar Fotografía en Alta Resolución"
          >
            <Image className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera View Button */}
          <button
            onClick={onResetOrientation}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Restablecer Vista al Centro"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Desktop Simulator Benchmark */}
          <button
            onClick={onOpenSimulator}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors hidden md:flex"
            title="Simulador de Sensores Móviles"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* FPS Badge */}
          <span className="text-[10px] font-mono text-slate-400 pl-1 border-l border-white/10 hidden lg:inline">
            {fps} FPS
          </span>
        </div>
      </div>
    </header>
  );
};
