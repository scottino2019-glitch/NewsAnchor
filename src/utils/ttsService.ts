import { lipSyncEngine } from './audioLipSync';
import { ALL_GOOGLE_AND_ANDROID_VOICES, STUDIO_CLOUD_VOICES } from '../data/googleVoices';

export interface TTSResult {
  source: 'browser' | 'google_tts';
  audioBuffer?: ArrayBuffer;
  duration?: number;
  error?: string;
}

export class TTSService {
  private audioCache = new Map<string, string>(); // cache text+voice to base64 audio
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  // Speak news text with exact voice selection and natural 1.0 pitch/speed (no artificial distortion)
  public async speakNews(
    text: string,
    voiceName: string = '',
    languageCode: string = 'it-IT',
    onEnd?: () => void,
    options?: { pitch?: number; rate?: number }
  ): Promise<{ source: 'browser' | 'google_tts'; duration: number }> {
    const cleanText = text.replace(/[\n\r]+/g, ' ').trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return { source: 'browser', duration: 0 };
    }

    // Strictly natural pitch and rate defaults (1.0 = pure un-altered voice)
    // Look for preset options for studio voices
    const studioPreset = STUDIO_CLOUD_VOICES.find(
      (gv) => gv.id.toLowerCase() === voiceName.toLowerCase() || gv.name.toLowerCase() === voiceName.toLowerCase()
    );

    // Strictly natural pitch and rate defaults (or custom studio anchor preset)
    const targetPitch =
      typeof options?.pitch === 'number' && !isNaN(options.pitch)
        ? options.pitch
        : studioPreset?.pitchDefault ?? (
            voiceName.toLowerCase().includes('marco') ||
            voiceName.toLowerCase().includes('kenji') ||
            voiceName.toLowerCase().includes('maschile') ||
            voiceName.toLowerCase().includes('male')
              ? 0.85
              : 1.05
          );

    const targetRate =
      typeof options?.rate === 'number' && !isNaN(options.rate)
        ? options.rate
        : studioPreset?.rateDefault ?? 1.0;

    // 1. If it's a real voice installed on device/browser, ALWAYS play it directly with browser synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const vTarget = voiceName.trim().toLowerCase();

      // Find exact voice by name or voiceURI or loose match
      const matchedBrowserVoice = voices.find(
        (v) =>
          v.name.toLowerCase() === vTarget ||
          (v.voiceURI && v.voiceURI.toLowerCase() === vTarget) ||
          v.name.toLowerCase().startsWith(vTarget)
      );

