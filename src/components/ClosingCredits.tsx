import React, { useEffect, useRef, useState } from 'react';
import { CreditsSettings, CreditsFontSize } from '../types/news';
import { X, RotateCcw, ZoomIn, ZoomOut, Type } from 'lucide-react';

interface ClosingCreditsProps {
  settings: CreditsSettings;
  channelName: string;
  onClose: () => void;
  onUpdateSettings?: (updated: Partial<CreditsSettings>) => void;
  className?: string;
}

export const ClosingCredits: React.FC<ClosingCreditsProps> = ({
  settings,
  channelName,
  onClose,
  onUpdateSettings,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<CreditsFontSize>(settings.fontSize || 'large');

  // Font size scale mappings - Giant Legible Broadcast Outro Typography
  const sizeStyles = {
    normal: {
      channelTitle: 'text-3xl sm:text-5xl md:text-6xl font-black',
      header: 'text-base sm:text-xl md:text-2xl font-bold',
      subHeader: 'text-sm sm:text-base font-medium',
      role: 'text-base sm:text-lg md:text-xl font-mono font-bold text-rose-400',
      name: 'text-2xl sm:text-3xl md:text-4xl font-black',
      spacing: 'space-y-10 sm:space-y-12',
      itemSpacing: 'space-y-8 sm:space-y-10',
    },
    large: {
      channelTitle: 'text-4xl sm:text-6xl md:text-7xl font-black',
      header: 'text-lg sm:text-2xl md:text-3xl font-bold',
      subHeader: 'text-base sm:text-lg font-medium',
      role: 'text-lg sm:text-xl md:text-2xl font-mono font-extrabold text-rose-400 tracking-wider',
      name: 'text-3xl sm:text-4xl md:text-5xl font-black',
      spacing: 'space-y-12 sm:space-y-16',
      itemSpacing: 'space-y-10 sm:space-y-14',
    },
    extra_large: {
      channelTitle: 'text-5xl sm:text-7xl md:text-8xl font-black',
      header: 'text-xl sm:text-3xl md:text-4xl font-black tracking-widest',
      subHeader: 'text-lg sm:text-xl font-semibold',
      role: 'text-xl sm:text-2xl md:text-3xl font-mono font-black text-rose-400 tracking-widest',
      name: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white',
      spacing: 'space-y-16 sm:space-y-24',
      itemSpacing: 'space-y-14 sm:space-y-20',
    },
  }[fontSize];

  const handleSizeChange = (newSize: CreditsFontSize) => {
    setFontSize(newSize);
    if (onUpdateSettings) {
      onUpdateSettings({ fontSize: newSize });
    }
  };

  const restartScroll = () => {
    if (containerRef.current) {
      const el = containerRef.current.firstElementChild as HTMLElement;
      if (el) {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = `creditsScroll ${settings.scrollDuration || 25}s linear forwards`;
      }
    }
  };

  return (
    <div className={`absolute inset-0 z-40 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between overflow-hidden select-none ${className}`}>
      {/* Top Header & Font Size Toolbar */}
      <div className="w-full flex items-center justify-between p-3 md:p-4 z-50 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-xs md:text-sm text-slate-200 font-bold uppercase tracking-wider">
            TITOLI DI CODA • REGIA FINALE
          </span>
        </div>

        {/* Font Size Quick Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline mr-1">
            DIMENSIONE TESTO:
          </span>
          <button
            onClick={() => handleSizeChange('normal')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              fontSize === 'normal'
                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Normale
          </button>
          <button
            onClick={() => handleSizeChange('large')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              fontSize === 'large'
                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Grande (Consigliato)
          </button>
          <button
            onClick={() => handleSizeChange('extra_large')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              fontSize === 'extra_large'
                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Extra Grande
          </button>

          <button
            onClick={onClose}
            className="ml-2 flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Chiudi</span>
          </button>
        </div>
      </div>

      {/* Crawling Credits Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full max-w-4xl flex flex-col items-center justify-start overflow-hidden px-4 md:px-8"
      >
        <div
          className={`w-full text-center ${sizeStyles.spacing} animate-credits`}
          style={{
            animationDuration: `${settings.scrollDuration || 25}s`,
          }}
        >
          {/* Header Block */}
          <div className="space-y-3 pt-12 sm:pt-16 pb-4">
            <div className="w-24 sm:w-32 h-1.5 bg-red-600 mx-auto rounded-full shadow-lg" />
            <h2 className={`${sizeStyles.channelTitle} font-black text-white tracking-widest font-mono uppercase drop-shadow-2xl`}>
              {channelName || 'STUDIO TG 24'}
            </h2>
            <p className={`${sizeStyles.header} font-bold tracking-widest text-slate-200 uppercase drop-shadow-lg`}>
              {settings.header || 'PRODUZIONE TELEVISIVA & REGIA'}
            </p>
            <p className={`${sizeStyles.subHeader} text-slate-400 font-medium`}>
              {settings.subHeader || 'Edizione Digitale Autonoma • All Rights Reserved'}
            </p>
          </div>

          {/* Credits List */}
          <div className={`${sizeStyles.itemSpacing} py-4`}>
            {settings.items.map((item) => (
              <div key={item.id} className="space-y-1.5 sm:space-y-2 group">
                {/* Production Role */}
                <div className={`${sizeStyles.role} uppercase tracking-widest text-rose-400 font-extrabold drop-shadow-md`}>
                  {item.role}
                </div>
                {/* Person Name */}
                <div className={`${sizeStyles.name} text-white tracking-wide drop-shadow-xl text-balance`}>
                  {item.name}
                </div>
              </div>
            ))}
          </div>

          {/* Technology & Platform mention */}
          <div className="pt-12 pb-24 space-y-4 border-t border-slate-800/80">
            <div className="font-mono text-xs sm:text-base text-slate-300 font-bold uppercase tracking-wider">
              SISTEMI DI TRASMISSIONE & VISUAL FX
            </div>
            <div className="text-sm sm:text-lg text-slate-200 font-semibold">
              Google Cloud & Neural Audio Text-to-Speech Engine
            </div>
            <div className="text-xs sm:text-sm text-slate-400 pt-4 font-mono">
              © {new Date().getFullYear()} {channelName || 'StudioTG'}. Trasmesso in alta definizione digitale 4K.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full p-3 sm:p-4 flex items-center justify-center gap-3 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
        <button
          onClick={restartScroll}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold transition-all shadow-lg pointer-events-auto border border-slate-700"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Riavvia Scorrimento</span>
        </button>
      </div>
    </div>
  );
};
