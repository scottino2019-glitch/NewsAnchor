import React, { useState } from 'react';
import { CreditsSettings, CreditItem } from '../types/news';
import { ScrollText, Plus, Trash2, Play, Eye } from 'lucide-react';

interface CreditsEditorPanelProps {
  settings: CreditsSettings;
  onChange: (updated: Partial<CreditsSettings>) => void;
  onPreviewCredits: () => void;
}

export const CreditsEditorPanel: React.FC<CreditsEditorPanelProps> = ({
  settings,
  onChange,
  onPreviewCredits,
}) => {
  const [newRole, setNewRole] = useState('');
  const [newName, setNewName] = useState('');

  const handleAddItem = () => {
    if (!newRole.trim() || !newName.trim()) return;
    const newItem: CreditItem = {
      id: `credit-${Date.now()}`,
      role: newRole.trim(),
      name: newName.trim(),
    };
    onChange({ items: [...settings.items, newItem] });
    setNewRole('');
    setNewName('');
  };

  const handleRemoveItem = (id: string) => {
    onChange({ items: settings.items.filter((item) => item.id !== id) });
  };

  const handleUpdateItem = (id: string, updated: Partial<CreditItem>) => {
    onChange({
      items: settings.items.map((item) =>
        item.id === id ? { ...item, ...updated } : item
      ),
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-red-500" />
          <h3 className="font-bold text-white text-sm tracking-wide">
            TITOLI DI CODA & CREDITI DI PRODUZIONE
          </h3>
        </div>

        <button
          onClick={onPreviewCredits}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-md"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Vedi Scorrimento a Schermo</span>
        </button>
      </div>

      {/* Header & Subheader */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
            Intestazione Titoli
          </label>
          <input
            type="text"
            value={settings.header}
            onChange={(e) => onChange({ header: e.target.value })}
            placeholder="ES: PRODUZIONE TELEVISIVA"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-red-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
            Sottotitolo
          </label>
          <input
            type="text"
            value={settings.subHeader}
            onChange={(e) => onChange({ subHeader: e.target.value })}
            placeholder="ES: Edizione Notiziario • Tutti i Diritti Riservati"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Durata Scorrimento Coda
            </label>
            <span className="font-mono text-xs text-slate-400 font-bold">
              {settings.scrollDuration}s
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            step="5"
            value={settings.scrollDuration}
            onChange={(e) => onChange({ scrollDuration: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
        </div>
      </div>

      {/* Font Size Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Dimensione Carattere Titoli di Coda (Leggibilità a Schermo)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'normal', label: 'Normale', desc: 'Dimensione standard' },
            { id: 'large', label: 'Grande (Consigliato)', desc: 'Testo nitido ed evidente sui monitor broadcast' },
            { id: 'extra_large', label: 'Extra Grande', desc: 'Caratteri giganti ad alto impatto e massima leggibilità' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => onChange({ fontSize: s.id as any })}
              className={`p-3 rounded-xl border text-left transition-all ${
                (settings.fontSize || 'large') === s.id
                  ? 'border-indigo-500 bg-slate-800 text-white ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs">{s.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Add new credit item */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
          Aggiungi Ruolo e Nome
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="Ruolo (es: Regia, Grafica FX, Montaggio)"
            className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white uppercase font-bold focus:border-indigo-500 focus:outline-hidden"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome e Cognome (es: Mario Rossi)"
            className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold focus:border-indigo-500 focus:outline-hidden"
          />
          <button
            onClick={handleAddItem}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Inserisci</span>
          </button>
        </div>
      </div>

      {/* Credits list */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {settings.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs group"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
              <input
                type="text"
                value={item.role}
                onChange={(e) => handleUpdateItem(item.id, { role: e.target.value })}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 font-mono font-bold uppercase focus:border-indigo-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white font-semibold focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
              title="Elimina"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
