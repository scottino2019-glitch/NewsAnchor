import React, { useEffect, useRef, useState } from 'react';
import { AvatarCharacter, AvatarPosition } from '../types/news';
import { AVATAR_PROFILES } from '../data/stockAssets';
import { DetailedViseme, lipSyncEngine, REST_VISEME } from '../utils/audioLipSync';

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
  isPlaying = false,
  className = '',
  showDesk = true,
}) => {
  const [viseme, setViseme] = useState<DetailedViseme>(REST_VISEME);
  const [headTilt, setHeadTilt] = useState(0);
  const [breathing, setBreathing] = useState(0);

  const animationFrameRef = useRef<number | null>(null);

  const profile = AVATAR_PROFILES.find((p) => p.id === character) || AVATAR_PROFILES[0];
  const activePhoto =
    character === 'custom' && customAvatarUrl ? customAvatarUrl : profile.photoUrl;

  useEffect(() => {
    const startTime = performance.now();

    const loop = (time: number) => {
      // 1. Update lip sync from audio engine
      const currentViseme = lipSyncEngine.update(sensitivity, mouthRange);
      setViseme(currentViseme);

      // 2. Subtle breathing and speaking head sway
      const elapsedSec = (time - startTime) / 1000;
      const breathVal = Math.sin(elapsedSec * 1.8) * 1.5;
      setBreathing(breathVal);

      if (currentViseme.openness > 0.12) {
        const speechNod = Math.sin(elapsedSec * 5.5) * 0.8 * currentViseme.openness;
        setHeadTilt(speechNod);
      } else {
        setHeadTilt(Math.sin(elapsedSec * 0.8) * 0.25);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sensitivity, mouthRange, isPlaying]);

  // ViewBox coordinate system 896 x 1200 (exact 1:1 match to native 896x1200 anchor portraits)
  const mc = profile.mouthCoords;
  const mouthCenterX = mc.x * 896;
  const mouthCenterY = mc.y * 1200 + viseme.jawDrop * 1.5;

  // Realistic natural half-width (matching actual lip width on photo)
  const mouthHalfW = (mc.w * 896 * 0.5) * (0.92 + viseme.width * 0.12);
  // Restrained natural vertical opening (max 6.5px, subtle human speech articulation)
  const mouthH = Math.min(6.5, viseme.openness * 14 * mouthRange);
  const mouthOpacity = Math.max(0, Math.min(0.85, (viseme.openness - 0.07) * 4.5));

  const leftCornerX = mouthCenterX - mouthHalfW;
  const rightCornerX = mouthCenterX + mouthHalfW;
  const cornerY = mouthCenterY;

  const upperLipPeakY = mouthCenterY - mouthH * 0.45;
  const lowerLipBottomY = mouthCenterY + mouthH * 0.75;

  const mouthCavityPath = `
    M ${leftCornerX} ${cornerY}
    Q ${mouthCenterX} ${upperLipPeakY} ${rightCornerX} ${cornerY}
    Q ${mouthCenterX} ${lowerLipBottomY} ${leftCornerX} ${cornerY}
    Z
  `;

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
        className="relative transition-transform duration-300 origin-bottom flex flex-col items-center justify-end"
        style={{
          transform: `scale(${scale}) translateY(${breathing * 0.4}px) rotate(${headTilt * 0.25}deg)`,
          height: '100%',
        }}
      >
        {/* Photorealistic Television Anchor Container - Preserves Full Headroom */}
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
              <linearGradient id="tonguePhoto" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#9f1239" />
              </linearGradient>
            </defs>

            {/* Speaking Dynamic Mouth - Subtle, Natural, Beautifully Blended */}
            {mouthOpacity > 0.05 ? (
              <g opacity={mouthOpacity}>
                {/* 1. Subtle, Soft Mouth Interior Shadow */}
                <path d={mouthCavityPath} fill="url(#mouthInteriorPhoto)" opacity="0.82" />

                {/* 2. Gentle Upper Teeth Peeking (Subtle white hairline) */}
                {viseme.teethVisible > 0.2 && viseme.openness > 0.12 && (
                  <path
                    d={`M ${mouthCenterX - mouthHalfW * 0.55} ${upperLipPeakY + 1}
                       Q ${mouthCenterX} ${upperLipPeakY + 2.5} ${mouthCenterX + mouthHalfW * 0.55} ${upperLipPeakY + 1}`}
                    stroke="#ffffff"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.9"
                  />
                )}

                {/* 3. Soft Natural Lip Parting Lines matching human lip tone */}
                <path
                  d={`M ${leftCornerX} ${cornerY} Q ${mouthCenterX} ${upperLipPeakY - 0.5} ${rightCornerX} ${cornerY}`}
                  stroke="#9f3747"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.55"
                />
                <path
                  d={`M ${leftCornerX} ${cornerY} Q ${mouthCenterX} ${lowerLipBottomY + 1} ${rightCornerX} ${cornerY}`}
                  stroke="#b54356"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.6"
                />
              </g>
            ) : null}
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
