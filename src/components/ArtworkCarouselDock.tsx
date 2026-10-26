import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, ChevronDown, ChevronUp, Vibrate, Sun, Volume2 } from 'lucide-react';
import { MINUJIN_ARTWORKS, Artwork } from '../data/artworks';
import { RenderConfig } from '../types';

interface ArtworkCarouselDockProps {
  config: RenderConfig;
  selectedArtworkId: string | null;
  hapticsSupported: boolean;
  hapticsEnabled: boolean;
  onSelectArtwork: (artworkId: string) => void;
  onTriggerArte: () => void;
  onUpdateConfig: (config: Partial<RenderConfig>) => void;
  onToggleHaptics: () => void;
}

export const ArtworkCarouselDock: React.FC<ArtworkCarouselDockProps> = ({
  config,
  selectedArtworkId,
  hapticsSupported,
  hapticsEnabled,
  onSelectArtwork,
  onTriggerArte,
  onUpdateConfig,
  onToggleHaptics,
}) => {
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-30 pointer-events-none">
      {/* Settings Drawer (Foldable) */}
      {showSettingsDrawer && (
        <div className="mb-3 bg-slate-950/92 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 text-xs text-slate-200 pointer-events-auto shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Ajustes de Sala & Sensores
            </span>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Audio Sensitivity */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                  Sensibilidad Audio
                </span>
                <span className="font-mono text-white">{config.audioSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={config.audioSensitivity}
                onChange={(e) => onUpdateConfig({ audioSensitivity: parseFloat(e.target.value) })}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>

            {/* Spotlight Intensity */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  Iluminación de Obras
                </span>
                <span className="font-mono text-white">{config.spotlightIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.2"
                value={config.spotlightIntensity}
                onChange={(e) => onUpdateConfig({ spotlightIntensity: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Kinetic Rotation Speed & Haptics */}
            <div className="flex items-center justify-between gap-3 pt-2 sm:pt-0">
              <div>
                <span className="block font-medium text-slate-200 mb-0.5">Vibración Háptica</span>
                <span className="text-[10px] text-slate-400">Pulsos al tocar obras</span>
              </div>
              {hapticsSupported ? (
                <button
                  onClick={onToggleHaptics}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                    hapticsEnabled
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <Vibrate className="w-3.5 h-3.5 inline mr-1" />
                  {hapticsEnabled ? 'Activa' : 'Desactivada'}
                </button>
              ) : (
                <span className="text-[10px] text-slate-400">No disponible</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Dock */}
      <div className="bg-slate-950/85 backdrop-blur-xl border border-white/15 rounded-2xl p-2.5 sm:p-3 pointer-events-auto shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Curated Artworks Carousel Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-0.5">
          {MINUJIN_ARTWORKS.map((artwork, idx) => {
            const isSelected = selectedArtworkId === artwork.id;
            return (
              <button
                key={artwork.id}
                onClick={() => onSelectArtwork(artwork.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-white text-slate-950 font-bold shadow-lg scale-[1.03]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
                style={{
                  borderLeft: isSelected ? undefined : `3px solid ${artwork.colorAccent}`,
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: artwork.colorAccent }} />
                <div className="leading-tight">
                  <div className="text-xs font-semibold truncate max-w-[120px] sm:max-w-[140px]">
                    {artwork.title}
                  </div>
                  <div className={`text-[10px] ${isSelected ? 'text-slate-700' : 'text-slate-400'}`}>
                    {artwork.year}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Controls: "ARTE ARTE ARTE" Button & Drawer Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
          {/* Celebratory ARTE Button */}
          <button
            onClick={onTriggerArte}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 text-slate-950 font-black tracking-wider uppercase text-xs shadow-lg shadow-pink-500/25 hover:opacity-95 active:scale-95 transition-all"
            title="Girar Escultura 3D ARTE y Lanzar Tiras Neón"
          >
            <Sparkles className="w-4 h-4" />
            <span>¡ARTE, ARTE, ARTE!</span>
          </button>

          {/* Settings Drawer Button */}
          <button
            onClick={() => setShowSettingsDrawer((prev) => !prev)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Ajustes de Sala"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
