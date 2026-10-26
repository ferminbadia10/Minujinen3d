import React from 'react';
import { Compass, Mic, Camera, Smartphone, Sparkles, Play, Monitor, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onStartExperience: () => void;
  onStartDesktopMode: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartExperience,
  onStartDesktopMode,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md px-4 py-6 overflow-y-auto select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-pink-500/30 bg-slate-900/90 p-6 md:p-8 shadow-2xl text-slate-100 flex flex-col items-center text-center">
        {/* Glow accents */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-48 h-48 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-3">
          <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span>Marta Minujín • Sala de Arte Contemporáneo</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-serif font-black tracking-tight text-white mb-1">
          Pabellón <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400">Minujinda</span>
        </h1>
        <div className="text-sm font-black tracking-widest text-yellow-400 uppercase mb-3">
          ¡ARTE, ARTE, ARTE!
        </div>

        <p className="text-xs md:text-sm text-slate-300 max-w-md mb-5 leading-relaxed">
          Exposición inmersiva en pestaña única con colchones escultóricos, galería circular de cuadros flotantes en alta resolución y la escultura cinética 3D suspendida. Explorá en 360° con giroscopio, tocá las obras para ver sus fichas curatoriales y activá la escultura con tu voz.
        </p>

        {/* Sensor Capability Cards */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/5 flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Giroscopio 360°</div>
              <div className="text-[11px] text-slate-300 leading-tight">Mirada espacial por la sala</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/5 flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Voz Reactiva</div>
              <div className="text-[11px] text-slate-300 leading-tight">Pulsos de luz y color al hablar</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/5 flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-400 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Ventana AR</div>
              <div className="text-[11px] text-slate-300 leading-tight">Fondo con cámara en vivo</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/5 flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Ficha Curatorial</div>
              <div className="text-[11px] text-slate-300 leading-tight">Enfoque cinematográfico 3D</div>
            </div>
          </div>
        </div>

        {/* Primary CTA - Explicit User Gesture for iOS/Android permissions */}
        <button
          onClick={onStartExperience}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-yellow-500 hover:from-pink-500 hover:to-yellow-400 text-black font-black text-sm shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3 tracking-wide"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>INGRESAR A LA SALA DE EXPOSICIÓN</span>
        </button>

        {/* Secondary Desktop / Simulation Option */}
        <button
          onClick={onStartDesktopMode}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-2"
        >
          <Monitor className="w-4 h-4 text-slate-400" />
          <span>Modo Exploración con Mouse / Escritorio</span>
        </button>

        <p className="text-[11px] text-slate-400 mt-4">
          60 FPS en móviles • Rotación 360° continua • Pestaña única
        </p>
      </div>
    </div>
  );
};
