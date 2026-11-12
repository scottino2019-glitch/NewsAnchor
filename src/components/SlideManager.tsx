import React, { useRef, useState } from 'react';
import { NewsSlide, BackgroundTheme, PipPosition } from '../types/news';
import { BACKGROUND_PRESETS, STOCK_PIP_IMAGES } from '../data/stockAssets';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Volume2,
  Sparkles,
  Image as ImageIcon,
  Layout,
  Layers,
  Upload,
  Palette,
  Check,
} from 'lucide-react';

interface SlideManagerProps {
  slides: NewsSlide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onUpdateSlide: (index: number, updated: Partial<NewsSlide>) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (index: number, direction: 'up' | 'down') => void;
  onPreviewSlideSpeech: (slide: NewsSlide) => void;
  onApplyBackgroundToAll?: (bg: Partial<NewsSlide>) => void;
  isPlaying: boolean;
}

export const SlideManager: React.FC<SlideManagerProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onUpdateSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  onPreviewSlideSpeech,
  onApplyBackgroundToAll,
  isPlaying,
}) => {
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const pipFileInputRef = useRef<HTMLInputElement>(null);
  const [appliedToAllSuccess, setAppliedToAllSuccess] = useState(false);
  const activeSlide = slides[activeSlideIndex] || slides[0];

  const calculateReadingTime = (text: string) => {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
    const seconds = Math.ceil((words / 130) * 60);
    return { words, seconds };
  };

  const activeStats = calculateReadingTime(activeSlide?.script || '');

  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onUpdateSlide(activeSlideIndex, {
          backgroundTheme: 'custom',
          customBackgroundUrl: dataUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePipFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onUpdateSlide(activeSlideIndex, {
          pipImageUrl: dataUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyToAll = () => {
    if (onApplyBackgroundToAll) {
      onApplyBackgroundToAll({
        backgroundTheme: activeSlide.backgroundTheme,
        customBackgroundUrl: activeSlide.customBackgroundUrl,
        customBackgroundColor: activeSlide.customBackgroundColor,
        customGradientFrom: activeSlide.customGradientFrom,
        customGradientTo: activeSlide.customGradientTo,
      });
      setAppliedToAllSuccess(true);
      setTimeout(() => setAppliedToAllSuccess(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. HORIZONTAL SLIDE TIMELINE / RUNDOWN CAROUSEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-white text-sm tracking-wide">
              SCALETTA NOTIZIE (SLIDE BROADCAST)
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
              {slides.length} Notizie
            </span>
          </div>

          <button
            onClick={onAddSlide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aggiungi Notizia</span>
          </button>
        </div>

        {/* Slide Rundown Grid/List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {slides.map((slide, idx) => {
            const isSelected = idx === activeSlideIndex;
            const stats = calculateReadingTime(slide.script);

            return (
              <div
                key={slide.id || idx}
                onClick={() => onSelectSlide(idx)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-slate-800/90 border-red-500 ring-2 ring-red-500/30 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Top index and category */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase bg-red-950/80 text-red-300 border border-red-800/40">
                    {slide.category || 'NOTIZIA'}
                  </span>
                </div>

                {/* Headline preview */}
                <h4 className="text-white font-bold text-xs line-clamp-2 leading-snug min-h-[2.5rem]">
                  {slide.headline || 'Nuova notizia senza titolo'}
                </h4>

                {/* PiP badge and duration info */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    {slide.showPip && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-800/40 font-mono">
                        PiP
                      </span>
                    )}
                    <span>{stats.seconds}s</span>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idx > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveSlide(idx, 'up');
                        }}
                        className="p-1 hover:text-white"
                        title="Sposta prima"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                    )}
                    {idx < slides.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveSlide(idx, 'down');
                        }}
                        className="p-1 hover:text-white"
                        title="Sposta dopo"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateSlide(idx);
                      }}
                      className="p-1 hover:text-white"
                      title="Duplica notizia"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {slides.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSlide(idx);
                        }}
                        className="p-1 hover:text-red-400"
                        title="Elimina"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ACTIVE SLIDE DETAILED BROADCAST EDITOR */}
      {activeSlide && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-red-400 font-bold">
                  EDIT NOTIZIA #{activeSlideIndex + 1}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400">
                  {activeStats.words} parole (~{activeStats.seconds} sec di lettura)
                </span>
              </div>
              <h3 className="text-white font-black text-lg mt-0.5">
                Dettagli Notizia, Grafica e Script Vocale
              </h3>
            </div>

            <button
              onClick={() => onPreviewSlideSpeech(activeSlide)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-md border border-slate-700"
            >
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Ascolta & Prova Visemi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Lower Third & Script */}
            <div className="lg:col-span-2 space-y-4">
              {/* Category & Headline */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={activeSlide.category}
                    onChange={(e) =>
                      onUpdateSlide(activeSlideIndex, { category: e.target.value })
                    }
                    placeholder="ES: ULTIM’ORA"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold uppercase focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                    Titolo Principale (Lower-Third)
                  </label>
                  <input
                    type="text"
                    value={activeSlide.headline}
                    onChange={(e) =>
                      onUpdateSlide(activeSlideIndex, { headline: e.target.value })
                    }
                    placeholder="Titolo che compare nella fascia inferiore del TG"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Sub-Headline */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                  Sottotitolo / Dettaglio Notizia
                </label>
                <input
                  type="text"
                  value={activeSlide.subHeadline}
                  onChange={(e) =>
                    onUpdateSlide(activeSlideIndex, { subHeadline: e.target.value })
                  }
                  placeholder="Una riga di approfondimento o sommario"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>

              {/* Teleprompter Spoken Script */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Copione Gobbo / Testo Spoken (Sintesi Vocale)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Pronunciato dall'avatar parlante
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={activeSlide.script}
                  onChange={(e) =>
                    onUpdateSlide(activeSlideIndex, { script: e.target.value })
                  }
                  placeholder="Scrivi qui il testo che il giornalista avatar leggerà in studio..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm leading-relaxed focus:border-red-500 focus:outline-hidden resize-none font-sans"
                />
              </div>

              {/* Background Theme Selector - Neutri & Personalizzabili */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5 text-red-500" />
                      <span>Sfondo Scenografico Studio (Neutro & Personalizzabile)</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Scegli uno sfondo neutro pulito, imposta gradienti personalizzati o carica una tua foto.
                    </p>
                  </div>

                  {onApplyBackgroundToAll && (
                    <button
                      onClick={handleApplyToAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 shadow-sm"
                      title="Usa questo sfondo per tutte le slide del notiziario"
                    >
                      {appliedToAllSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Applicato a tutte!</span>
                        </>
                      ) : (
                        <>
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Applica a tutte le slide</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Background Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {BACKGROUND_PRESETS.map((bg) => {
                    const isSelected = activeSlide.backgroundTheme === bg.id;
                    return (
                      <button
                        key={bg.id}
                        onClick={() =>
                          onUpdateSlide(activeSlideIndex, { backgroundTheme: bg.id })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-red-500 bg-slate-800 ring-2 ring-red-500/25 shadow-md'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${bg.previewGradient} mb-1.5 shadow-inner border border-white/10`} />
                        <div className="text-[11px] font-bold text-white line-clamp-1">{bg.name}</div>
                        <div className="text-[9px] text-slate-400 line-clamp-1 font-mono mt-0.5">{bg.category}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-Editor for CUSTOM IMAGE UPLOAD */}
                {(activeSlide.backgroundTheme === 'custom' || activeSlide.customBackgroundUrl) && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                        <Upload className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Carica Foto o Immagine di Sfondo dal tuo Dispositivo</span>
                      </span>
                      {activeSlide.customBackgroundUrl && (
                        <button
                          onClick={() => onUpdateSlide(activeSlideIndex, { customBackgroundUrl: '' })}
                          className="text-[11px] text-red-400 hover:underline"
                        >
                          Rimuovi foto
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="file"
                        ref={bgFileInputRef}
                        accept="image/*"
                        onChange={handleBgFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => bgFileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Seleziona File Immagine dal PC</span>
                      </button>

                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={activeSlide.customBackgroundUrl || ''}
                          onChange={(e) =>
                            onUpdateSlide(activeSlideIndex, {
                              backgroundTheme: 'custom',
                              customBackgroundUrl: e.target.value,
                            })
                          }
                          placeholder="Oppure incolla URL immagine (https://...)"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    {activeSlide.customBackgroundUrl && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-700 bg-black">
                          <img
                            src={activeSlide.customBackgroundUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-slate-300">
                          Sfondo personalizzato attivo per questa slide
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Editor for NEUTRAL GRADIENT */}
                {activeSlide.backgroundTheme === 'neutral_gradient' && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                      <Palette className="w-3.5 h-3.5 text-slate-300" />
                      <span>Colori Gradiente Neutro</span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[
                        { label: 'Ardesia & Notte', from: '#1e293b', to: '#020617' },
                        { label: 'Antracite Puro', from: '#27272a', to: '#09090b' },
                        { label: 'Navy Studio', from: '#172554', to: '#020617' },
                        { label: 'Borgogna Deep', from: '#450a0a', to: '#090203' },
                      ].map((pal, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            onUpdateSlide(activeSlideIndex, {
                              customGradientFrom: pal.from,
                              customGradientTo: pal.to,
                            })
                          }
                          className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left"
                        >
                          <div
                            className="w-5 h-5 rounded-md shadow-xs border border-white/20"
                            style={{
                              background: `linear-gradient(135deg, ${pal.from}, ${pal.to})`,
                            }}
                          />
                          <span className="text-[11px] text-white font-medium">{pal.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Editor for NEUTRAL SOLID */}
                {activeSlide.backgroundTheme === 'neutral_solid' && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white font-mono">
                      Colore Sfondo Pieno Neutro
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { label: 'Nero Assoluto', hex: '#000000' },
                        { label: 'Nero Studio', hex: '#090d16' },
                        { label: 'Carbone', hex: '#18181b' },
                        { label: 'Ardesia Scura', hex: '#0f172a' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          onClick={() =>
                            onUpdateSlide(activeSlideIndex, {
                              customBackgroundColor: c.hex,
                            })
                          }
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700"
                        >
                          <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                          <span className="text-xs text-white">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Picture-in-Picture (PiP / Immagini in Immagini) Settings */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Picture-in-Picture (PiP)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeSlide.showPip}
                    onChange={(e) =>
                      onUpdateSlide(activeSlideIndex, { showPip: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {activeSlide.showPip ? (
                <div className="space-y-3 pt-2">
                  {/* PiP Title & Tag */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Etichetta / Tag
                    </label>
                    <input
                      type="text"
                      value={activeSlide.pipTag}
                      onChange={(e) =>
                        onUpdateSlide(activeSlideIndex, { pipTag: e.target.value })
                      }
                      placeholder="ES: DIRETTA, GRAFICO"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white uppercase font-bold focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Titolo Riquadro
                    </label>
                    <input
                      type="text"
                      value={activeSlide.pipTitle}
                      onChange={(e) =>
                        onUpdateSlide(activeSlideIndex, { pipTitle: e.target.value })
                      }
                      placeholder="Titolo riquadro PiP"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-bold focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Sottotitolo / Statistica PiP
                    </label>
                    <input
                      type="text"
                      value={activeSlide.pipSubtitle}
                      onChange={(e) =>
                        onUpdateSlide(activeSlideIndex, { pipSubtitle: e.target.value })
                      }
                      placeholder="Dato statistico o luogo"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Stock Preset Visuals & Custom Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-mono uppercase font-bold text-slate-300">
                        Immagine PiP (Carica dal Tuo Computer)
                      </label>
                      {activeSlide.pipImageUrl && (
                        <button
                          type="button"
                          onClick={() => onUpdateSlide(activeSlideIndex, { pipImageUrl: '' })}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Rimuovi
                        </button>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={pipFileInputRef}
                      accept="image/*"
                      onChange={handlePipFileUpload}
                      className="hidden"
                    />

                    {/* Dedicated High-Visibility Upload Card */}
                    <div
                      onClick={() => pipFileInputRef.current?.click()}
                      className="group cursor-pointer p-3 rounded-xl border-2 border-dashed border-sky-500/50 hover:border-sky-400 bg-sky-950/30 hover:bg-sky-950/50 transition-all flex items-center gap-3"
                    >
                      {activeSlide.pipImageUrl ? (
                        <div className="w-14 h-12 rounded-lg overflow-hidden border border-sky-400/40 shrink-0 bg-black">
                          <img
                            src={activeSlide.pipImageUrl}
                            alt="PiP Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-sky-400" />
                          <span>{activeSlide.pipImageUrl ? 'Sostituisci Immagine dal PC' : 'Carica Foto PiP dal tuo PC'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          Formati supportati: PNG, JPG, WebP • Appare nel riquadro in alto
                        </p>
                      </div>
                    </div>

                    {/* Preset Stock Images */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">
                        Oppure scegli un preset notiziario:
                      </span>
                      <div className="grid grid-cols-5 gap-1.5 mb-2">
                        {STOCK_PIP_IMAGES.map((img) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() =>
                              onUpdateSlide(activeSlideIndex, {
                                pipImageUrl: img.imageUrl,
                                pipTitle: activeSlide.pipTitle || img.title,
                                pipSubtitle: activeSlide.pipSubtitle || img.subtitle,
                                pipTag: activeSlide.pipTag || img.tag,
                              })
                            }
                            className={`aspect-video rounded-md overflow-hidden border transition-all ${
                              activeSlide.pipImageUrl === img.imageUrl
                                ? 'border-sky-400 ring-2 ring-sky-400/30'
                                : 'border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fallback URL input */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={activeSlide.pipImageUrl}
                        onChange={(e) =>
                          onUpdateSlide(activeSlideIndex, { pipImageUrl: e.target.value })
                        }
                        placeholder="Incolla link immagine esterno https://..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:border-sky-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  {/* Position Selector */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Posizione Riquadro nello Schermo
                    </label>
                    <select
                      value={activeSlide.pipPosition}
                      onChange={(e) =>
                        onUpdateSlide(activeSlideIndex, {
                          pipPosition: e.target.value as PipPosition,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-hidden"
                    >
                      <option value="top_right">In alto a destra (Classico TG)</option>
                      <option value="top_left">In alto a sinistra</option>
                      <option value="corner_large">Riquadro Grande Angolare</option>
                      <option value="split_screen">Metà Schermo (Split-Screen)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  Riquadro PiP disattivato per questa slide. Attivalo dall'interruttore sopra.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
