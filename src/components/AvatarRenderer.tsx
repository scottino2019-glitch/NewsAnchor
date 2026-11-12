import React, { useEffect, useRef } from 'react';
import { AvatarCharacter, AvatarPosition } from '../types/news';
import { AVATAR_PROFILES } from '../data/stockAssets';
import { lipSyncEngine } from '../utils/audioLipSync';

interface AvatarRendererProps {
  character: AvatarCharacter;
  customAvatarUrl?: string;
  position: AvatarPosition;
  scale?: number;
  sensitivity?: number;
  mouthRange?: number;
  isPlaying?: boolean;
  className?: string;
  showDesk?: boolean;
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  character = 'elena',
  customAvatarUrl,
  position = 'desk_center',
  scale = 1.0,
  sensitivity = 1.0,
  mouthRange = 1.0,
  className = '',
  showDesk = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouthGroupRef = useRef<SVGGElement>(null);
  const mouthCavityRef = useRef<SVGPathElement>(null);
  const teethRef = useRef<SVGPathElement>(null);
  const upperLipRef = useRef<SVGPathElement>(null);
  const lowerLipRef = useRef<SVGPathElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const profile = AVATAR_PROFILES.find((p) => p.id === character) || AVATAR_PROFILES[0];
  const activePhoto =
    character === 'custom' && customAvatarUrl ? customAvatarUrl : profile.photoUrl;

  useEffect(() => {
    const startTime = performance.now();
    const mc = profile.mouthCoords;
    const baseMouthCenterX = mc.x * 896;
    const baseMouthCenterY = mc.y * 1200;
    const baseMouthHalfW = mc.w * 896 * 0.5;

    const loop = (time: number) => {
      // 1. Update lip sync from audio engine
      const viseme = lipSyncEngine.update(sensitivity, mouthRange);

      // 2. Subtle breathing and speaking head sway
      const elapsedSec = (time - startTime) / 1000;
      const breathVal = Math.sin(elapsedSec * 1.8) * 1.5;
      const speechNod =
        viseme.openness > 0.12
          ? Math.sin(elapsedSec * 5.5) * 0.8 * viseme.openness
          : Math.sin(elapsedSec * 0.8) * 0.25;

      // Direct DOM update: container transform without React re-render
      if (containerRef.current) {
        containerRef.current.style.transform = `scale(${scale}) translateY(${breathVal * 0.4}px) rotate(${speechNod * 0.25}deg)`;
      }

      // 3. Mouth coordinates and paths
      const mouthOpacity = Math.max(0, Math.min(0.85, (viseme.openness - 0.07) * 4.5));

      if (mouthGroupRef.current) {
        if (mouthOpacity <= 0.05) {
          mouthGroupRef.current.style.opacity = '0';
        } else {
          mouthGroupRef.current.style.opacity = String(mouthOpacity);

          const mouthCenterX = baseMouthCenterX;
          const mouthCenterY = baseMouthCenterY + (viseme.jawDrop || 0) * 1.5;
          const mouthHalfW = baseMouthHalfW * (0.92 + viseme.width * 0.12);
          const mouthH = Math.min(6.5, viseme.openness * 14 * mouthRange);

          const leftCornerX = mouthCenterX - mouthHalfW;
          const rightCornerX = mouthCenterX + mouthHalfW;
          const cornerY = mouthCenterY;
          const upperLipPeakY = mouthCenterY - mouthH * 0.45;
          const lowerLipBottomY = mouthCenterY + mouthH * 0.75;

          const mouthCavityPath = `M ${leftCornerX} ${cornerY} Q ${mouthCenterX} ${upperLipPeakY} ${rightCornerX} ${cornerY} Q ${mouthCenterX} ${lowerLipBottomY} ${leftCornerX} ${cornerY} Z`;
          if (mouthCavityRef.current) {
            mouthCavityRef.current.setAttribute('d', mouthCavityPath);
          }

          if (teethRef.current) {
            if (viseme.teethVisible > 0.2 && viseme.openness > 0.12) {
              const teethPath = `M ${mouthCenterX - mouthHalfW * 0.55} ${upperLipPeakY + 1} Q ${mouthCenterX} ${upperLipPeakY + 2.5} ${mouthCenterX + mouthHalfW * 0.55} ${upperLipPeakY + 1}`;
              teethRef.current.setAttribute('d', teethPath);
              teethRef.current.style.opacity = '0.9';
            } else {
              teethRef.current.style.opacity = '0';
            }
          }

          if (upperLipRef.current) {
            upperLipRef.current.setAttribute(
              'd',
              `M ${leftCornerX} ${cornerY} Q ${mouthCenterX} ${upperLipPeakY - 0.5} ${rightCornerX} ${cornerY}`
            );
          }

          if (lowerLipRef.current) {
            lowerLipRef.current.setAttribute(
              'd',
              `M ${leftCornerX} ${cornerY} Q ${mouthCenterX} ${lowerLipBottomY + 1} ${rightCornerX} ${cornerY}`
            );
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [profile, sensitivity, mouthRange, scale]);

  // Horizontal position alignment
  let posClass = 'justify-center items-end';
  if (position === 'desk_left') {
    posClass = 'justify-start pl-8 md:pl-16 items-end';
  } else if (position === 'desk_right') {
    posClass = 'justify-end pr-8 md:pr-16 items-end';
  }

  return (
    <div className={`absolute inset-0 z-10 flex w-full h-full pointer-events-none select-none ${posClass} ${className}`}>
      <div
        ref={containerRef}
        className="relative transition-transform duration-100 origin-bottom flex flex-col items-center justify-end"
        style={{
          transform: `scale(${scale})`,
          height: '100%',
        }}
      >
        {/* Photorealistic Television Anchor Container */}
        <div className="relative h-[86%] aspect-[896/1200] max-h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/60 bg-slate-950">
          <img
            src={activePhoto}
            alt={profile.name}
            className="w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Dynamic Synchronized Broadcast Viseme Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 896 1200"
          >
            <defs>
              <radialGradient id="mouthInteriorPhoto" cx="50%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#300a12" />
                <stop offset="65%" stopColor="#180408" />
                <stop offset="100%" stopColor="#080103" />
              </radialGradient>
            </defs>

            {/* Speaking Dynamic Mouth */}
            <g ref={mouthGroupRef} style={{ opacity: 0 }}>
              {/* 1. Subtle, Soft Mouth Interior Shadow */}
              <path ref={mouthCavityRef} fill="url(#mouthInteriorPhoto)" opacity="0.82" />

              {/* 2. Gentle Upper Teeth Peeking */}
              <path
                ref={teethRef}
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
                style={{ opacity: 0 }}
              />

              {/* 3. Soft Natural Lip Parting Lines */}
              <path
                ref={upperLipRef}
                stroke="#9f3747"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
                opacity="0.55"
              />
              <path
                ref={lowerLipRef}
                stroke="#b54356"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
            </g>
          </svg>

          {/* Television Studio Desk Countertop Overlay at bottom */}
          {showDesk && (
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent border-t border-sky-400/40 shadow-xl flex items-center justify-center">
              <div className="w-3/4 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-80" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
