import React, { useRef, useEffect, useState } from 'react';
import { NewsSlide, AvatarSettings, BroadcastSettings, CreditsSettings } from '../types/news';
import { StudioBackground } from './StudioBackground';
import { PictureInPicture } from './PictureInPicture';
import { AvatarRenderer } from './AvatarRenderer';
import { BroadcastOverlay } from './BroadcastOverlay';
import { ClosingCredits } from './ClosingCredits';
import { Play, Pause, SkipForward, SkipBack, Maximize, Film, ScrollText, Volume2, Video } from 'lucide-react';

interface BroadcastStageProps {
  currentSlide: NewsSlide;
  currentSlideIndex: number;
  totalSlides: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  avatarSettings: AvatarSettings;
  broadcastSettings: BroadcastSettings;
  creditsSettings: CreditsSettings;
  showCredits: boolean;
  onToggleCredits: (show: boolean) => void;
  onUpdateCreditsSettings?: (updated: Partial<CreditsSettings>) => void;
  onStartRecord: () => void;
  onStopRecord?: () => void;
  onUploadPipImage?: (dataUrl: string) => void;
  isRecording: boolean;
  recordingSeconds: number;
}

export const BroadcastStage: React.FC<BroadcastStageProps> = ({
  currentSlide,
  currentSlideIndex,
  totalSlides,
  isPlaying,
  onPlayToggle,
  onNextSlide,
  onPrevSlide,
  avatarSettings,
  broadcastSettings,
  creditsSettings,
  showCredits,
  onToggleCredits,
  onUpdateCreditsSettings,
  onStartRecord,
  onStopRecord,
  onUploadPipImage,
  isRecording,
  recordingSeconds,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col w-full">
      {/* 16:9 BROADCAST MONITOR VIEWPORT */}
      <div
        ref={containerRef}
        id="broadcast-stage"
        className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-black group select-none"
      >
        {/* Safe Area Guides */}
        <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-lg" />

        {/* 1. STUDIO BACKGROUND */}
        <StudioBackground
          theme={currentSlide.backgroundTheme}
          customImageUrl={currentSlide.customBackgroundUrl}
          customBackgroundColor={currentSlide.customBackgroundColor}
          customGradientFrom={currentSlide.customGradientFrom}
          customGradientTo={currentSlide.customGradientTo}
        />

        {/* 2. PICTURE-IN-PICTURE (OVER-THE-SHOULDER GRAPHIC) */}
        <PictureInPicture
          show={currentSlide.showPip}
          title={currentSlide.pipTitle}
          subtitle={currentSlide.pipSubtitle}
          tag={currentSlide.pipTag}
          imageUrl={currentSlide.pipImageUrl}
          position={currentSlide.pipPosition}
          onUploadImage={onUploadPipImage}
        />

        {/* 3. TALKING NEWS ANCHOR AVATAR */}
        <AvatarRenderer
          character={avatarSettings.character}
          customAvatarUrl={avatarSettings.customAvatarUrl}
          position={avatarSettings.position}
          scale={avatarSettings.scale}
          sensitivity={avatarSettings.lipSyncSensitivity}
          mouthRange={avatarSettings.mouthMovementRange}
          isPlaying={isPlaying}
        />

        {/* 4. BROADCAST GRAPHICS OVERLAY (LOWER THIRD & TICKER) */}
        {!showCredits && (
          <BroadcastOverlay
            settings={broadcastSettings}
            currentCategory={currentSlide.category}
            currentHeadline={currentSlide.headline}
            currentSubHeadline={currentSlide.subHeadline}
          />
        )}

        {/* 5. CLOSING CREDITS CRAWL */}
        {showCredits && (
          <ClosingCredits
            settings={creditsSettings}
            channelName={broadcastSettings.channelName}
            onClose={() => onToggleCredits(false)}
            onUpdateSettings={onUpdateCreditsSettings}
          />
        )}

        {/* ON-AIR RECORDING WATERMARK BADGE */}
        {isRecording && (
          <div className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-600/90 text-white font-mono text-xs font-bold shadow-lg animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span>REC {formatRecTime(recordingSeconds)}</span>
          </div>
        )}
      </div>

      {/* BROADCAST CONTROL DECK BAR */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left: Playback & Slide Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevSlide}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
            title="Slide Precedente"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayToggle}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white ring-2 ring-red-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>In Pausa</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Manda in Onda</span>
              </>
            )}
          </button>

          <button
            onClick={onNextSlide}
            disabled={currentSlideIndex >= totalSlides - 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
            title="Slide Successiva"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="ml-2 px-3 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs font-semibold">
            Slide {currentSlideIndex + 1} / {totalSlides}
          </div>
        </div>

        {/* Center: Live Audio Wave Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
          <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <div className="flex items-end gap-0.5 h-4 w-16">
            <span className={`w-1 rounded-full ${isPlaying ? 'bg-emerald-500 h-3 animate-pulse' : 'bg-slate-700 h-1'}`} />
            <span className={`w-1 rounded-full ${isPlaying ? 'bg-emerald-400 h-4 animate-bounce' : 'bg-slate-700 h-1'}`} />
            <span className={`w-1 rounded-full ${isPlaying ? 'bg-emerald-500 h-2 animate-pulse' : 'bg-slate-700 h-1'}`} />
            <span className={`w-1 rounded-full ${isPlaying ? 'bg-emerald-300 h-4 animate-bounce' : 'bg-slate-700 h-1'}`} />
            <span className={`w-1 rounded-full ${isPlaying ? 'bg-emerald-500 h-3 animate-pulse' : 'bg-slate-700 h-1'}`} />
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            {isPlaying ? 'AUDIO ON AIR' : 'PRONTO'}
          </span>
        </div>

        {/* Right: Credits, Record & Fullscreen Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleCredits(!showCredits)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              showCredits
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Visualizza Titoli di Coda"
          >
            <ScrollText className="w-4 h-4" />
            <span>Titoli di Coda</span>
          </button>

          <button
            onClick={isRecording ? (onStopRecord || onStartRecord) : onStartRecord}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
              isRecording
                ? 'bg-red-700 hover:bg-red-600 text-white ring-2 ring-red-400 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/30'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>{isRecording ? 'Interrompi Rec' : 'Registra Video'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Schermo Intero"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
