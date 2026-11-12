import React from 'react';
import { X, Video, Download, RotateCcw, CheckCircle, Disc } from 'lucide-react';

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRecording: boolean;
  recordingSeconds: number;
  downloadUrl: string | null;
  onStartRecord: () => void;
  onStopRecord: () => void;
  channelName: string;
  showCredits?: boolean;
}

export const VideoExportModal: React.FC<VideoExportModalProps> = ({
  isOpen,
  onClose,
  isRecording,
  recordingSeconds,
  downloadUrl,
  onStartRecord,
  onStopRecord,
  channelName,
  showCredits = false,
}) => {
  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">
                Esporta Video Notiziario
              </h3>
              <p className="text-xs text-slate-400">
                Registra in tempo reale con avatar parlante, lip-sync, grafiche e titoli di coda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Preview Area */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center space-y-4">
          {isRecording ? (
            <div className="space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center animate-ping absolute" />
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl">
                  <Disc className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-red-500">
                  {formatTime(recordingSeconds)}
                </div>
                {showCredits ? (
                  <div className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/50">
                    <p className="text-xs text-indigo-300 font-bold">
                      🎬 Titoli di coda in scorrimento nel video...
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Premi "Ferma Registrazione" quando i crediti sono completati.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-300 font-semibold mt-1">
                      Registrazione in corso dello studio e dell'audio vocale...
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Al termine delle notizie scorreranno automaticamente i titoli di coda.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : downloadUrl ? (
            <div className="space-y-3 w-full">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">
                  Video Notiziario Registrato con Successo!
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Durata: {formatTime(recordingSeconds)} • Formato broadcast WebM HD
                </p>
              </div>

              {/* Video Player Preview */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
                <video
                  src={downloadUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <a
                  href={downloadUrl}
                  download={`${(channelName || 'TG-Notiziario').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.webm`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Scarica File Video (.webm)</span>
                </a>

                <button
                  onClick={onStartRecord}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nuova Registrazione</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mx-auto">
                <Video className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">
                  Pronto per la Registrazione
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Verrà catturata l'inquadratura dello studio a 30 FPS con l'avatar animato, la sincronizzazione labiale e la voce Google TTS.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Chiudi
          </button>

          {!downloadUrl && (
            <div>
              {isRecording ? (
                <button
                  onClick={onStopRecord}
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg ring-2 ring-red-400 animate-pulse"
                >
                  Ferma Registrazione
                </button>
              ) : (
                <button
                  onClick={onStartRecord}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg"
                >
                  <Disc className="w-4 h-4" />
                  <span>Avvia Registrazione</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
