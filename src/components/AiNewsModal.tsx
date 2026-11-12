import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { LanguageOption, AvatarCharacter } from '../types/news';
import { Sparkles, X, Wand2, Globe, Radio } from 'lucide-react';

interface AiNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
  currentLanguage: LanguageOption;
  anchorCharacter: AvatarCharacter;
}

export const AiNewsModal: React.FC<AiNewsModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  currentLanguage,
  anchorCharacter,
}) => {
  const [topic, setTopic] = useState('');
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(currentLanguage);
  const [tone, setTone] = useState('breaking');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/news/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() || selectedLang.defaultTopic,
          language: `${selectedLang.name} (${selectedLang.code})`,
          tone,
          anchorGender: ['marco', 'kenji'].includes(anchorCharacter) ? 'male' : 'female',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      onGenerate(data);
      onClose();
    } catch (err: any) {
      console.error('AI Generation error:', err);
      setErrorMessage(
        err.message || 'Errore nella generazione del notiziario. Verifica la chiave API o riprova.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_TEMPLATES = [
    {
      title: 'Breaking News Globale',
      topic: 'Accordo storico sul clima e sviluppo di nuove energie rinnovabili a livello mondiale',
    },
    {
      title: 'Rivoluzione Tech & AI',
      topic: 'Presentata la nuova generazione di chip neurali e robotica avanzata per la medicina',
    },
    {
      title: 'Mercati & Economia Internazionale',
      topic: 'Borse in forte rialzo, calo dell inflazione e investimenti record nelle startup',
    },
    {
      title: 'Esplorazione Spaziale & Astrofisica',
      topic: 'Telescopio spaziale individua possibile acqua liquida su un esopianeta vicino',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">
                Generatore Scaletta Notiziario Studio
              </h3>
              <p className="text-xs text-slate-400">
                Crea automaticamente la scaletta completa con script vocali per Google TTS, grafiche PiP e titoli di coda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Topic Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Argomento del Notiziario o Fatto del Giorno
          </label>
          <textarea
            rows={3}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={`Es: ${selectedLang.defaultTopic}`}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-hidden resize-none"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase">
            Spunti Rapidi:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => setTopic(tmpl.topic)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Language & Tone Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Lingua Notiziario</span>
            </label>
            <select
              value={selectedLang.code}
              onChange={(e) => {
                const found = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) setSelectedLang(found);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-red-500 focus:outline-hidden"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.region.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Stile Editoriale
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-red-500 focus:outline-hidden"
            >
              <option value="breaking">Edizione Straordinaria (Breaking News Ufficiale)</option>
              <option value="authoritative">Telegiornale Principale di Prima Serata</option>
              <option value="tech_financial">Approfondimento Tech & Borsa Finanziaria</option>
              <option value="morning_breeze">Rassegna Stampa Mattutina Dinamica</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Annulla
          </button>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg ring-2 ring-red-500/30"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generazione Scaletta in corso...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Genera Notiziario Completo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
