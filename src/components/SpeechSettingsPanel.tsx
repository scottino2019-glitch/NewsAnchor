import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, REGION_LABELS } from '../data/languages';
import { LanguageOption, LanguageRegion } from '../types/news';
import { Globe, Mic, Volume2, Sparkles, Check, Languages } from 'lucide-react';

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
  const [translateSuccess, setTranslateSuccess] = useState(false);

  const GOOGLE_VOICES = [
    { id: 'Kore', name: 'Kore', gender: 'Femminile', desc: 'Tono chiaro, caldo ed elegante' },
    { id: 'Puck', name: 'Puck', gender: 'Maschile', desc: 'Voce dinamica e brillante' },
    { id: 'Charon', name: 'Charon', gender: 'Maschile', desc: 'Voce profonda, autorevole per breaking news' },
    { id: 'Fenrir', name: 'Fenrir', gender: 'Maschile', desc: 'Stile telegiornale classico distinto' },
    { id: 'Zephyr', name: 'Zephyr', gender: 'Femminile', desc: 'Stile moderno e fluido per rassegna stampa' },
  ];

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

  const handleTranslateClick = async () => {
    setTranslateSuccess(false);
    await onTranslateAllSlides(selectedLanguage);
    setTranslateSuccess(true);
    setTimeout(() => setTranslateSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-red-500" />
          <h3 className="font-bold text-white text-sm tracking-wide">
            SINTESI VOCALE GOOGLE TTS MULTILINGUE & STILE ANCHOR
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
          <Mic className="w-3.5 h-3.5 text-red-400" />
          <span>Modello: gemini-3.8-flash-lite-tts</span>
        </div>
      </div>

      {/* 1. REGIONAL TABS (Occidentale, Orientale, Slava) */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Famiglia Linguistica (3 Aree Geopolitiche)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(['occidentale', 'orientale', 'slava'] as LanguageRegion[]).map((region) => {
            const isSelected = activeRegion === region;
            const meta = REGION_LABELS[region];

            return (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`p-3 rounded-xl border text-left transition-all ${
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
          Seleziona Lingua del Notiziario
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {filteredLanguages.map((lang) => {
            const isSelected = selectedLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang);
                  onSelectVoice(lang.googleVoice);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
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

      {/* 3. AUTO TRANSLATE SCRIPT TO SELECTED LANGUAGE */}
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
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
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

      {/* 4. GOOGLE TTS PREBUILT VOICES */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Voce Google TTS (VoiceConfig)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {GOOGLE_VOICES.map((v) => {
            const isSelected = selectedVoice === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onSelectVoice(v.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-red-500 bg-slate-800 ring-2 ring-red-500/20 shadow-md'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs font-mono">{v.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {v.gender}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">{v.desc}</div>
              </button>
            );
          })}
        </div>
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
                className={`p-3 rounded-xl border text-left transition-all ${
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
