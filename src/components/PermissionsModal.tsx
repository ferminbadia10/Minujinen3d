import React, { useState } from 'react';
import { Compass, Mic, Camera, ShieldCheck, Check, ArrowRight, X } from 'lucide-react';
import { SensorState } from '../types';

interface PermissionsModalProps {
  sensors: SensorState;
  onRequestGyro: () => Promise<boolean>;
  onRequestMic: () => Promise<boolean>;
  onRequestCamera: () => Promise<boolean>;
  onClose: () => void;
  onContinue: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  sensors,
  onRequestGyro,
  onRequestMic,
  onRequestCamera,
  onClose,
  onContinue,
}) => {
  const [loadingSensor, setLoadingSensor] = useState<string | null>(null);

  const handleRequestAll = async () => {
    setLoadingSensor('all');
    await onRequestGyro();
    await onRequestMic();
    await onRequestCamera();
    setLoadingSensor(null);
    onContinue();
  };

  const handleToggle = async (sensor: 'gyro' | 'mic' | 'camera') => {
    setLoadingSensor(sensor);
    if (sensor === 'gyro') await onRequestGyro();
    if (sensor === 'mic') await onRequestMic();
    if (sensor === 'camera') await onRequestCamera();
    setLoadingSensor(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Permisos de Sensores</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Para vivir la experiencia inmersiva completa descrita en el SDD, habilita los sensores físicos de tu dispositivo.
        </p>

        {/* Sensor Items */}
        <div className="space-y-3 mb-6">
          {/* Gyro */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${sensors.gyroscopeAllowed ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-700 text-slate-400'}`}>
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Giroscopio y Orientación</div>
                <div className="text-[11px] text-slate-400">Control de cámara física 360°</div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('gyro')}
              disabled={loadingSensor !== null}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                sensors.gyroscopeAllowed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {sensors.gyroscopeAllowed ? (
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Activo</span>
              ) : (
                'Habilitar'
              )}
            </button>
          </div>

          {/* Mic */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${sensors.micAllowed ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Micrófono (Web Audio)</div>
                <div className="text-[11px] text-slate-400">Reactividad de volumen y frecuencias</div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('mic')}
              disabled={loadingSensor !== null}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                sensors.micAllowed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {sensors.micAllowed ? (
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Activo</span>
              ) : (
                'Habilitar'
              )}
            </button>
          </div>

          {/* Camera */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${sensors.cameraAllowed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Cámara en Vivo (AR)</div>
                <div className="text-[11px] text-slate-400">Fondo WebRTC VideoTexture</div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('camera')}
              disabled={loadingSensor !== null}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                sensors.cameraAllowed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {sensors.cameraAllowed ? (
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Activo</span>
              ) : (
                'Habilitar'
              )}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleRequestAll}
            disabled={loadingSensor !== null}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <span>Conceder Todos y Entrar</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onContinue}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Continuar con configuración actual
          </button>
        </div>
      </div>
    </div>
  );
};
