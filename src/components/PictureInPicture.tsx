import React, { useRef } from 'react';
import { PipPosition } from '../types/news';
import { Upload, Camera } from 'lucide-react';

interface PictureInPictureProps {
  show: boolean;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  position?: PipPosition;
  onUploadImage?: (dataUrl: string) => void;
  className?: string;
}

export const PictureInPicture: React.FC<PictureInPictureProps> = ({
  show,
  title,
  subtitle,
  tag,
  imageUrl,
  position = 'top_right',
  onUploadImage,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!show) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onUploadImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  let posStyles = 'top-6 right-8 w-72 md:w-84';
  if (position === 'top_left') {
    posStyles = 'top-6 left-8 w-72 md:w-84';
  } else if (position === 'corner_large') {
    posStyles = 'top-8 right-8 w-80 md:w-96';
  } else if (position === 'split_screen') {
    posStyles = 'top-6 right-6 w-1/2 max-w-lg h-[65%]';
  }

  return (
    <div
      className={`absolute z-30 transition-all duration-500 ease-out transform ${posStyles} ${className}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-900/95 backdrop-blur-md group">
        {/* Glow border ring */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-sky-500 to-indigo-600 rounded-xl opacity-40 blur-sm" />

        <div className="relative">
          {/* Main Visual Image Area */}
          <div className="relative w-full h-44 md:h-52 bg-slate-950 overflow-hidden group/image">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-900">
                <Camera className="w-8 h-8 text-sky-400 mb-2" />
                <span className="text-xs text-white font-bold">Nessuna Immagine PiP</span>
                <span className="text-[10px] text-slate-400 mt-1">Carica una foto dal tuo computer</span>
              </div>
            )}

            {/* Dark gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

            {/* LIVE / TOPIC BADGE */}
            {tag && (
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600/95 text-white font-mono text-[10px] font-bold tracking-wider shadow-lg pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>{tag.toUpperCase()}</span>
              </div>
            )}

            {/* DIRECT PC UPLOAD BUTTON ON PiP */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-600/90 hover:bg-sky-500 text-white font-mono text-[11px] font-bold shadow-lg transition-all border border-sky-400/30 backdrop-blur-xs cursor-pointer z-20 pointer-events-auto"
              title="Carica una foto dal tuo computer per il riquadro PiP"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Carica Foto PC</span>
            </button>
          </div>

          {/* LOWER CAPTION BAR */}
          <div className="p-3 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
            <h4 className="text-white font-black text-sm md:text-base tracking-wide uppercase line-clamp-1 drop-shadow">
              {title || 'IMMAGINE FOCUS'}
            </h4>
            {subtitle && (
              <p className="text-slate-200 text-xs mt-0.5 line-clamp-2 font-semibold">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
