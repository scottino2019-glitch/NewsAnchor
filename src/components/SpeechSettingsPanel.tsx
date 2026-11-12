import React, { useState, useEffect, useMemo } from 'react';
import { SUPPORTED_LANGUAGES, REGION_LABELS } from '../data/languages';
import { LanguageOption, LanguageRegion } from '../types/news';
import { ttsService } from '../utils/ttsService';
import {
  Globe,
  Mic,
  Volume2,
  Check,
  Languages,
  Play,
  Square,
  Search,
  Sliders,
  Sparkles,
  UserCheck,
  RotateCcw,
  RefreshCw,
  Smartphone,
  ChevronDown,
} from 'lucide-react';

interface SpeechSettingsPanelProps {
  selectedLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  voiceGender?: 'female' | 'male';
  onChangeVoiceGender?: (gender: 'female' | 'male') => void;
  speechStyle: string;
  onSelectSpeechStyle: (style: string) => void;
  voicePitch?: number;
  onChangeVoicePitch?: (pitch: number) => void;
  voiceRate?: number;
  onChangeVoiceRate?: (rate: number) => void;
  onTranslateAllSlides: (targetLang: LanguageOption) => Promise<void>;
  isTranslating: boolean;
}

export const SpeechSettingsPanel: React.FC<SpeechSettingsPanelProps> = ({
  selectedLanguage,
  onSelectLanguage,
  selectedVoice,
  onSelectVoice,
  voiceGender = 'female',
  onChangeVoiceGender,
  speechStyle,
  onSelectSpeechStyle,
  voicePitch = 1.18,
  onChangeVoicePitch,
  voiceRate = 1.0,
  onChangeVoiceRate,
  onTranslateAllSlides,
  isTranslating,
}) => {
  const [activeRegion, setActiveRegion] = useState<LanguageRegion>(selectedLanguage.region);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [translateSuccess, setTranslateSuccess] = useState(false);
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [filterOnlyCurrentLang, setFilterOnlyCurrentLang] = useState(false);

  // Load voices from browser / Android SpeechSynthesis
  const refreshVoices = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const vList = window.speechSynthesis.getVoices();
      if (vList && vList.length > 0) {
        setAllVoices(vList);
      }
    }
  };

  useEffect(() => {
    refreshVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
      const timer = setTimeout(refreshVoices, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const langCodePrefix = selectedLanguage.code.slice(0, 2).toLowerCase();

  // Helper to categorize voice origin
  const getVoiceCategory = (v: SpeechSynthesisVoice) => {
    const lowerName = v.name.toLowerCase();
    const lowerUri = (v.voiceURI || '').toLowerCase();
    const isGoogle = lowerName.includes('google') || lowerUri.includes('google');
    const isAndroid = lowerName.includes('android') || lowerUri.includes('android') || lowerName.includes('network');

    if (v.lang.toLowerCase().startsWith(langCodePrefix)) {
      return 'current_lang';
    }
    if (isGoogle || isAndroid) {
      return 'google_android';
    }
    return 'other';
  };

  // Grouped voices for dropdown menu
  const { currentLangVoices, googleAndroidVoices, otherVoices } = useMemo(() => {
    const current: SpeechSynthesisVoice[] = [];
    const googleAndroid: SpeechSynthesisVoice[] = [];
    const others: SpeechSynthesisVoice[] = [];

    const listToProcess = filterOnlyCurrentLang
      ? allVoices.filter((v) => v.lang.toLowerCase().startsWith(langCodePrefix))
      : allVoices;

    listToProcess.forEach((v) => {
      const cat = getVoiceCategory(v);
      if (cat === 'current_lang') {
        current.push(v);
      } else if (cat === 'google_android') {
        googleAndroid.push(v);
      } else {
        others.push(v);
      }
    });

    return {
      currentLangVoices: current,
      googleAndroidVoices: googleAndroid,
      otherVoices: others,
    };
  }, [allVoices, filterOnlyCurrentLang, langCodePrefix]);

  const activeVoiceObj = allVoices.find(
    (v) =>
      v.name.toLowerCase() === selectedVoice.toLowerCase() ||
      (v.voiceURI && v.voiceURI.toLowerCase() === selectedVoice.toLowerCase())
  );

  const handlePlayPreview = async (voiceName: string) => {
    if (previewingVoice === voiceName) {
      ttsService.stopSpeaking();
      setPreviewingVoice(null);
      return;
    }

    setPreviewingVoice(voiceName);
    await ttsService.previewVoice(
      voiceName,
      selectedLanguage.code,
      undefined,
      { pitch: voicePitch, rate: voiceRate }
    );
    setPreviewingVoice(null);
  };

  const handleTranslateClick = async () => {
    setTranslateSuccess(false);
    await onTranslateAllSlides(selectedLanguage);
    setTranslateSuccess(true);
    setTimeout(() => setTranslateSuccess(false), 3000);
  };

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

  const isCurrentFemale = voiceGender === 'female' || voicePitch >= 1.05;
  const isCurrentMale = voiceGender === 'male' || voicePitch <= 0.90;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
              <span>CONTROLLO VOCE NOTIZIARIO: FEMMINILE & MASCHILE</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {allVoices.length} Voci Rilevate
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Scegli liberamente se impostare una voce da Conduttrice Donna o da Conduttore Uomo
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshVoices}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          title="Ricarica elenco voci da Android e dal browser"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Rileva Voci</span>
        </button>
      </div>

      {/* 1. SELETTORE GENERE IMMEDIATO (DONNA VS UOMO) */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Scegli Genere del Conduttore Notiziario:</span>
          </span>
          <span className="text-xs font-mono font-bold text-slate-300">
            Attivo: {isCurrentFemale ? '👩 Voce Femminile (Donna)' : isCurrentMale ? '👨 Voce Maschile (Uomo)' : '🎙️ Voce Neutra'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tasto Voce Femminile */}
          <button
            type="button"
            onClick={() => {
              onChangeVoiceGender?.('female');
              onChangeVoicePitch?.(1.18);
            }}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
              isCurrentFemale
                ? 'border-rose-500 bg-rose-950/40 text-white ring-2 ring-rose-500/40 shadow-lg'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">👩</span>
              <div className="text-left">
                <div className="font-bold text-sm text-rose-300">
                  Voce Femminile (Donna TG)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Timbro chiaro e brillante da conduttrice di prima serata
                </div>
              </div>
            </div>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
              isCurrentFemale ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              Donna ♀
            </span>
          </button>

          {/* Tasto Voce Maschile */}
          <button
            type="button"
            onClick={() => {
              onChangeVoiceGender?.('male');
              onChangeVoicePitch?.(0.78);
            }}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
              isCurrentMale
                ? 'border-sky-500 bg-sky-950/40 text-white ring-2 ring-sky-500/40 shadow-lg'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">👨</span>
              <div className="text-left">
                <div className="font-bold text-sm text-sky-300">
                  Voce Maschile (Uomo TG)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Timbro baritonale profondo e solenne da conduttore TG
                </div>
              </div>
            </div>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
              isCurrentMale ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              Uomo ♂
            </span>
          </button>
        </div>
      </div>

      {/* 2. MENU A TENDINA COMPLETO DI TUTTE LE VOCI GOOGLE & ANDROID */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="voice-dropdown"
            className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2"
          >
            <ChevronDown className="w-4 h-4 text-red-400" />
            <span>Sorgente Audio: Menu a Tendina Voci Google & Android</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterOnlyCurrentLang}
              onChange={(e) => setFilterOnlyCurrentLang(e.target.checked)}
              className="rounded accent-red-500"
            />
            <span>Filtra solo lingua attuale ({selectedLanguage.name})</span>
          </label>
        </div>

        {/* Dropdown Select */}
        <div className="relative">
          <select
            id="voice-dropdown"
            value={selectedVoice}
            onChange={(e) => {
              onSelectVoice(e.target.value);
            }}
            className="w-full p-3.5 pr-10 rounded-xl bg-slate-900 border-2 border-slate-700 hover:border-red-500 focus:border-red-500 text-white font-medium text-sm sm:text-base focus:outline-hidden appearance-none cursor-pointer shadow-inner"
          >
            {allVoices.length === 0 ? (
              <option value="">Rilevamento voci Android / Google in corso...</option>
            ) : null}

            {/* Group 1: Voci lingua selezionata */}
            {currentLangVoices.length > 0 && (
              <optgroup label={`🇮🇹 VOCI IN ${selectedLanguage.name.toUpperCase()} (${currentLangVoices.length} VOCI)`}>
                {currentLangVoices.map((v, idx) => (
                  <option key={`curr-${v.name}-${v.lang}-${idx}`} value={v.name}>
                    {v.name} [{v.lang}] {v.name.toLowerCase().includes('google') ? '⭐ Google' : ''}
                  </option>
                ))}
              </optgroup>
            )}

            {/* Group 2: Tutte le voci Google & Android */}
            {googleAndroidVoices.length > 0 && (
              <optgroup label={`🤖 TUTTE LE VOCI GOOGLE & ANDROID TTS (${googleAndroidVoices.length} VOCI)`}>
                {googleAndroidVoices.map((v, idx) => (
                  <option key={`google-${v.name}-${v.lang}-${idx}`} value={v.name}>
                    {v.name} [{v.lang}]
                  </option>
                ))}
              </optgroup>
            )}

            {/* Group 3: Altre voci di sistema */}
            {otherVoices.length > 0 && (
              <optgroup label={`🌐 ALTRE VOCI MULTILINGUE (${otherVoices.length} VOCI)`}>
                {otherVoices.map((v, idx) => (
                  <option key={`sys-${v.name}-${v.lang}-${idx}`} value={v.name}>
                    {v.name} [{v.lang}]
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-5 h-5 text-red-400" />
          </div>
        </div>

        {/* Selected Voice Info Card & Immediate Audio Preview Button */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-slate-400 font-mono">Voce Conduttore Attiva:</div>
            <div className="text-sm sm:text-base font-bold text-white truncate flex items-center gap-2 mt-0.5">
              <span>{selectedVoice || 'Voce Predefinita'}</span>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                isCurrentFemale ? 'bg-rose-500/20 text-rose-300' : 'bg-sky-500/20 text-sky-300'
              }`}>
                {isCurrentFemale ? 'Donna ♀' : isCurrentMale ? 'Uomo ♂' : 'Neutro'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Tonalità impostata: <strong className="text-white">{voicePitch.toFixed(2)}x</strong> ({isCurrentFemale ? 'Femminile' : isCurrentMale ? 'Maschile' : 'Neutra'}).
            </div>
          </div>

          <button
            type="button"
            onClick={() => handlePlayPreview(selectedVoice)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
              previewingVoice === selectedVoice
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {previewingVoice === selectedVoice ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Ferma Anteprima</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Ascolta Prova Voce</span>
              </>
            )}
          </button>
        </div>

        {/* Tonalità Slider with direct gender markers */}
        <div className="pt-2 border-t border-slate-850 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-bold">Regolazione Tonalità Timbro (Pitch):</span>
            <span className="text-white font-bold">{voicePitch.toFixed(2)}x</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-sky-400 shrink-0 font-bold">
              👨 Maschile (0.75x)
            </span>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.01"
              value={voicePitch}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeVoicePitch?.(val);
                if (val >= 1.05) onChangeVoiceGender?.('female');
                else if (val <= 0.90) onChangeVoiceGender?.('male');
              }}
              className="w-full accent-red-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-rose-400 shrink-0 font-bold">
              👩 Femminile (1.25x)
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-slate-400">
            <span>Velocità di lettura: <strong>{voiceRate.toFixed(2)}x</strong></span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onChangeVoicePitch?.(1.18);
                  onChangeVoiceGender?.('female');
                }}
                className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800 cursor-pointer"
              >
                Imposta Donna (1.18x)
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeVoicePitch?.(0.78);
                  onChangeVoiceGender?.('male');
                }}
                className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 hover:bg-sky-900 border border-sky-800 cursor-pointer"
              >
                Imposta Uomo (0.78x)
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeVoicePitch?.(1.0);
                  onChangeVoiceRate?.(1.0);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Reset 1.0x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REGIONAL AREA TABS */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Area Linguistica Notiziario
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

      {/* 4. LANGUAGE PICKER CARDS */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Lingua del Notiziario ({filteredLanguages.length} lingue disponibili)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {filteredLanguages.map((lang) => {
            const isSelected = selectedLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang);
                  const matching = allVoices.find((v) =>
                    v.lang.toLowerCase().startsWith(lang.code.slice(0, 2).toLowerCase())
                  );
                  if (matching) {
                    onSelectVoice(matching.name);
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

      {/* 5. AUTO TRANSLATE SCRIPT */}
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

      {/* 6. BROADCAST PERSONA STYLE */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Stile di Diffusione Televisiva
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
