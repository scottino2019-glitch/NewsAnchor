import React, { useRef } from 'react';
import { AvatarSettings, AvatarPosition } from '../types/news';
import { AVATAR_PROFILES } from '../data/stockAssets';
import { UserCheck, Upload, Smile, Camera, Image as ImageIcon } from 'lucide-react';
import { lipSyncEngine } from '../utils/audioLipSync';

interface AvatarSettingsPanelProps {
  settings: AvatarSettings;
  onChange: (updated: Partial<AvatarSettings>) => void;
}

export const AvatarSettingsPanel: React.FC<AvatarSettingsPanelProps> = ({
  settings,
  onChange,
}) => {
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onChange({
          character: 'custom',
          customAvatarUrl: dataUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerVisemeTest = (v: 'open_a' | 'round_o' | 'wide_e' | 'pressed_m' | 'tongue_l') => {
    // Generate brief procedural syllable test
    lipSyncEngine.startSyntheticSpeaking(
      v === 'open_a' ? 'aaaa' : v === 'round_o' ? 'oooo' : v === 'wide_e' ? 'eeee' : v === 'pressed_m' ? 'mmmm' : 'llll',
      1.2
    );
    setTimeout(() => {
      lipSyncEngine.stopSyntheticSpeaking();
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-red-500" />
          <h3 className="font-bold text-white text-sm tracking-wide">
            PERSONALIZZAZIONE AVATAR & SINCRONIZZAZIONE LABIALE
          </h3>
        </div>
        <span className="font-mono text-xs text-slate-400">
          Audio-Viseme Neural Engine
        </span>
      </div>

      {/* 1. CHARACTER SELECTOR */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Seleziona Giornalista / Conduttore TG
          </label>
          <span className="text-[11px] text-slate-500">
            5 Anchor Televisivi HD + Opzione Foto dal PC
          </span>
        </div>

        <input
          type="file"
          ref={avatarFileInputRef}
          accept="image/*"
          onChange={handleAvatarFileUpload}
          className="hidden"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {AVATAR_PROFILES.map((profile) => {
            const isSelected = settings.character === profile.id;
            return (
              <button
                key={profile.id}
                onClick={() => {
                  if (profile.id === 'custom' && !settings.customAvatarUrl) {
                    avatarFileInputRef.current?.click();
                  } else {
                    onChange({ character: profile.id });
                  }
                }}
                className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-red-500 bg-slate-800/90 ring-2 ring-red-500/30 shadow-lg'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Visual Avatar Mini Icon / Photo */}
                <div
                  className="w-13 h-13 rounded-full border-2 border-white/20 mb-2 flex items-center justify-center font-black text-sm text-white shadow-inner overflow-hidden relative"
                  style={{ backgroundColor: profile.suitColor }}
                >
                  {profile.id === 'custom' && settings.customAvatarUrl ? (
                    <img src={settings.customAvatarUrl} alt="Custom" className="w-full h-full object-cover" />
                  ) : profile.id === 'custom' ? (
                    <Camera className="w-5 h-5 text-amber-400" />
                  ) : (
                    <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="font-bold text-white text-xs leading-tight line-clamp-1">
                  {profile.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-mono">
                  {profile.role}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Avatar Upload Banner */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Vuoi usare la tua foto come Giornalista / Anchor?
              </div>
              <div className="text-[11px] text-slate-400">
                Carica un ritratto in primo piano dal PC: verrà animato in studio con la voce.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => avatarFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Carica Foto dal Tuo Computer</span>
            </button>
            {settings.customAvatarUrl && (
              <button
                type="button"
                onClick={() => onChange({ character: 'elena', customAvatarUrl: undefined })}
                className="text-xs text-red-400 hover:underline px-2 py-1"
              >
                Rimuovi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. POSITIONING & SCALE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
            Inquadratura & Posizione in Studio
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'desk_center', label: 'Al Centro' },
              { id: 'desk_right', label: 'A Destra' },
              { id: 'desk_left', label: 'A Sinistra' },
            ].map((pos) => (
              <button
                key={pos.id}
                onClick={() => onChange({ position: pos.id as AvatarPosition })}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  settings.position === pos.id
                    ? 'border-red-500 bg-slate-800 text-white shadow-xs'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Dimensione Inquadratura Avatar
            </label>
            <span className="font-mono text-xs text-slate-400 font-bold">
              {Math.round(settings.scale * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.4"
            step="0.05"
            value={settings.scale}
            onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
            className="w-full accent-red-500 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
        </div>
      </div>

      {/* 3. LIP-SYNC DYNAMIC SENSITIVITY & MOUTH RANGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Sensibilità Frequenze Audio (FFT)
            </label>
            <span className="font-mono text-xs text-slate-400 font-bold">
              {settings.lipSyncSensitivity.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.lipSyncSensitivity}
            onChange={(e) =>
              onChange({ lipSyncSensitivity: parseFloat(e.target.value) })
            }
            className="w-full accent-red-500 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Determina la reattività del movimento labiale rispetto all'ampiezza dell'audio.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Ampiezza Apertura Bocca & Denti
            </label>
            <span className="font-mono text-xs text-slate-400 font-bold">
              {settings.mouthMovementRange.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1.2"
            step="0.05"
            value={settings.mouthMovementRange}
            onChange={(e) =>
              onChange({ mouthMovementRange: parseFloat(e.target.value) })
            }
            className="w-full accent-red-500 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Controlla l'escursione massima dei visemi (apertura mascella e arrotondamento labbra).
          </p>
        </div>
      </div>

      {/* 4. INTERACTIVE VISEME PHONEME TEST BUTTONS */}
      <div className="pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-sky-400" />
            <span>Test Forme Visemi Labiali (Phoneme Shape Preview)</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            Clicca per testare le forme della bocca
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => triggerVisemeTest('open_a')}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-sky-300 transition-colors"
          >
            Vocale /A/ (Aperta)
          </button>
          <button
            onClick={() => triggerVisemeTest('round_o')}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-sky-300 transition-colors"
          >
            Vocale /O/ (Arrotondata)
          </button>
          <button
            onClick={() => triggerVisemeTest('wide_e')}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-sky-300 transition-colors"
          >
            Vocale /E/ (Tesa)
          </button>
          <button
            onClick={() => triggerVisemeTest('pressed_m')}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-sky-300 transition-colors"
          >
            Bilabiale /M/ /P/
          </button>
          <button
            onClick={() => triggerVisemeTest('tongue_l')}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-sky-300 transition-colors"
          >
            Dentale /L/ /T/
          </button>
        </div>
      </div>
    </div>
  );
};
