import React, { useState } from 'react';
import { X, Sliders, Volume2, Compass, Smartphone, Play, Square, QrCode } from 'lucide-react';
import { OrientationData, SensorState } from '../types';

interface SensorsSimulatorModalProps {
  sensors: SensorState;
  orientation: OrientationData;
  onClose: () => void;
  onSetSimulatedOrientation: (beta: number, gamma: number, alpha: number) => void;
}

export const SensorsSimulatorModal: React.FC<SensorsSimulatorModalProps> = ({
  sensors,
  orientation,
  onClose,
  onSetSimulatedOrientation,
}) => {
  const [simBeta, setSimBeta] = useState(orientation.beta || 0);
  const [simGamma, setSimGamma] = useState(orientation.gamma || 0);
  const [simAlpha, setSimAlpha] = useState(orientation.alpha || 0);

  // Audio tone test generator for testing audio reactivity without a microphone
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [audioOscillator, setAudioOscillator] = useState<OscillatorNode | null>(null);

  const handlePitchChange = (val: number) => {
    setSimBeta(val);
    onSetSimulatedOrientation(val, simGamma, simAlpha);
  };

  const handleRollChange = (val: number) => {
    setSimGamma(val);
    onSetSimulatedOrientation(simBeta, val, simAlpha);
  };

  const handleYawChange = (val: number) => {
    setSimAlpha(val);
    onSetSimulatedOrientation(simBeta, simGamma, val);
  };

  const handleResetSim = () => {
    setSimBeta(0);
    setSimGamma(0);
    setSimAlpha(0);
    onSetSimulatedOrientation(0, 0, 0);
  };

  const toggleTestTone = () => {
    if (isPlayingTestTone && audioOscillator) {
      try {
        audioOscillator.stop();
        audioOscillator.disconnect();
      } catch {}
      setAudioOscillator(null);
      setIsPlayingTestTone(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setAudioOscillator(osc);
        setIsPlayingTestTone(true);
      } catch (err) {
        console.warn('Could not start test tone:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Simulador de Sensores</h2>
            <p className="text-xs text-slate-400">Prueba de orientación y respuesta sonora</p>
          </div>
        </div>

        {/* Hardware Status Banner */}
        <div className="my-4 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-700 text-slate-300">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white">
              {sensors.gyroscopeAllowed ? 'Giroscopio Físico Detectado' : 'Modo Simulación Activo'}
            </div>
            <div className="text-[11px] text-slate-400">
              {sensors.gyroscopeAllowed
                ? 'Moviendo tu teléfono físico orientarás la cámara 360°'
                : 'Usa los controles deslizantes de abajo o arrastra con el dedo/mouse'}
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 mb-5">
          {/* Pitch */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Pitch (Inclinación Adelante/Atrás β)</span>
              <span className="font-mono text-sky-400">{Math.round(simBeta)}°</span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              value={simBeta}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Roll */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Roll (Inclinación Izquierda/Derecha γ)</span>
              <span className="font-mono text-indigo-400">{Math.round(simGamma)}°</span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              value={simGamma}
              onChange={(e) => handleRollChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Yaw */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Yaw (Orientación Brújula α)</span>
              <span className="font-mono text-purple-400">{Math.round(simAlpha)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={simAlpha}
              onChange={(e) => handleYawChange(parseFloat(e.target.value))}
              className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <button
            onClick={handleResetSim}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
          >
            Restablecer Inclinación a 0°
          </button>
        </div>

        {/* Audio Synthesis Test */}
        <div className="pt-4 border-t border-slate-800">
          <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            Prueba de Síntesis Reactiva
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Genera una onda sintetizada para verificar la deformación y animación 3D reactiva al audio:
          </p>
          <button
            onClick={toggleTestTone}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              isPlayingTestTone
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            {isPlayingTestTone ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" /> Detener Tono de Prueba
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Reproducir Tono Reactivo (140Hz)
              </>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
        >
          Aceptar y Volver a la Escena
        </button>
      </div>
    </div>
  );
};
