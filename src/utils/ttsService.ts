import { lipSyncEngine } from './audioLipSync';
import { ALL_GOOGLE_AND_ANDROID_VOICES } from '../data/googleVoices';

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
    const targetPitch = typeof options?.pitch === 'number' && !isNaN(options.pitch) ? options.pitch : 1.0;
    const targetRate = typeof options?.rate === 'number' && !isNaN(options.rate) ? options.rate : 1.0;

    // Check if user chose an explicit Google voice from catalog
    const isGoogleApiVoice =
      ALL_GOOGLE_AND_ANDROID_VOICES.some(
        (gv) => gv.id.toLowerCase() === voiceName.toLowerCase() || gv.name.toLowerCase() === voiceName.toLowerCase()
      ) ||
      voiceName.includes('Neural2') ||
      voiceName.includes('Wavenet') ||
      voiceName.includes('Journey') ||
      voiceName.includes('Standard-') ||
      voiceName.startsWith('Google ');

    // 1. If it's a browser / Android system voice installed on device, prefer browser synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const vTarget = voiceName.trim().toLowerCase();

      // Find exact voice by name or voiceURI
      const matchedBrowserVoice = voices.find(
        (v) =>
          v.name.toLowerCase() === vTarget ||
          (v.voiceURI && v.voiceURI.toLowerCase() === vTarget)
      );

      // If user selected an installed Android / Google / System voice, play it directly
      if (matchedBrowserVoice && !isGoogleApiVoice) {
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

    // 2. Otherwise use Google TTS audio generation via server endpoint
    return this.speakWithServerGoogleTTS(cleanText, voiceName, languageCode, onEnd, targetPitch, targetRate);
  }

  // Implementation of natural browser / Android speech synthesis
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
      const finishSpeaking = () => {
        if (finished) return;
        finished = true;
        this.activeUtterance = null;
        lipSyncEngine.stopSyntheticSpeaking();
        if (onEnd) onEnd();
      };

      utterance.onend = finishSpeaking;
      utterance.onerror = finishSpeaking;

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
      let audioBase64 = this.audioCache.get(cacheKey);

      if (!audioBase64) {
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
          if (data.audioData) {
            audioBase64 = data.audioData;
            this.audioCache.set(cacheKey, audioBase64!);
          }
        }
      }

      if (audioBase64) {
        const binaryString = window.atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Play at pure un-altered natural pitch (default 1.0)
        const duration = await lipSyncEngine.playAudioBuffer(bytes.buffer, onEnd, pitch);
        return { source: 'google_tts', duration };
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

  // Quick audio test for selected voice with natural 1.0 pitch and speed
  public async previewVoice(
    voiceName: string,
    languageCode: string = 'it-IT',
    sampleText?: string,
    options?: { pitch?: number; rate?: number }
  ) {
    this.stopSpeaking();

    // Check if voice definition has custom sampleText
    const knownGoogleVoice = ALL_GOOGLE_AND_ANDROID_VOICES.find(
      (v) => v.id.toLowerCase() === voiceName.toLowerCase() || v.name.toLowerCase() === voiceName.toLowerCase()
    );

    const defaultText =
      sampleText ||
      (languageCode.startsWith('it')
        ? 'Buonasera e benvenuti al telegiornale. Questa è la prova audio naturale per la voce selezionata.'
        : 'Good evening and welcome to the news broadcast. This is the natural audio test for the selected voice.');

    await this.speakNews(defaultText, voiceName, languageCode, undefined, {
      pitch: options?.pitch ?? 1.0,
      rate: options?.rate ?? 1.0,
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
