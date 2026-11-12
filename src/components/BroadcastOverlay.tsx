import React, { useEffect, useState } from 'react';
import { BroadcastSettings } from '../types/news';

interface BroadcastOverlayProps {
  settings: BroadcastSettings;
  currentCategory: string;
  currentHeadline: string;
  currentSubHeadline: string;
  className?: string;
}

export const BroadcastOverlay: React.FC<BroadcastOverlayProps> = ({
  settings,
  currentCategory,
  currentHeadline,
  currentSubHeadline,
  className = '',
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tickerText = settings.tickerItems.join('   •   ');

  return (
    <div className={`absolute inset-0 z-30 pointer-events-none select-none flex flex-col justify-between p-4 md:p-6 ${className}`}>
      {/* TOP BAR: CHANNEL BUG & LIVE INDICATOR */}
      <div className="flex items-center justify-between w-full">
        {/* Channel Logo Bug */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-lg border border-white/20 backdrop-blur-md"
            style={{ backgroundColor: `${settings.primaryColor}E6` }}
          >
            <span className="font-black text-white text-xs md:text-sm tracking-widest font-mono">
              {settings.channelLogoText || 'TG24'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
              {settings.liveBadgeText || 'DIRETTA'}
            </span>
          </div>

          <div className="hidden sm:flex items-center px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white font-mono text-[11px] backdrop-blur-xs">
            {settings.channelName || 'TG NOTIZIE 24'}
          </div>
        </div>

        {/* Top Right: Studio Clock & REC Indicator */}
        <div className="flex items-center gap-2">
          {settings.showClock && (
            <div className="px-2.5 py-1 rounded bg-black/70 border border-white/10 text-slate-200 font-mono text-xs font-semibold backdrop-blur-xs shadow-md">
              {timeStr}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-600/80 text-white font-mono text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>HD LIVE</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: LOWER THIRD BANNER & SCROLLING TICKER */}
      <div className="w-full space-y-2">
        {/* LOWER THIRD CHYRON BANNER */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl border-l-6 border-white/90 bg-slate-950/95 backdrop-blur-md">
          {/* Accent top edge */}
          <div
            className="h-1.5 w-full"
            style={{ backgroundColor: settings.primaryColor }}
          />

          <div className="px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex-1 min-w-0">
              {/* Category Pill Tag */}
              <div className="flex items-center gap-2.5 mb-1.5">
                <span
                  className="px-3 py-0.5 rounded-md font-black text-white text-xs sm:text-sm tracking-wider uppercase font-mono shadow-sm"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  {currentCategory || 'NOTIZIE'}
                </span>
                <span className="text-slate-300 font-mono text-xs sm:text-sm uppercase tracking-wider font-bold">
                  • EDIZIONE SPECIALE
                </span>
              </div>

              {/* Main Bold Headline - Big and High Legibility */}
              <h3 className="text-white font-black text-lg sm:text-2xl md:text-3xl tracking-tight leading-snug line-clamp-2 drop-shadow-lg">
                {currentHeadline || 'Ultime notizie in diretta dallo studio centrale'}
              </h3>

              {/* Sub-headline / Details */}
              {currentSubHeadline && (
                <p className="text-slate-200 text-xs sm:text-base md:text-lg mt-1 line-clamp-1 font-semibold">
                  {currentSubHeadline}
                </p>
              )}
            </div>

            {/* Right Mini Teleprompter / Channel Tag */}
            <div className="hidden lg:flex flex-col items-end pl-5 border-l border-slate-700/80 shrink-0">
              <span className="font-mono text-xs text-slate-400 font-bold">STUDIO CENTRALE</span>
              <span className="font-black text-white text-sm md:text-base font-mono">{settings.channelName}</span>
            </div>
          </div>
        </div>

        {/* SCROLLING CONTINUOUS NEWS TICKER */}
        {settings.showTicker && (
          <div className="relative flex items-center h-9 sm:h-11 md:h-12 rounded-lg bg-black/98 border border-slate-700 overflow-hidden shadow-2xl">
            {/* Ticker Lead-In Label */}
            <div
              className="flex items-center gap-2 px-4 h-full text-white font-black text-xs sm:text-sm md:text-base font-mono tracking-wider shrink-0 z-10 shadow-lg"
              style={{ backgroundColor: settings.primaryColor }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>FLASH NEWS</span>
            </div>

            {/* Marquee Container */}
            <div className="flex-1 overflow-hidden whitespace-nowrap relative">
              <div className="inline-block animate-marquee font-mono text-xs sm:text-sm md:text-base text-slate-100 font-bold tracking-wide">
                <span>{tickerText}</span>
                <span className="mx-8 text-red-500 font-black">•</span>
                <span>{tickerText}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
