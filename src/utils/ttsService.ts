import { lipSyncEngine } from './audioLipSync';
import { GOOGLE_VOICE_CATALOG } from '../data/languages';

export interface TTSResult {
  source: 'google_tts' | 'gemini_tts' | 'browser_fallback';
  audioBuffer?: ArrayBuffer;
  duration?: number;
  error?: string;
}

export class TTSService {
  private audioCache = new Map<string, ArrayBuffer>();

  // Generate speech from server-side Google Neural TTS or Gemini 3.8 TTS
  public async generateSpeech(
    text: string,
    voice: string = 'Kore',
    languageCode: string = 'it-IT',
    speechStyle?: string
  ): Promise<TTSResult> {
    const cacheKey = `${voice}_${languageCode}_${speechStyle || ''}_${text.slice(0, 100)}`;
    if (this.audioCache.has(cacheKey)) {
      const buffer = this.audioCache.get(cacheKey)!;
      return { source: 'google_tts', audioBuffer: buffer };
    }

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice,
          language: languageCode,
          speechStyle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioData) {
          // Base64 to ArrayBuffer
          const binaryString = window.atob(data.audioData);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const buffer = bytes.buffer;
          this.audioCache.set(cacheKey, buffer);
          return { source: data.source || 'google_tts', audioBuffer: buffer };
        }
      }

      return { source: 'browser_fallback' };
    } catch (_err) {
      return { source: 'browser_fallback' };
    }
  }

  // Play news script using Google TTS audio buffer or client Web Speech API
  public async speakNews(
    text: string,
    voiceName: string = 'Kore',
    languageCode: string = 'it-IT',
    onEnd?: () => void,
    speechStyle?: string
  ): Promise<{ source: 'google_tts' | 'gemini_tts' | 'browser_fallback'; duration: number }> {
    // 1. Try server-side Google / Gemini Neural TTS
    const result = await this.generateSpeech(text, voiceName, languageCode, speechStyle);

    if ((result.source === 'google_tts' || result.source === 'gemini_tts') && result.audioBuffer) {
      const duration = await lipSyncEngine.playAudioBuffer(result.audioBuffer, onEnd);
      return { source: result.source, duration };
    }

    // 2. Browser Web Speech API fallback
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        resolve({ source: 'browser_fallback', duration: 3 });
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;

      // Match voice from catalog for fine-tuned pitch & rate
      const catalogVoice = GOOGLE_VOICE_CATALOG.find((v) => v.id === voiceName);
      utterance.rate = catalogVoice?.rate || 1.0;
      utterance.pitch = catalogVoice?.pitch || 1.0;

      // Try to find matching voice from browser's speechSynthesis
      const voices = window.speechSynthesis.getVoices();
      const exactNameMatch = voices.find(
        (v) => v.name.toLowerCase() === voiceName.toLowerCase()
      );
      const googleVoiceMatch = voices.find(
        (v) =>
          (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes(voiceName.toLowerCase())) &&
          (v.lang.startsWith(languageCode.slice(0, 2)) || v.lang === languageCode)
      );
      const langMatch = voices.find(
        (v) => v.lang.startsWith(languageCode.slice(0, 2)) || v.lang === languageCode
      );

      const matchedVoice = exactNameMatch || googleVoiceMatch || langMatch;
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      // Estimate duration based on word count (~ 130 words per minute)
      const words = text.split(/\s+/).length;
      const estimatedDuration = Math.max(3, (words / (130 * utterance.rate)) * 60);

      // Start procedural lip sync on engine
      lipSyncEngine.startSyntheticSpeaking(text, estimatedDuration);

      utterance.onend = () => {
        lipSyncEngine.stopSyntheticSpeaking();
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        lipSyncEngine.stopSyntheticSpeaking();
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
      resolve({ source: 'browser_fallback', duration: estimatedDuration });
    });
  }

  // Quick audio test for a selected voice
  public async previewVoice(
    voiceName: string,
    languageCode: string = 'it-IT',
    sampleText?: string
  ) {
    this.stopSpeaking();
    const defaultText =
      languageCode.startsWith('it')
        ? 'Buonasera, questa è la voce Google selezionata per il nostro notiziario.'
        : 'Good evening, this is the Google broadcast voice selected for our newscast.';
    const textToSpeak = sampleText || defaultText;

    await this.speakNews(textToSpeak, voiceName, languageCode);
  }

  public stopSpeaking() {
    lipSyncEngine.stop();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const ttsService = new TTSService();
