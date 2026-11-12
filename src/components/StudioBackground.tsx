import React from 'react';
import { BackgroundTheme } from '../types/news';

interface StudioBackgroundProps {
  theme: BackgroundTheme;
  customImageUrl?: string;
  customBackgroundColor?: string;
  customGradientFrom?: string;
  customGradientTo?: string;
  className?: string;
}

export const StudioBackground: React.FC<StudioBackgroundProps> = ({
  theme = 'neutral_studio',
  customImageUrl,
  customBackgroundColor,
  customGradientFrom,
  customGradientTo,
  className = '',
}) => {
  // 1. CUSTOM IMAGE BACKGROUND (FROM UPLOAD OR URL)
  if (theme === 'custom' || customImageUrl) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        {customImageUrl ? (
          <img
            src={customImageUrl}
            alt="Studio Background"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-900" />
        )}
        {/* Subtle cinematic studio vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60" />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden select-none ${className}`}>
      {/* 2. NEUTRAL STUDIO (MODERNO & PULITO) */}
      {theme === 'neutral_studio' && (
        <div className="relative w-full h-full bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617]">
          {/* Soft overhead studio spotlight */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-slate-400/10 blur-[130px] rounded-full pointer-events-none" />
          {/* Subtle architectural vertical lines */}
          <div className="absolute inset-0 opacity-15">
            <div className="w-full h-full flex justify-around">
              <div className="w-px h-full bg-gradient-to-b from-transparent via-slate-400 to-transparent" />
              <div className="w-px h-full bg-gradient-to-b from-transparent via-slate-400 to-transparent" />
              <div className="w-px h-full bg-gradient-to-b from-transparent via-slate-400 to-transparent" />
            </div>
          </div>
          {/* Bottom vignette */}
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
      )}

      {/* 3. NEUTRAL GRADIENT (PERSONALIZZABILE) */}
      {theme === 'neutral_gradient' && (
        <div
          className="relative w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${customGradientFrom || '#1e293b'} 0%, ${customGradientTo || '#020617'} 100%)`,
          }}
        >
          {/* Subtle radial ambient center highlight */}
          <div className="absolute inset-0 bg-radial from-white/5 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
      )}

      {/* 4. NEUTRAL BOKEH (PROFONDITÀ DI CAMPO MORBIDA) */}
      {theme === 'neutral_bokeh' && (
        <div className="relative w-full h-full bg-gradient-to-b from-[#18181b] via-[#09090b] to-[#000000]">
          {/* Soft blurred bokeh orbs */}
          <div className="absolute top-16 left-1/6 w-52 h-52 bg-slate-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-28 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-1/12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-slate-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
      )}

      {/* 5. NEUTRAL SOLID (NERO BROADCAST ASSOLUTO) */}
      {theme === 'neutral_solid' && (
        <div
          className="relative w-full h-full"
          style={{
            backgroundColor: customBackgroundColor || '#090d16',
          }}
        >
          {/* Gentle edge drop shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />
        </div>
      )}

      {/* 6. NEWSROOM CLASSIC */}
      {theme === 'newsroom_classic' && (
        <div className="relative w-full h-full bg-gradient-to-br from-[#0a0e1a] via-[#111936] to-[#080b14]">
          <div className="absolute top-0 left-1/4 w-96 h-full bg-blue-500/10 blur-3xl transform -rotate-12 pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-full bg-indigo-500/10 blur-3xl transform rotate-12 pointer-events-none" />
          <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#38bdf8" opacity="0.3" />
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" />
          </svg>
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>
      )}

      {/* 7. BREAKING RED ALERT */}
      {theme === 'breaking_red' && (
        <div className="relative w-full h-full bg-gradient-to-br from-[#1a0508] via-[#2c0a0f] to-[#0d0204]">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-600/20 blur-[100px] rounded-full pointer-events-none animate-pulse" />
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="40%" r="120" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="6 4" />
            <circle cx="50%" cy="40%" r="220" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
          </svg>
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
      )}

      {/* 8. CYBER GLOBE */}
      {theme === 'cyber_globe' && (
        <div className="relative w-full h-full bg-gradient-to-br from-[#03131e] via-[#052136] to-[#020a12]">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>
      )}

      {/* 9. FINANCIAL BLUE */}
      {theme === 'financial_blue' && (
        <div className="relative w-full h-full bg-gradient-to-br from-[#071328] via-[#0c1e3d] to-[#050b18]">
          <div className="absolute top-0 right-1/3 w-80 h-full bg-blue-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>
      )}
    </div>
  );
};
