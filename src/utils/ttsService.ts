import { lipSyncEngine } from './audioLipSync';
import { classifyVoice } from './voiceClassification';

export interface TTSResult {
  source: 'browser' | 'google_tts';
  audioBuffer?: ArrayBuffer;
  duration?: number;
  error?: string;
}

export class TTSService {
  private audioCache = new Map<string, ArrayBuffer>();

  // Primary Speech method: Natural Web Speech API with real female & male voices
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

    const targetPitch = typeof options?.pitch === 'number' ? options.pitch : 1.0;
    const targetRate = typeof options?.rate === 'number' ? options.rate : 1.0;

    // Check for browser speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return this.speakWithBrowserSynth(cleanText, voiceName, languageCode, targetPitch, targetRate, onEnd);
    }

    // Server fallback only when browser speech synthesis is unavailable
    return this.speakWithServerFallback(cleanText, languageCode, onEnd);
  }

  // Implementation of natural browser speech synthesis
  private speakWithBrowserSynth(
    text: string,
    voiceName: string,
    languageCode: string,
    pitch: number,
    rate: number,
    onEnd?: () => void
  ): Promise<{ source: 'browser'; duration: number }> {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;
      utterance.pitch = Math.min(1.5, Math.max(0.7, pitch));
      utterance.rate = Math.min(1.5, Math.max(0.7, rate));

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = languageCode.slice(0, 2).toLowerCase();

      let matchedVoice: SpeechSynthesisVoice | null = null;

      // 1. Exact match by voice name or voiceURI
      if (voiceName) {
        const vTarget = voiceName.toLowerCase();
        matchedVoice =
          voices.find(
            (v) =>
              v.name.toLowerCase() === vTarget ||
              (v.voiceURI && v.voiceURI.toLowerCase() === vTarget)
          ) || null;
      }

      // 2. If no exact match, search by gender preference
      if (!matchedVoice) {
        const isFemalePref = voiceName.includes('female') || voiceName.includes('donna') || pitch >= 1.1;
        const isMalePref = voiceName.includes('male') || voiceName.includes('uomo') || pitch <= 0.9;

        const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

        if (langVoices.length > 0) {
          const categorized = langVoices.map(classifyVoice);

          if (isFemalePref) {
            const femaleMatch = categorized.find((cv) => cv.gender === 'Femminile');
            if (femaleMatch) matchedVoice = femaleMatch.voice;
          } else if (isMalePref) {
            const maleMatch = categorized.find((cv) => cv.gender === 'Maschile');
            if (maleMatch) matchedVoice = maleMatch.voice;
          }

          // Prefer Google voices if no gender-specific match
          if (!matchedVoice) {
            const googleMatch = categorized.find((cv) => cv.isGoogle);
            if (googleMatch) matchedVoice = googleMatch.voice;
          }

          // Fallback to first available voice for that language
          if (!matchedVoice) {
            matchedVoice = langVoices[0];
          }
        }
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang || languageCode;
      }

      // Calculate realistic duration based on word count
      const words = text.split(/\s+/).length;
      const estimatedDuration = Math.max(2.5, (words / (135 * utterance.rate)) * 60);

      // Start procedural mouth visemes matching real speech
      lipSyncEngine.startSyntheticSpeaking(text, estimatedDuration);

      let finished = false;
      const finishSpeaking = () => {
        if (finished) return;
        finished = true;
        lipSyncEngine.stopSyntheticSpeaking();
        if (onEnd) onEnd();
      };

      utterance.onend = finishSpeaking;
      utterance.onerror = finishSpeaking;

      // Ensure speech synthesis speaks after user gesture
      window.speechSynthesis.speak(utterance);
      resolve({ source: 'browser', duration: estimatedDuration });
    });
  }

  // Server audio fallback
  private async speakWithServerFallback(
    text: string,
    languageCode: string,
    onEnd?: () => void
  ): Promise<{ source: 'google_tts'; duration: number }> {
    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: languageCode }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioData) {
          const binaryString = window.atob(data.audioData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          // Play at clean, natural 1.0 pitch
          const duration = await lipSyncEngine.playAudioBuffer(bytes.buffer, onEnd, 1.0);
          return { source: 'google_tts', duration };
        }
      }
    } catch (_err) {
      // ignore
    }

    if (onEnd) onEnd();
    return { source: 'google_tts', duration: 2 };
  }

  // Quick audio test for a selected voice
  public async previewVoice(
    voiceName: string,
    languageCode: string = 'it-IT',
    sampleText?: string,
    options?: { pitch?: number; rate?: number }
  ) {
    this.stopSpeaking();

    const defaultText = languageCode.startsWith('it')
      ? 'Buonasera e benvenuti alla nostra edizione delle notizie. Questa è la prova audio per la voce selezionata del telegiornale.'
      : 'Good evening and welcome to our news broadcast. This is the audio test for the selected newscast voice.';

    const textToSpeak = sampleText || defaultText;
    await this.speakNews(textToSpeak, voiceName, languageCode, undefined, options);
  }

  public stopSpeaking() {
    lipSyncEngine.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const ttsService = new TTSService();
