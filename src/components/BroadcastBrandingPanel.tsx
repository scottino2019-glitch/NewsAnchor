import React, { useState } from 'react';
import { BroadcastSettings } from '../types/news';
import { Tv, Palette, Plus, Trash2, Clock, Check } from 'lucide-react';

interface BroadcastBrandingPanelProps {
  settings: BroadcastSettings;
  onChange: (updated: Partial<BroadcastSettings>) => void;
}

export const BroadcastBrandingPanel: React.FC<BroadcastBrandingPanelProps> = ({
  settings,
  onChange,
}) => {
  const [newTickerText, setNewTickerText] = useState('');

  const BRAND_COLORS = [
    { name: 'Rosso Allerta TG', hex: '#e11d48' },
    { name: 'Blu Reale News', hex: '#2563eb' },
    { name: 'Ciano Cyber Tech', hex: '#06b6d4' },
    { name: 'Smeraldo Economia', hex: '#059669' },
    { name: 'Ambra Breaking', hex: '#d97706' },
    { name: 'Viola Deep Insight', hex: '#7c3aed' },
  ];

  const handleAddTicker = () => {
    if (!newTickerText.trim()) return;
    onChange({
      tickerItems: [...settings.tickerItems, newTickerText.trim()],
    });
    setNewTickerText('');
  };

  const handleRemoveTicker = (index: number) => {
    const updated = [...settings.tickerItems];
    updated.splice(index, 1);
    onChange({ tickerItems: updated });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-red-500" />
          <h3 className="font-bold text-white text-sm tracking-wide">
            GRAFICHE TELEVISIVE, LOGO & SCORREVOLE TICKER
          </h3>
        </div>
        <span className="font-mono text-xs text-slate-400">
          Broadcast Package 4K
        </span>
      </div>

      {/* 1. CHANNEL BRANDING */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
            Nome Canale Televisivo
          </label>
          <input
            type="text"
            value={settings.channelName}
            onChange={(e) => onChange({ channelName: e.target.value })}
            placeholder="ES: TG NOTIZIE 24"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-red-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
            Logo Bug (Sigla Grafica)
          </label>
          <input
            type="text"
            value={settings.channelLogoText}
            onChange={(e) => onChange({ channelLogoText: e.target.value })}
            placeholder="ES: TG24"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold uppercase focus:border-red-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
            Badge Live / Diretta
          </label>
          <input
            type="text"
            value={settings.liveBadgeText}
            onChange={(e) => onChange({ liveBadgeText: e.target.value })}
            placeholder="ES: DIRETTA, LIVE, ULTIM'ORA"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold uppercase focus:border-red-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* 2. BRAND COLOR THEME */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          <span>Colore Identità Canale & Fascia Notizie</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {BRAND_COLORS.map((col) => (
            <button
              key={col.hex}
              onClick={() => onChange({ primaryColor: col.hex })}
              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                settings.primaryColor === col.hex
                  ? 'border-white bg-slate-800 ring-2 ring-white/30 shadow-md'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              <span
                className="w-5 h-5 rounded-full shrink-0 shadow-sm border border-white/20"
                style={{ backgroundColor: col.hex }}
              />
              <span className="text-xs font-bold text-white line-clamp-1">{col.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. CLOCK & TICKER TOGGLE */}
      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showClock}
            onChange={(e) => onChange({ showClock: e.target.checked })}
            className="w-4 h-4 rounded-md accent-red-600 bg-slate-950 border-slate-800"
          />
          <span className="text-xs font-semibold text-slate-200">
            Mostra Orologio Studio in Alto a Destra
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showTicker}
            onChange={(e) => onChange({ showTicker: e.target.checked })}
            className="w-4 h-4 rounded-md accent-red-600 bg-slate-950 border-slate-800"
          />
          <span className="text-xs font-semibold text-slate-200">
            Attiva Striscia Notizie Scorrevole (Ticker Marquee)
          </span>
        </label>
      </div>

      {/* 4. SCROLLING TICKER ITEMS MANAGER */}
      {settings.showTicker && (
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Notizie nel Rullo Scorrevole ({settings.tickerItems.length} Elementi)
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              Scorrono continuamente sul fondo dello schermo
            </span>
          </div>

          {/* Add ticker item */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTickerText}
              onChange={(e) => setNewTickerText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTicker()}
              placeholder="Inserisci nuova notizia per il rullo scorrevole (premi Invio)..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-hidden"
            />
            <button
              onClick={handleAddTicker}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi</span>
            </button>
          </div>

          {/* Existing Ticker Items List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {settings.tickerItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="line-clamp-1">{item}</span>
                </div>
                <button
                  onClick={() => handleRemoveTicker(idx)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 transition-opacity shrink-0"
                  title="Rimuovi notizia"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
