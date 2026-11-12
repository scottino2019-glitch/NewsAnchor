import React, { useState, useEffect, useRef } from 'react';
import {
  NewsSlide,
  AvatarSettings,
  BroadcastSettings,
  CreditsSettings,
  LanguageOption,
} from './types/news';
import { SUPPORTED_LANGUAGES } from './data/languages';
import {
  INITIAL_SLIDES,
  INITIAL_CREDITS,
  INITIAL_TICKER,
} from './data/stockAssets';
import { BroadcastStage } from './components/BroadcastStage';
import { SlideManager } from './components/SlideManager';
import { AvatarSettingsPanel } from './components/AvatarSettingsPanel';
import { SpeechSettingsPanel } from './components/SpeechSettingsPanel';
import { BroadcastBrandingPanel } from './components/BroadcastBrandingPanel';
import { CreditsEditorPanel } from './components/CreditsEditorPanel';
import { AiNewsModal } from './components/AiNewsModal';
import { VideoExportModal } from './components/VideoExportModal';
import { ttsService } from './utils/ttsService';
import { canvasBroadcastRenderer } from './utils/canvasBroadcastRenderer';
import { videoRecorder, RecorderState } from './utils/videoRecorder';
import { lipSyncEngine } from './utils/audioLipSync';
import {
  Tv,
  Layers,
  UserCheck,
  Globe,
  Palette,
  ScrollText,
  Sparkles,
  Video,
  Play,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  // State: Slides Rundown
  const [slides, setSlides] = useState<NewsSlide[]>(INITIAL_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // State: Avatar Settings
  const [avatarSettings, setAvatarSettings] = useState<AvatarSettings>({
    character: 'elena',
    position: 'desk_center',
    scale: 1.0,
    lipSyncSensitivity: 0.8,
    mouthMovementRange: 0.65,
    blinkRate: 18,
    headMovement: true,
  });

  // State: Broadcast Graphics & Ticker
  const [broadcastSettings, setBroadcastSettings] = useState<BroadcastSettings>({
    channelName: 'TG NOTIZIE 24',
    channelLogoText: 'TG24',
    primaryColor: '#e11d48', // Crimson Red
    accentColor: '#38bdf8',
    showTicker: true,
    tickerItems: INITIAL_TICKER,
    tickerSpeed: 30,
    showClock: true,
    liveBadgeText: 'DIRETTA',
    fontFamily: 'sans-serif',
  });

  // State: Closing Credits
  const [creditsSettings, setCreditsSettings] = useState<CreditsSettings>({
    enabled: true,
    header: 'PRODUZIONE TELEVISIVA & REGIA',
    subHeader: 'Edizione Notiziario Digitale • All Rights Reserved',
    items: INITIAL_CREDITS,
    scrollDuration: 25,
    showFinalLogo: true,
    fontSize: 'extra_large',
  });

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
    SUPPORTED_LANGUAGES[0] // Italiano
  );
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [selectedVoice, setSelectedVoice] = useState<string>('Google italiano');
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [voiceRate, setVoiceRate] = useState<number>(1.0);
  const [speechStyle, setSpeechStyle] = useState<string>(
    'Clear, professional television news anchor broadcast tone'
  );

  // Studio Flow & Playback
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showCredits, setShowCredits] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'slides' | 'avatar' | 'speech' | 'graphics' | 'credits'
  >('slides');

  // Modals & Export
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Recorder State
  const [recorderState, setRecorderState] = useState<RecorderState>({
    isRecording: false,
    recordedSeconds: 0,
    downloadUrl: null,
    mimeType: 'video/webm',
  });

  // Refs for current values in callbacks
  const activeSlideRef = useRef(slides[activeSlideIndex] || slides[0]);
  activeSlideRef.current = slides[activeSlideIndex] || slides[0];

  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  const activeIndexRef = useRef(activeSlideIndex);
  activeIndexRef.current = activeSlideIndex;

  const avatarRef = useRef(avatarSettings);
  avatarRef.current = avatarSettings;

  const broadcastRef = useRef(broadcastSettings);
  broadcastRef.current = broadcastSettings;

  const creditsRef = useRef(creditsSettings);
  creditsRef.current = creditsSettings;

  const showCreditsRef = useRef(showCredits);
  showCreditsRef.current = showCredits;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const selectedVoiceRef = useRef(selectedVoice);
  selectedVoiceRef.current = selectedVoice;

  const voicePitchRef = useRef(voicePitch);
  voicePitchRef.current = voicePitch;

  const voiceRateRef = useRef(voiceRate);
  voiceRateRef.current = voiceRate;

  const handleToggleCredits = (show: boolean) => {
    setShowCredits(show);
    showCreditsRef.current = show;
  };

  // Handle Play / Stop Broadcast
  const handleTogglePlay = async () => {
    if (isPlaying) {
      ttsService.stopSpeaking();
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    setShowCredits(false);
    showCreditsRef.current = false;
    setIsPlaying(true);
    isPlayingRef.current = true;
    playSlideSequence(activeSlideIndex);
  };

  // Play slide and sequence to next
  const playSlideSequence = async (index: number) => {
    if (index >= slidesRef.current.length) {
      // Finished all slides -> trigger closing credits if enabled
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (creditsRef.current.enabled !== false) {
        setShowCredits(true);
        showCreditsRef.current = true;
      }
      return;
    }

    setActiveSlideIndex(index);
    const current = slidesRef.current[index];
    activeSlideRef.current = current;
    activeIndexRef.current = index;

    await ttsService.speakNews(
      current.script,
      selectedVoiceRef.current,
      selectedLanguage.code,
      () => {
        // When speech finishes, proceed to next slide if still in play mode
        if (isPlayingRef.current) {
          setTimeout(() => {
            if (isPlayingRef.current) {
              playSlideSequence(index + 1);
            }
          }, 800);
        }
      },
      { pitch: voicePitchRef.current, rate: voiceRateRef.current }
    );
  };

  // Preview individual slide
  const handlePreviewSlideSpeech = async (slide: NewsSlide) => {
    ttsService.stopSpeaking();
    setIsPlaying(true);
    isPlayingRef.current = true;
    await ttsService.speakNews(
      slide.script,
      selectedVoiceRef.current,
      selectedLanguage.code,
      () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
      },
      { pitch: voicePitchRef.current, rate: voiceRateRef.current }
    );
  };

  // Recording controls
  const handleStartRecord = async () => {
    setIsExportModalOpen(true);

    // Stop previous audio to start cleanly with the recording
    ttsService.stopSpeaking();

    // Explicitly resume Web Audio context on user gesture
    const ctx = lipSyncEngine.initAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const wasShowingCredits = showCreditsRef.current;

    // Start canvas renderer loop
    canvasBroadcastRenderer.start(
      () => activeSlideRef.current,
      () => avatarRef.current,
      () => broadcastRef.current,
      () => creditsRef.current,
      () => showCreditsRef.current
    );

    const canvas = canvasBroadcastRenderer.getCanvas();
    const success = await videoRecorder.startRecording(canvas, (state) => {
      setRecorderState(state);
    });

    if (success) {
      if (!wasShowingCredits) {
        // Auto-start slide speech simultaneously with video recording
        setIsPlaying(true);
        isPlayingRef.current = true;
        playSlideSequence(activeSlideIndex);
      }
    }
  };

  const handleStopRecord = () => {
    videoRecorder.stopRecording();
    canvasBroadcastRenderer.stop();
    ttsService.stopSpeaking();
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  // Translation across all slides with Google Translate
  const handleTranslateAllSlides = async (targetLang: LanguageOption) => {
    setIsTranslating(true);
    try {
      const updatedSlides = [...slides];
      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];
        const res = await fetch('/api/news/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            headline: slide.headline,
            script: slide.script,
            category: slide.category,
            pipTitle: slide.pipTitle,
            targetLanguage: targetLang.code,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          updatedSlides[i] = {
            ...slide,
            headline: data.translatedHeadline || slide.headline,
            script: data.translatedScript || slide.script,
            category: data.translatedCategory || slide.category,
            pipTitle: data.translatedPipTitle || slide.pipTitle,
          };
        }
      }
      setSlides(updatedSlides);
    } catch (e) {
      console.error('Translation error:', e);
    } finally {
      setIsTranslating(false);
    }
  };

  // Slide Management Handlers
  const handleAddSlide = () => {
    const newSlide: NewsSlide = {
      id: `slide-${Date.now()}`,
      category: 'APPROFONDIMENTO',
      headline: 'Nuovo Servizio TG: Aggiornamenti dallo Studio',
      subHeadline: 'Dettagli e rassegna degli eventi principali',
      script: 'Proseguiamo con il nostro telegiornale. Dalla nostra redazione centrale arrivano nuovi dettagli sul tema in apertura, con le testimonianze degli esperti e i dati aggiornati.',
      showPip: true,
      pipTitle: 'DOSSIER IN DIRETTA',
      pipSubtitle: 'Analisi speciale • Dati aggregati',
      pipTag: 'APPROFONDIMENTO',
      pipImageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
      pipPosition: 'top_right',
      backgroundTheme: 'newsroom_classic',
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleDuplicateSlide = (index: number) => {
    const original = slides[index];
    const copy: NewsSlide = {
      ...original,
      id: `slide-${Date.now()}`,
      headline: `${original.headline} (Copia)`,
    };
    const updated = [...slides];
    updated.splice(index + 1, 0, copy);
    setSlides(updated);
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSlides(updated);
    setActiveSlideIndex(targetIdx);
  };

  const handleApplyAiNews = (generatedData: any) => {
    if (generatedData.channelName) {
      setBroadcastSettings((prev) => ({
        ...prev,
        channelName: generatedData.channelName,
        tickerItems: generatedData.tickerItems || prev.tickerItems,
      }));
    }

    if (Array.isArray(generatedData.slides) && generatedData.slides.length > 0) {
      const formattedSlides: NewsSlide[] = generatedData.slides.map(
        (s: any, idx: number) => ({
          id: s.id || `slide-ai-${idx}`,
          category: s.category || 'NOTIZIA',
          headline: s.headline || 'Edizione Straordinaria',
          subHeadline: s.subHeadline || '',
          script: s.script || '',
          showPip: true,
          pipTitle: s.pipTitle || 'FOCUS NOTIZIA',
          pipSubtitle: s.pipSubtitle || '',
          pipTag: s.pipTag || 'DIRETTA',
          pipImageUrl:
            s.pipImageUrl ||
            'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
          pipPosition: 'top_right',
          backgroundTheme: s.backgroundTheme || 'newsroom_classic',
        })
      );
      setSlides(formattedSlides);
      setActiveSlideIndex(0);
    }

    if (Array.isArray(generatedData.closingCredits)) {
      setCreditsSettings((prev) => ({
        ...prev,
        items: generatedData.closingCredits.map((c: any, i: number) => ({
          id: `c-ai-${i}`,
          role: c.role,
          name: c.name,
        })),
      }));
    }
  };

  const currentSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. TOP BROADCAST CONTROL HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg md:text-xl text-white tracking-tight uppercase">
                StudioTG Creator
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 font-mono text-[10px] font-bold border border-red-500/30 animate-pulse">
                ON AIR 4K
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Notiziario TV con Avatar Parlante, Lip-Sync Google TTS e Grafiche PiP
            </p>
          </div>
        </div>

        {/* Quick Language & Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Language selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <span className="text-base">{selectedLanguage.flag}</span>
            <span className="font-bold text-white hidden md:inline">
              {selectedLanguage.name}
            </span>
          </div>

          {/* Rundown Generator Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 ring-2 ring-red-500/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Nuova Edizione TG</span>
            <span className="sm:hidden">TG</span>
          </button>

          {/* Video Record / Export Button */}
          <button
            onClick={handleStartRecord}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/30 text-xs font-bold transition-all shadow-md"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Esporta Video (.webm)</span>
            <span className="sm:hidden">Rec</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN STUDIO WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* 16:9 BROADCAST MONITOR VIEWPORT & PLAYBACK DECK */}
        <BroadcastStage
          currentSlide={currentSlide}
          currentSlideIndex={activeSlideIndex}
          totalSlides={slides.length}
          isPlaying={isPlaying}
          onPlayToggle={handleTogglePlay}
          onNextSlide={() => {
            if (activeSlideIndex < slides.length - 1) {
              setActiveSlideIndex(activeSlideIndex + 1);
            }
          }}
          onPrevSlide={() => {
            if (activeSlideIndex > 0) {
              setActiveSlideIndex(activeSlideIndex - 1);
            }
          }}
          avatarSettings={avatarSettings}
          broadcastSettings={broadcastSettings}
          creditsSettings={creditsSettings}
          showCredits={showCredits}
          onToggleCredits={handleToggleCredits}
          onUpdateCreditsSettings={(updated) =>
            setCreditsSettings((prev) => ({ ...prev, ...updated }))
          }
          onStartRecord={handleStartRecord}
          onStopRecord={handleStopRecord}
          onUploadPipImage={(dataUrl) => {
            setSlides((prev) => {
              const next = [...prev];
              next[activeSlideIndex] = {
                ...next[activeSlideIndex],
                showPip: true,
                pipImageUrl: dataUrl,
              };
              slidesRef.current = next;
              activeSlideRef.current = next[activeSlideIndex];
              return next;
            });
          }}
          isRecording={recorderState.isRecording}
          recordingSeconds={recorderState.recordedSeconds}
        />

        {/* 3. STUDIO CONTROL TABS */}
        <div className="flex border-b border-slate-800 overflow-x-auto gap-2 pb-1 scrollbar-none">
          {[
            { id: 'slides', label: 'Scaletta Notizie (Slide)', icon: Layers },
            { id: 'avatar', label: 'Avatar & Sincronizzazione Labiale', icon: UserCheck },
            { id: 'speech', label: 'Sintesi Vocale Google TTS Multilingue', icon: Globe },
            { id: 'graphics', label: 'Grafiche TV, Logo & Ticker', icon: Palette },
            { id: 'credits', label: 'Titoli di Coda (Outro Roll)', icon: ScrollText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600/15 text-red-400 border border-red-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB PANELS */}
        <div className="space-y-6">
          {activeTab === 'slides' && (
            <SlideManager
              slides={slides}
              activeSlideIndex={activeSlideIndex}
              onSelectSlide={(idx) => {
                setActiveSlideIndex(idx);
                setShowCredits(false);
              }}
              onUpdateSlide={(idx, updated) => {
                const next = [...slides];
                next[idx] = { ...next[idx], ...updated };
                slidesRef.current = next;
                if (idx === activeSlideIndex) {
                  activeSlideRef.current = next[idx];
                }
                setSlides(next);
              }}
              onAddSlide={handleAddSlide}
              onDuplicateSlide={handleDuplicateSlide}
              onDeleteSlide={handleDeleteSlide}
              onMoveSlide={handleMoveSlide}
              onPreviewSlideSpeech={handlePreviewSlideSpeech}
              onApplyBackgroundToAll={(bgSettings) => {
                setSlides((prev) => prev.map((s) => ({ ...s, ...bgSettings })));
              }}
              isPlaying={isPlaying}
            />
          )}

          {activeTab === 'avatar' && (
            <AvatarSettingsPanel
              settings={avatarSettings}
              onChange={(updated) => {
                setAvatarSettings((prev) => ({ ...prev, ...updated }));
                if (updated.character) {
                  const isMale = ['marco', 'kenji'].includes(updated.character);
                  setVoiceGender(isMale ? 'male' : 'female');
                  if (isMale) {
                    setSelectedVoice((prev) => {
                      const lower = prev.toLowerCase();
                      if (!lower.includes('marco') && !lower.includes('kenji') && !lower.includes('cosimo') && !lower.includes('luca') && !lower.includes('male') && !lower.includes('david')) {
                        return 'studio-it-marco';
                      }
                      return prev;
                    });
                  } else {
                    setSelectedVoice((prev) => {
                      const lower = prev.toLowerCase();
                      if (lower.includes('marco') || lower.includes('kenji')) {
                        return 'studio-it-elena';
                      }
                      return prev;
                    });
                  }
                }
              }}
            />
          )}

          {activeTab === 'speech' && (
            <SpeechSettingsPanel
              selectedLanguage={selectedLanguage}
              onSelectLanguage={(lang) => {
                setSelectedLanguage(lang);
              }}
              selectedVoice={selectedVoice}
              onSelectVoice={(v) => {
                setSelectedVoice(v);
              }}
              voiceGender={voiceGender}
              onChangeVoiceGender={(gender) => {
                setVoiceGender(gender);
              }}
              speechStyle={speechStyle}
              onSelectSpeechStyle={(st) => setSpeechStyle(st)}
              voicePitch={voicePitch}
              onChangeVoicePitch={setVoicePitch}
              voiceRate={voiceRate}
              onChangeVoiceRate={setVoiceRate}
              onTranslateAllSlides={handleTranslateAllSlides}
              isTranslating={isTranslating}
            />
          )}

          {activeTab === 'graphics' && (
            <BroadcastBrandingPanel
              settings={broadcastSettings}
              onChange={(updated) =>
                setBroadcastSettings((prev) => ({ ...prev, ...updated }))
              }
            />
          )}

          {activeTab === 'credits' && (
            <CreditsEditorPanel
              settings={creditsSettings}
              onChange={(updated) =>
                setCreditsSettings((prev) => ({ ...prev, ...updated }))
              }
              onPreviewCredits={() => handleToggleCredits(true)}
            />
          )}
        </div>
      </main>

      {/* 4. MODALS */}
      <AiNewsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={handleApplyAiNews}
        currentLanguage={selectedLanguage}
        anchorCharacter={avatarSettings.character}
      />

      <VideoExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        isRecording={recorderState.isRecording}
        recordingSeconds={recorderState.recordedSeconds}
        downloadUrl={recorderState.downloadUrl}
        onStartRecord={handleStartRecord}
        onStopRecord={handleStopRecord}
        channelName={broadcastSettings.channelName}
        showCredits={showCredits}
      />
    </div>
  );
}
