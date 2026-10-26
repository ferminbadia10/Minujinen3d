import React from 'react';
import { X, Download, Share2, Sparkles } from 'lucide-react';

interface SnapshotModalProps {
  imageDataUrl: string | null;
  onClose: () => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  imageDataUrl,
  onClose,
}) => {
  if (!imageDataUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `MartaMinujin-Galeria-${Date.now()}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        const blob = await (await fetch(imageDataUrl)).blob();
        const file = new File([blob], 'marta-minujin-galeria.png', { type: 'image/png' });
        await navigator.share({
          title: 'Marta Minujín — Sala de Arte Contemporáneo',
          text: '¡Mirá mi captura inmersiva en la sala de Marta Minujín: ¡ARTE, ARTE, ARTE!!',
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl text-slate-100 flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3 self-start">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Captura Inmersiva Realizada</h2>
        </div>

        {/* Image Preview */}
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center mb-4 shadow-inner">
          <img
            src={imageDataUrl}
            alt="Captura 3D Senso3D"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-2.5">
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PNG</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleShare}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