      if (matchedBrowserVoice) {
        return this.speakWithBrowserSynth(
          cleanText,
          matchedBrowserVoice,
          languageCode,
          targetPitch,
          targetRate,
          onEnd
        );
      }
    }

    // 2. Otherwise use Studio Google TTS audio generation via server endpoint with distinct pitch
    return this.speakWithServerGoogleTTS(cleanText, voiceName, languageCode, onEnd, targetPitch, targetRate);
  }

  // Implementation of natural browser / Android speech synthesis with watchdog timer
  private speakWithBrowserSynth(
    text: string,
    matchedVoice: SpeechSynthesisVoice,
    languageCode: string,
    pitch: number,
    rate: number,
    onEnd?: () => void
  ): Promise<{ source: 'browser'; duration: number }> {
    return new Promise((resolve) => {
      this.stopSpeaking();

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || languageCode;

      // Keep natural pitch and speed (no forced alterations)
      utterance.pitch = Math.min(2.0, Math.max(0.5, pitch));
      utterance.rate = Math.min(2.0, Math.max(0.5, rate));

      this.activeUtterance = utterance;

      // Calculate realistic duration based on word count
      const words = text.split(/\s+/).length;
      const estimatedDuration = Math.max(2.5, (words / (135 * utterance.rate)) * 60);

      // Start procedural mouth visemes matching real speech
      lipSyncEngine.startSyntheticSpeaking(text, estimatedDuration);

      let finished = false;
      let watchdogTimer: number | null = null;

      const finishSpeaking = () => {
        if (finished) return;
        finished = true;
        if (watchdogTimer !== null) {
          window.clearTimeout(watchdogTimer);
          watchdogTimer = null;
        }
        this.activeUtterance = null;
        lipSyncEngine.stopSyntheticSpeaking();
        if (onEnd) onEnd();
      };

      utterance.onend = finishSpeaking;
      utterance.onerror = finishSpeaking;

      // Watchdog timer: Chrome speech synthesis sometimes drops onend event on longer text
      watchdogTimer = window.setTimeout(() => {
        if (!finished) {
          finishSpeaking();
        }
      }, Math.max(3500, (estimatedDuration + 2.5) * 1000));

      window.speechSynthesis.speak(utterance);
      resolve({ source: 'browser', duration: estimatedDuration });
    });
  }

  // Google Cloud / Neural TTS server audio engine
  private async speakWithServerGoogleTTS(
    text: string,
    voiceName: string,
    languageCode: string,
    onEnd?: () => void,
    pitch: number = 1.0,
    rate: number = 1.0
  ): Promise<{ source: 'google_tts' | 'browser'; duration: number }> {
    this.stopSpeaking();

    try {
      const cacheKey = `${languageCode}_${voiceName}_${text}`;
      let cached = this.audioCache.get(cacheKey);
      let chunksData: string[] | null = null;
      let audioBase64 = cached;

      if (!cached) {
        const response = await fetch('/api/tts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            language: languageCode,
            voice: voiceName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.chunks && Array.isArray(data.chunks) && data.chunks.length > 0) {
            chunksData = data.chunks;
          }
          if (data.audioData) {
            audioBase64 = data.audioData;
            this.audioCache.set(cacheKey, audioBase64!);
          }
        }
      }

      // If we have separate MP3 chunks, decode each individually to guarantee pure, glitch-free audio
      if (chunksData && chunksData.length > 0) {
        const chunkArrayBuffers: ArrayBuffer[] = chunksData.map((b64: string) => {
          const binary = window.atob(b64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          return bytes.buffer;
        });

        const duration = await lipSyncEngine.playAudioChunks(chunkArrayBuffers, onEnd, pitch);
        if (duration > 0) {
          return { source: 'google_tts', duration };
        }
      }

      // Fallback to single combined buffer
      if (audioBase64) {
        const binaryString = window.atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const duration = await lipSyncEngine.playAudioBuffer(bytes.buffer, onEnd, pitch);
        if (duration > 0) {
          return { source: 'google_tts', duration };
        }
      }
    } catch (err) {
      console.warn('Server Google TTS fallback error, trying browser fallback:', err);
    }

    // Final fallback to any available browser voice for language if server fails
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const prefix = languageCode.slice(0, 2).toLowerCase();
      const fallbackVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) || voices[0];
      if (fallbackVoice) {
        return this.speakWithBrowserSynth(text, fallbackVoice, languageCode, pitch, rate, onEnd);
      }
    }

    if (onEnd) onEnd();
    return { source: 'google_tts', duration: 2.5 };
  }

  // Quick audio test for selected voice with natural pitch and speed
  public async previewVoice(
    voiceName: string,
    languageCode: string = 'it-IT',
    sampleText?: string,
    options?: { pitch?: number; rate?: number }
  ) {
    this.stopSpeaking();

    const studioPreset = STUDIO_CLOUD_VOICES.find(
      (sv) => sv.id.toLowerCase() === voiceName.toLowerCase() || sv.name.toLowerCase() === voiceName.toLowerCase()
    );

    const isMale =
      studioPreset?.gender === 'Maschile' ||
      ['marco', 'kenji', 'maschile', 'male', 'uomo', 'cosimo', 'luca', 'david', 'mark', 'daniel', 'stefan', 'oliver', 'thomas'].some(
        (m) => voiceName.toLowerCase().includes(m)
      );

    const defaultText =
      sampleText ||
      (languageCode.startsWith('it')
        ? (isMale
            ? 'Buonasera dal telegiornale. Sono la voce maschile per questa edizione informativa.'
            : 'Buonasera dal telegiornale. Sono la voce femminile per questa edizione informativa.')
        : (isMale
            ? 'Good evening from the news desk. This is the male anchor voice for tonight broadcast.'
            : 'Good evening from the news desk. This is the female anchor voice for tonight broadcast.'));

    const effectivePitch = options?.pitch ?? studioPreset?.pitchDefault ?? (isMale ? 0.85 : 1.05);
    const effectiveRate = options?.rate ?? studioPreset?.rateDefault ?? 1.0;

    await this.speakNews(defaultText, voiceName, languageCode, undefined, {
      pitch: effectivePitch,
      rate: effectiveRate,
    });
  }

  public stopSpeaking() {
    lipSyncEngine.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.activeUtterance = null;
  }
}

export const ttsService = new TTSService();
