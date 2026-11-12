import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, REGION_LABELS, GOOGLE_VOICE_CATALOG } from '../data/languages';
import { LanguageOption, LanguageRegion } from '../types/news';
import { ttsService } from '../utils/ttsService';
import {
  Globe,
  Mic,
  Volume2,
  Sparkles,
  Check,
  Languages,
  Play,
  Square,
  Search,
  Sliders,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

interface SpeechSettingsPanelProps {
  selectedLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  speechStyle: string;
  onSelectSpeechStyle: (style: string) => void;
  onTranslateAllSlides: (targetLang: LanguageOption) => Promise<void>;
  isTranslating: boolean;
}

export const SpeechSettingsPanel: React.FC<SpeechSettingsPanelProps> = ({
  selectedLanguage,
  onSelectLanguage,
  selectedVoice,
  onSelectVoice,
  speechStyle,
  onSelectSpeechStyle,
  onTranslateAllSlides,
  isTranslating,
}) => {
  const [activeRegion, setActiveRegion] = useState<LanguageRegion>(selectedLanguage.region);
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'female' | 'male' | 'neutral' | 'browser'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [translateSuccess, setTranslateSuccess] = useState(false);

  // Dynamic Browser Voices (from SpeechSynthesis)
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setBrowserVoices(voices);
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const SPEECH_STYLES = [
    {
      id: 'Clear, professional television news anchor broadcast tone',
      label: 'TG Autorevole Principale',
      desc: 'Tono standard di prima serata, chiaro e scandito',
    },
    {
      id: 'Urgent, high-impact breaking news television anchor broadcast',
      label: 'Edizione Straordinaria (Breaking)',
      desc: 'Ritmo incalzante e presenza urgente da prima pagina',
    },
    {
      id: 'Calm, measured, articulate scientific documentary news presenter',
      label: 'Documentaristico / Scienza',
      desc: 'Cadenza posata e rassicurante per approfondimenti',
    },
    {
      id: 'Sharp, brisk, energetic financial market correspondent',
      label: 'Borsa & Finanza Dinamica',
      desc: 'Tono rapido per numeri, indici e mercati',
    },
  ];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((l) => l.region === activeRegion);

  // Filter Google catalog voices
  const catalogFiltered = GOOGLE_VOICE_CATALOG.filter((v) => {
    const matchesGender =
      voiceFilter === 'all' ||
      (voiceFilter === 'female' && v.gender === 'Femminile') ||
      (voiceFilter === 'male' && v.gender === 'Maschile') ||
      (voiceFilter === 'neutral' && v.gender === 'Neutro / Bilanciato');

    const matchesSearch =
      !searchQuery.trim() ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.timbre.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesGender && matchesSearch;
  });

  // Filter browser voices for active language
  const browserFiltered = browserVoices.filter((v) => {
    const langPrefix = selectedLanguage.code.slice(0, 2);
    const matchesLang = v.lang.startsWith(langPrefix);
    const matchesSearch =
      !searchQuery.trim() ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.lang.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesSearch;
  });

  const handleTranslateClick = async () => {
    setTranslateSuccess(false);
    await onTranslateAllSlides(selectedLanguage);
    setTranslateSuccess(true);
    setTimeout(() => setTranslateSuccess(false), 3000);
  };

  const handlePlayVoicePreview = async (e: React.MouseEvent, voiceId: string) => {
    e.stopPropagation();
    if (previewingVoice === voiceId) {
      ttsService.stopSpeaking();
      setPreviewingVoice(null);
      return;
    }

    setPreviewingVoice(voiceId);
    await ttsService.previewVoice(voiceId, selectedLanguage.code);
    setPreviewingVoice(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base tracking-wide">
              CATALOGO COMPLETO VOCI GOOGLE TTS & MODALITÀ SINTESI
            </h3>
            <p className="text-xs text-slate-400">
              Voci Google Maschili, Femminili, Bilanciate Neurale e Voci Google di Sistema
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
          <Mic className="w-3.5 h-3.5 text-red-400" />
          <span>Sintesi Neurale Google Multilingue</span>
        </div>
      </div>

      {/* 1. REGIONAL TABS */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Area Linguistica & Territorio
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(['occidentale', 'orientale', 'slava'] as LanguageRegion[]).map((region) => {
            const isSelected = activeRegion === region;
            const meta = REGION_LABELS[region];

            return (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-red-500 bg-slate-800 ring-2 ring-red-500/20 shadow-md'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  {meta.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {meta.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. LANGUAGE PICKER CARDS */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Seleziona Lingua del Notiziario ({filteredLanguages.length} lingue)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {filteredLanguages.map((lang) => {
            const isSelected = selectedLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang);
                  if (lang.googleVoice) {
                    onSelectVoice(lang.googleVoice);
                  }
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-red-500 bg-slate-800 text-white ring-2 ring-red-500/20 shadow-md'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-xl shrink-0">{lang.flag}</span>
                <div className="min-w-0">
                  <div className="font-bold text-xs line-clamp-1">{lang.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono line-clamp-1">
                    {lang.nativeName}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. AUTO TRANSLATE SCRIPT */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-xs font-bold text-white">
              Adatta Copione in {selectedLanguage.name} ({selectedLanguage.flag})
            </div>
            <div className="text-[11px] text-slate-400">
              Traduci tutte le slide e il copione del conduttore in questa lingua con Google Traduttore.
            </div>
          </div>
        </div>

        <button
          onClick={handleTranslateClick}
          disabled={isTranslating}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          {isTranslating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Traduzione in corso...</span>
            </>
          ) : translateSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Tradotto con successo!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Traduci Scaletta</span>
            </>
          )}
        </button>
      </div>

      {/* 4. GOOGLE VOICES FILTER & SEARCH BAR */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Scelta Voci Google (Maschili, Femminili e Bilanciate)
            </label>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Seleziona la voce desiderata o ascolta l'anteprima audio con un click sul tasto Play
            </p>
          </div>

          {/* Voice Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca voce o timbro..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3">
          {[
            { id: 'all', label: 'Tutte le Voci Google' },
            { id: 'female', label: 'Voci Femminili (8)' },
            { id: 'male', label: 'Voci Maschili (8)' },
            { id: 'neutral', label: 'Neutre / Bilanciate (4)' },
            { id: 'browser', label: `Voci Browser Google (${browserFiltered.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVoiceFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                voiceFilter === tab.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Google Catalog Grid */}
        {voiceFilter !== 'browser' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {catalogFiltered.map((v) => {
              const isSelected = selectedVoice === v.id;
              const isPlaying = previewingVoice === v.id;

              const badgeColor =
                v.gender === 'Femminile'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : v.gender === 'Maschile'
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

              return (
                <div
                  key={v.id}
                  onClick={() => onSelectVoice(v.id)}
                  className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'border-red-500 bg-slate-800 ring-2 ring-red-500/20 shadow-lg'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs font-mono">{v.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
                        {v.gender}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-300 mb-1">{v.timbre}</div>
                    <div className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {v.desc}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[170px]">
                      {v.recommendedFor}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handlePlayVoicePreview(e, v.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shadow-sm cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-600 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                      title="Ascolta anteprima audio"
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Ascolta</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Browser Native Voices Tab */}
        {voiceFilter === 'browser' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400">
              Voci Google e di sistema installate nel browser per la lingua {selectedLanguage.name}:
            </div>

            {browserFiltered.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                Nessuna voce nativa trovata specificamente per {selectedLanguage.code}. Verranno utilizzate le voci Google Neurali in streaming.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {browserFiltered.map((bv) => {
                  const isSelected = selectedVoice === bv.name;
                  const isPlaying = previewingVoice === bv.name;

                  return (
                    <div
                      key={bv.name}
                      onClick={() => onSelectVoice(bv.name)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-red-500 bg-slate-800 ring-2 ring-red-500/20'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs truncate max-w-[200px]">
                            {bv.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {bv.lang}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {bv.name.toLowerCase().includes('google') ? 'Voce Neurale Google' : 'Voce di Sistema'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => handlePlayVoicePreview(e, bv.name)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all"
                        >
                          {isPlaying ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Ascolta</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. SPEECH DELIVERY STYLES */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Tono e Stile di Diffusione (Broadcast Persona)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SPEECH_STYLES.map((st) => {
            const isSelected = speechStyle === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onSelectSpeechStyle(st.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-red-500 bg-slate-800 text-white ring-2 ring-red-500/20'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs">{st.label}</div>
                <div className="text-[11px] text-slate-400 mt-1">{st.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
