import React, { useState, useEffect, useMemo } from 'react';
import { ALL_GOOGLE_AND_ANDROID_VOICES, GoogleVoiceEntry } from '../data/googleVoices';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { LanguageOption } from '../types/news';
import { ttsService } from '../utils/ttsService';
import {
  Play,
  Square,
  Search,
  ChevronDown,
  Languages,
  Sparkles,
  Check,
} from 'lucide-react';

interface SpeechSettingsPanelProps {
  selectedLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  voiceGender?: 'female' | 'male';
  onChangeVoiceGender?: (gender: 'female' | 'male') => void;
  speechStyle?: string;
  onSelectSpeechStyle?: (style: string) => void;
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
  onTranslateAllSlides,
  isTranslating,
}) => {
  const [deviceVoices, setDeviceVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [translateSuccess, setTranslateSuccess] = useState(false);

  // Rileva esclusivamente le voci di Google e Android dal dispositivo/browser
  const loadDeviceVoices = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const all = window.speechSynthesis.getVoices();
      const googleAndAndroid = all.filter((v) => {
        const name = v.name.toLowerCase();
        const uri = (v.voiceURI || '').toLowerCase();
        return (
          name.includes('google') ||
          uri.includes('google') ||
          name.includes('android') ||
          uri.includes('android') ||
          name.includes('-network') ||
          name.includes('-local') ||
          uri.includes('com.google.android.tts')
        );
      });
      setDeviceVoices(googleAndAndroid);
    }
  };

  useEffect(() => {
    loadDeviceVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadDeviceVoices;
      const t1 = setTimeout(loadDeviceVoices, 200);
      const t2 = setTimeout(loadDeviceVoices, 1000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  // Tutte le voci Google e Android unite in un unico elenco uniforme senza distinzioni
  const allVoices = useMemo<GoogleVoiceEntry[]>(() => {
    const list: GoogleVoiceEntry[] = [...ALL_GOOGLE_AND_ANDROID_VOICES];
    const registered = new Set(list.map((v) => v.id.toLowerCase()));

    deviceVoices.forEach((dv) => {
      const lower = dv.name.toLowerCase();
      if (!registered.has(lower)) {
        list.push({
          id: dv.name,
          name: dv.name,
          lang: dv.lang,
          flag: '🌐',
        });
        registered.add(lower);
      }
    });

    return list;
  }, [deviceVoices]);

  // Nessun filtro: mostra tutte le voci. Se l'utente digita del testo, filtra solo per ricerca.
  const displayedVoices = useMemo(() => {
    if (!searchQuery.trim()) {
      return allVoices;
    }
    const q = searchQuery.toLowerCase().trim();
    return allVoices.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.lang.toLowerCase().includes(q)
    );
  }, [allVoices, searchQuery]);

  // Voce attualmente attiva
  const currentVoice = useMemo(() => {
    const found = allVoices.find(
      (v) =>
        v.id.toLowerCase() === selectedVoice.toLowerCase() ||
        v.name.toLowerCase() === selectedVoice.toLowerCase()
    );
    if (found) return found;
    return {
      id: selectedVoice,
      name: selectedVoice || 'Google Italiano 1',
      lang: selectedLanguage.code,
      flag: '🇮🇹',
    };
  }, [allVoices, selectedVoice, selectedLanguage]);

  // Ascolto audio prova voce
  const handlePlayPreview = async (voiceId: string, langCode: string) => {
    if (previewingVoice === voiceId) {
      ttsService.stopSpeaking();
      setPreviewingVoice(null);
      return;
    }

    setPreviewingVoice(voiceId);
    await ttsService.previewVoice(voiceId, langCode, undefined, { pitch: 1.0, rate: 1.0 });
    setPreviewingVoice(null);
  };

  const handleSelectVoice = (v: GoogleVoiceEntry) => {
    onSelectVoice(v.id);
    const match = SUPPORTED_LANGUAGES.find((sl) =>
      v.lang.toLowerCase().startsWith(sl.code.slice(0, 2).toLowerCase())
    );
    if (match && match.code !== selectedLanguage.code) {
      onSelectLanguage(match);
    }
  };

  const handleTranslateClick = async () => {
    setTranslateSuccess(false);
    await onTranslateAllSlides(selectedLanguage);
    setTranslateSuccess(true);
    setTimeout(() => setTranslateSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Intestazione */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-black text-white text-lg tracking-wide flex items-center gap-2">
            <span>VOCI GOOGLE & ANDROID</span>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {allVoices.length} Voci
            </span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Tutte le voci Google e Android disponibili, senza filtri.
          </p>
        </div>
      </div>

      {/* Voce Selezionata Attiva */}
      <div className="p-4 rounded-xl bg-slate-950 border-2 border-red-500 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Voce in Uso:</span>
          </div>

          <div className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span className="text-2xl">{currentVoice.flag}</span>
            <span className="truncate">{currentVoice.name}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {currentVoice.lang}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handlePlayPreview(currentVoice.id, currentVoice.lang)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer ${
            previewingVoice === currentVoice.id
              ? 'bg-amber-600 text-white animate-pulse'
              : 'bg-red-600 hover:bg-red-500 text-white ring-2 ring-red-500/40'
          }`}
        >
          {previewingVoice === currentVoice.id ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Ferma Audio</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Ascolta Voce</span>
            </>
          )}
        </button>
      </div>

      {/* Menu a Tendina Diretto */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <label
          htmlFor="voice-select-dropdown"
          className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between"
        >
          <span>Scegli dal Menu a Tendina:</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {allVoices.length} voci
          </span>
        </label>

        <div className="relative">
          <select
            id="voice-select-dropdown"
            value={selectedVoice}
            onChange={(e) => {
              const match = allVoices.find((v) => v.id === e.target.value);
              if (match) handleSelectVoice(match);
              else onSelectVoice(e.target.value);
            }}
            className="w-full p-3.5 pr-10 rounded-xl bg-slate-900 border-2 border-slate-700 hover:border-red-500 focus:border-red-500 text-white font-medium text-sm focus:outline-hidden appearance-none cursor-pointer"
          >
            {allVoices.map((v) => (
              <option key={`opt-${v.id}`} value={v.id}>
                {v.flag} {v.name} ({v.lang})
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </div>

      {/* Cerca Voce */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cerca voce..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-red-500 focus:outline-hidden"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Lista Completa di Tutte le Voci */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 px-1">
          Tutte le Voci ({displayedVoices.length}):
        </div>

        <div className="max-h-[520px] overflow-y-auto rounded-xl border border-slate-800 divide-y divide-slate-850 bg-slate-950">
          {displayedVoices.map((v) => {
            const isSelected =
              v.id.toLowerCase() === selectedVoice.toLowerCase() ||
              v.name.toLowerCase() === selectedVoice.toLowerCase();
            const isPlaying = previewingVoice === v.id;

            return (
              <div
                key={`row-${v.id}`}
                className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors ${
                  isSelected ? 'bg-red-950/40 border-l-4 border-l-red-500' : 'hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{v.flag}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        {v.name}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                          ATTIVA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {v.lang}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePlayPreview(v.id, v.lang)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-600 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Ascolta</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectVoice(v)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                    }`}
                  >
                    {isSelected ? '✓ In Uso' : 'Usa Voce'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adatta Notizie e Copione con Google Traduttore */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Languages className="w-5 h-5 text-sky-400" />
          <div>
            <div className="text-xs font-bold text-white">
              Traduci Copione con Google Traduttore
            </div>
            <div className="text-[11px] text-slate-400">
              Adatta automaticamente il testo delle notizie alla lingua selezionata.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTranslateClick}
          disabled={isTranslating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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
    </div>
  );
};
