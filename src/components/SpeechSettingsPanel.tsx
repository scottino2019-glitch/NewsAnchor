import React, { useState, useEffect, useMemo } from 'react';
import { STUDIO_CLOUD_VOICES, GoogleVoiceEntry } from '../data/googleVoices';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { LanguageOption } from '../types/news';
import { ttsService } from '../utils/ttsService';
import { classifyVoice, CategorizedVoice, getFlagForLang } from '../utils/voiceClassification';
import {
  Play,
  Square,
  Search,
  ChevronDown,
  Languages,
  Check,
  Sliders,
  Sparkles,
  Volume2,
  RefreshCw,
  UserCheck,
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
  voicePitch = 1.0,
  onChangeVoicePitch,
  voiceRate = 1.0,
  onChangeVoiceRate,
  onTranslateAllSlides,
  isTranslating,
}) => {
  const [deviceVoices, setDeviceVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [providerFilter, setProviderFilter] = useState<'all' | 'device' | 'studio' | 'google' | 'microsoft' | 'apple'>('all');
  const [onlyCurrentLang, setOnlyCurrentLang] = useState<boolean>(true);
  const [translateSuccess, setTranslateSuccess] = useState(false);

  // Rileva TUTTE le voci reali installate sul dispositivo/browser SENZA ALCUN FILTRO
  const loadDeviceVoices = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const all = window.speechSynthesis.getVoices();
      setDeviceVoices(all);
    }
  };

  useEffect(() => {
    loadDeviceVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadDeviceVoices;
      const t1 = setTimeout(loadDeviceVoices, 250);
      const t2 = setTimeout(loadDeviceVoices, 1000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  // Combina le voci reali del dispositivo con i preset Studio TG
  const allVoices = useMemo<CategorizedVoice[]>(() => {
    const list: CategorizedVoice[] = [];

    // 1. Aggiungi tutte le voci reali del browser/dispositivo (Microsoft, Apple, Google, Sistema)
    deviceVoices.forEach((dv) => {
      list.push(classifyVoice(dv));
    });

    // 2. Aggiungi le voci Studio TG
    STUDIO_CLOUD_VOICES.forEach((sv) => {
      list.push({
        id: sv.id,
        name: sv.name,
        displayName: sv.name,
        gender: sv.gender,
        isGoogle: true,
        isAndroid: false,
        isNeural: true,
        provider: 'Studio TG',
        lang: sv.lang,
        flag: sv.flag,
        isDeviceVoice: false,
      });
    });

    return list;
  }, [deviceVoices]);

  // Filtro avanzato e ricerca
  const displayedVoices = useMemo(() => {
    const langPrefix = selectedLanguage.code.slice(0, 2).toLowerCase();

    return allVoices.filter((v) => {
      // Filtro Lingua
      if (onlyCurrentLang) {
        const vLang = v.lang.toLowerCase();
        if (!vLang.startsWith(langPrefix)) {
          return false;
        }
      }

      // Filtro Genere
      if (genderFilter === 'female' && v.gender !== 'Femminile') return false;
      if (genderFilter === 'male' && v.gender !== 'Maschile') return false;

      // Filtro Provider
      if (providerFilter === 'device' && !v.isDeviceVoice) return false;
      if (providerFilter === 'studio' && v.provider !== 'Studio TG') return false;
      if (providerFilter === 'google' && v.provider !== 'Google / Android') return false;
      if (providerFilter === 'microsoft' && v.provider !== 'Microsoft') return false;
      if (providerFilter === 'apple' && v.provider !== 'Apple') return false;

      // Ricerca testo
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = v.displayName.toLowerCase().includes(q) || v.name.toLowerCase().includes(q);
        const matchesLang = v.lang.toLowerCase().includes(q);
        const matchesProvider = v.provider.toLowerCase().includes(q);
        const matchesGender = v.gender.toLowerCase().includes(q);
        if (!matchesName && !matchesLang && !matchesProvider && !matchesGender) {
          return false;
        }
      }

      return true;
    });
  }, [allVoices, onlyCurrentLang, selectedLanguage, genderFilter, providerFilter, searchQuery]);

  // Voce attualmente attiva
  const currentVoice = useMemo<CategorizedVoice>(() => {
    const found = allVoices.find(
      (v) =>
        v.id.toLowerCase() === selectedVoice.toLowerCase() ||
        v.name.toLowerCase() === selectedVoice.toLowerCase()
    );
    if (found) return found;

    return {
      id: selectedVoice,
      name: selectedVoice || 'Studio TG - Elena',
      displayName: selectedVoice || 'Studio TG - Elena (Femminile)',
      gender: selectedVoice.toLowerCase().includes('marco') || selectedVoice.toLowerCase().includes('kenji') ? 'Maschile' : 'Femminile',
      isGoogle: true,
      isAndroid: false,
      isNeural: true,
      provider: 'Studio TG',
      lang: selectedLanguage.code,
      flag: getFlagForLang(selectedLanguage.code),
      isDeviceVoice: false,
    };
  }, [allVoices, selectedVoice, selectedLanguage]);

  // Prova audio voce
  const handlePlayPreview = async (v: CategorizedVoice) => {
    if (previewingVoice === v.id) {
      ttsService.stopSpeaking();
      setPreviewingVoice(null);
      return;
    }

    setPreviewingVoice(v.id);
    await ttsService.previewVoice(v.id, v.lang, undefined, {
      pitch: voicePitch,
      rate: voiceRate,
    });
    setPreviewingVoice(null);
  };

  const handleSelectVoice = (v: CategorizedVoice) => {
    onSelectVoice(v.id);
    // Sincronizza lingua se diversa
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

  // Conteggio voci per lingua selezionata
  const currentLangCount = useMemo(() => {
    const prefix = selectedLanguage.code.slice(0, 2).toLowerCase();
    return allVoices.filter((v) => v.lang.toLowerCase().startsWith(prefix)).length;
  }, [allVoices, selectedLanguage]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Intestazione */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-black text-white text-lg tracking-wide flex items-center gap-2">
            <span>SINTESI VOCALE & CATALOGO VOCI</span>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {deviceVoices.length} Voci Dispositivo + {STUDIO_CLOUD_VOICES.length} Voci Studio TG
            </span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Tutte le voci del tuo sistema (Microsoft, Apple, Google, Sistema) e le voci Studio TG con toni maschili e femminili reali.
          </p>
        </div>

        {/* Pulsante Traduci Scaletta */}
        <button
          type="button"
          onClick={handleTranslateClick}
          disabled={isTranslating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 font-bold text-xs transition-colors cursor-pointer"
        >
          {isTranslating ? (
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
          ) : translateSuccess ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Languages className="w-4 h-4" />
          )}
          <span>
            {isTranslating
              ? 'Traduzione...'
              : translateSuccess
              ? 'Notizie Tradotte!'
              : `Traduci Notizie in ${selectedLanguage.name}`}
          </span>
        </button>
      </div>

      {/* VOCE SELEZIONATA ATTIVA (BANNER PRIMARIO) */}
      <div className="p-4 rounded-xl bg-slate-950 border-2 border-red-500 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Voce Attualmente in Uso per il Notiziario:</span>
          </div>

          <div className="text-base sm:text-lg font-black text-white flex flex-wrap items-center gap-2">
            <span className="text-2xl">{currentVoice.flag}</span>
            <span className="truncate">{currentVoice.displayName}</span>

            {/* Badge Genere */}
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                currentVoice.gender === 'Maschile'
                  ? 'bg-sky-950/80 text-sky-300 border-sky-600/50'
                  : currentVoice.gender === 'Femminile'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {currentVoice.gender === 'Maschile' ? '♂ Maschile' : currentVoice.gender === 'Femminile' ? '♀ Femminile' : 'Neutro'}
            </span>

            {/* Badge Provider */}
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {currentVoice.provider}
            </span>

            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
              {currentVoice.lang}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handlePlayPreview(currentVoice)}
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
              <span>Ascolta Voce in Uso</span>
            </>
          )}
        </button>
      </div>

      {/* REGOLATORI TONALITÀ (PITCH) & VELOCITÀ (SPEED) */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Regolazione Tonalità & Velocità di Lettura</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pitch Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Tonalità Voce (Pitch):</span>
              <span className="font-mono font-bold text-white">
                {voicePitch.toFixed(2)}x {voicePitch < 0.95 ? '(Più Grave / Maschile)' : voicePitch > 1.05 ? '(Più Acuto / Femminile)' : '(Naturale)'}
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.02"
              value={voicePitch}
              onChange={(e) => onChangeVoicePitch && onChangeVoicePitch(parseFloat(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.75x (Grave)</span>
              <button
                type="button"
                onClick={() => onChangeVoicePitch && onChangeVoicePitch(1.0)}
                className="text-red-400 hover:underline cursor-pointer"
              >
                Ripristina 1.0x
              </button>
              <span>1.25x (Acuto)</span>
            </div>
          </div>

          {/* Rate Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Velocità di Lettura (Rate):</span>
              <span className="font-mono font-bold text-white">
                {voiceRate.toFixed(2)}x {voiceRate < 0.95 ? '(Calma)' : voiceRate > 1.05 ? '(Dinamica)' : '(Naturale)'}
              </span>
            </div>
            <input
              type="range"
              min="0.80"
              max="1.25"
              step="0.02"
              value={voiceRate}
              onChange={(e) => onChangeVoiceRate && onChangeVoiceRate(parseFloat(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.80x (Lenta)</span>
              <button
                type="button"
                onClick={() => onChangeVoiceRate && onChangeVoiceRate(1.0)}
                className="text-red-400 hover:underline cursor-pointer"
              >
                Ripristina 1.0x
              </button>
              <span>1.25x (Rapida)</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTRI DI VISUALIZZAZIONE & RICERCA */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Toggle Solo Lingua Corrente vs Tutte le Lingue */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyCurrentLang(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                onlyCurrentLang
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Solo {selectedLanguage.flag} {selectedLanguage.name} ({currentLangCount})
            </button>
            <button
              type="button"
              onClick={() => setOnlyCurrentLang(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !onlyCurrentLang
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Tutte le Lingue ({allVoices.length})
            </button>
          </div>

          {/* Filtro Genere */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setGenderFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                genderFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tutti
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('female')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                genderFilter === 'female' ? 'bg-rose-900/60 text-rose-300 font-bold' : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              ♀ Femminili
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('male')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                genderFilter === 'male' ? 'bg-sky-900/60 text-sky-300 font-bold' : 'text-slate-400 hover:text-sky-300'
              }`}
            >
              ♂ Maschili
            </button>
          </div>
        </div>

        {/* Filtro Provider & Barra di Ricerca */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-900">
          <div>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:border-red-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tutti i Provider (Dispositivo & Studio)</option>
              <option value="device">Solo Voci Dispositivo (Microsoft, Apple, Google, Sistema)</option>
              <option value="studio">Solo Voci Studio TG Cloud</option>
              <option value="microsoft">Microsoft Edge / Windows</option>
              <option value="google">Google / Android</option>
              <option value="apple">Apple / Mac / Siri</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca voce per nome o codice..."
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-hidden"
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
        </div>
      </div>

      {/* ELENCO COMPLETO DELLE VOCI */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>
            Voci Disponibili ({displayedVoices.length} di {allVoices.length}):
          </span>
          <span className="text-[11px] text-slate-500">
            Clicca su una voce per selezionarla o su "Ascolta" per testarla
          </span>
        </div>

        <div className="max-h-[500px] overflow-y-auto rounded-xl border border-slate-800 divide-y divide-slate-850 bg-slate-950">
          {displayedVoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nessuna voce trovata per i filtri selezionati. Prova a selezionare "Tutte le Lingue" o a cancellare la ricerca.
            </div>
          ) : (
            displayedVoices.map((v) => {
              const isSelected =
                v.id.toLowerCase() === selectedVoice.toLowerCase() ||
                v.name.toLowerCase() === selectedVoice.toLowerCase();
              const isPlaying = previewingVoice === v.id;

              return (
                <div
                  key={`voice-${v.id}`}
                  onClick={() => handleSelectVoice(v)}
                  className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/40 border-l-4 border-l-red-500'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  {/* Dettagli Voce */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{v.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">
                          {v.displayName}
                        </span>

                        {/* Genere */}
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            v.gender === 'Maschile'
                              ? 'bg-sky-950/70 text-sky-300 border-sky-700/50'
                              : v.gender === 'Femminile'
                              ? 'bg-rose-950/70 text-rose-300 border-rose-700/50'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {v.gender === 'Maschile' ? '♂ Maschile' : v.gender === 'Femminile' ? '♀ Femminile' : 'Neutro'}
                        </span>

                        {/* Provider */}
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            v.provider === 'Studio TG'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-700/40'
                              : v.provider === 'Microsoft'
                              ? 'bg-blue-950/60 text-blue-300 border-blue-700/40'
                              : v.provider === 'Apple'
                              ? 'bg-purple-950/60 text-purple-300 border-purple-700/40'
                              : v.provider === 'Google / Android'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {v.provider}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400">
                          {v.lang}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pulsanti Azione */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPreview(v);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-600 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Ferma</span>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVoice(v);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isSelected ? 'In Uso ✓' : 'Seleziona'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
