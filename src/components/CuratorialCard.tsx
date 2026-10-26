import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Eye, ChevronUp, ChevronDown, Info, Maximize2, Minimize2 } from 'lucide-react';
import { Artwork } from '../data/artworks';

interface CuratorialCardProps {
  artwork: Artwork;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalArtworks: number;
}

export const CuratorialCard: React.FC<CuratorialCardProps> = ({
  artwork,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalArtworks,
}) => {
  // Minimize state allows visitor to completely unblock the 3D exhibition content
  const [isMinimized, setIsMinimized] = useState(false);

  // If minimized, display a sleek, non-obtrusive floating glass badge
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-auto md:top-20 z-40 pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-3">
        <div
          className="bg-slate-950/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-3 text-slate-100 flex items-center justify-between gap-3 max-w-md"
          style={{
            boxShadow: `0 20px 40px -10px ${artwork.colorAccent}30, 0 0 0 1px rgba(255,255,255,0.15)`,
          }}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: artwork.colorAccent }}
            />
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Obra {currentIndex + 1} de {totalArtworks}
              </span>
              <h2 className="text-xs md:text-sm font-serif font-bold text-white truncate">
                {artwork.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Expandir ficha curatorial completa"
            >
              <Maximize2 className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">Ver Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Volver a la sala 360°"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 max-w-lg mx-auto md:left-auto md:right-6 md:top-20 md:bottom-8 md:w-[380px] lg:w-[400px] md:mx-0 z-40 pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-right-6">
      <div
        className="relative bg-slate-950/88 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-4 md:p-5 text-slate-100 overflow-hidden flex flex-col justify-between transition-all duration-300 max-h-[75vh] md:max-h-none md:h-full"
        style={{
          boxShadow: `0 25px 60px -12px ${artwork.colorAccent}35, 0 0 0 1px rgba(255,255,255,0.18)`,
        }}
      >
        {/* Subtle top neon accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 shadow-sm"
          style={{ backgroundColor: artwork.colorAccent }}
        />

        {/* Top Content Group */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header row: Index badge, Minimize button & Close button */}
          <div className="flex items-center justify-between gap-2 mb-2.5 pt-1">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-sm"
                style={{ backgroundColor: artwork.colorAccent }}
              >
                Obra {currentIndex + 1} de {totalArtworks}
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Colección Minujín
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Minimize button to keep the 3D exhibition content 100% visible */}
              <button
                onClick={() => setIsMinimized(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                title="Minimizar panel para contemplar la obra sin obstrucciones"
              >
                <Minimize2 className="w-3.5 h-3.5 text-slate-300" />
                <span>Minimizar</span>
              </button>

              {/* Close button to return to full 360° panoramic view */}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Cerrar y volver a la sala 360°"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="mb-2.5">
            <h2 className="text-lg md:text-xl font-serif font-bold text-white tracking-tight leading-snug">
              {artwork.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-slate-300 font-medium">
              <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">{artwork.year}</span>
              <span>•</span>
              <span className="truncate max-w-[170px] sm:max-w-none">{artwork.medium}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">{artwork.dimensions}</span>
            </div>
          </div>

          {/* Curatorial Text & Notes with high contrast and smooth scroll */}
          <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed border-t border-white/15 pt-2.5 overflow-y-auto pr-1.5 flex-1 scrollbar-thin">
            <p className="font-normal text-slate-200 leading-relaxed">{artwork.description}</p>
            <div className="p-3 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-slate-200 shadow-inner">
              <div className="flex items-center gap-1.5 font-bold text-slate-100 uppercase tracking-wide text-[10px] mb-1">
                <Info className="w-3.5 h-3.5 text-pink-400" />
                <span>Nota Curatorial</span>
              </div>
              <p className="italic font-serif leading-relaxed text-slate-200">
                "{artwork.curatorialNote}"
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions: Navigation & Return to 360° pinned at bottom */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/15 mt-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPrev}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors"
              title="Obra anterior"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors"
              title="Siguiente obra"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-950 hover:bg-yellow-300 shadow-md transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista 360°</span>
          </button>
        </div>
      </div>
    </div>
  );
};
