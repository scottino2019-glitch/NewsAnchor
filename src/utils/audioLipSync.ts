import { VisemeShape } from '../types/news';

export interface DetailedViseme {
  viseme: VisemeShape;
  openness: number; // 0 to 1 (mouth vertical opening)
  width: number; // 0 to 1 (mouth horizontal stretch)
  roundness: number; // 0 to 1 (pucker/round)
  jawDrop: number; // 0 to 1 (lower jaw displacement)
  teethVisible: number; // 0 to 1 (how much upper/lower teeth peek through)
  tongueVisible: number; // 0 to 1
  eyebrowLift: number; // 0 to 1 (accented emphasis)
}

export const REST_VISEME: DetailedViseme = {
  viseme: 'rest',
  openness: 0.05,
  width: 0.5,
  roundness: 0.2,
  jawDrop: 0,
  teethVisible: 0,
  tongueVisible: 0,
  eyebrowLift: 0,
};

export class AudioLipSyncEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isPlaying = false;
  private smoothedViseme: DetailedViseme = { ...REST_VISEME };

  // For browser speechSynthesis procedural fallback
  private syntheticSpeaking = false;
  private synthStartTime = 0;
  private synthSyllables: Array<{ time: number; viseme: VisemeShape; duration: number }> = [];

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.65;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 1.0;
      this.destinationNode = this.audioCtx.createMediaStreamDestination();

      // Clean single-path routing: gainNode feeds speakers, MediaStream recorder, and FFT analyser
      this.gainNode.connect(this.audioCtx.destination);
      this.gainNode.connect(this.destinationNode);
      this.gainNode.connect(this.analyser);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  public getAudioStream(): MediaStream | null {
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  // Concatenate multiple decoded AudioBuffers into one seamless PCM AudioBuffer
  public concatenateAudioBuffers(buffers: AudioBuffer[]): AudioBuffer | null {
    if (buffers.length === 0) return null;
    if (buffers.length === 1) return buffers[0];

    const ctx = this.initAudioContext();
    const sampleRate = buffers[0].sampleRate;
    const numberOfChannels = Math.max(...buffers.map((b) => b.numberOfChannels));
    const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);

    const merged = ctx.createBuffer(numberOfChannels, totalLength, sampleRate);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = merged.getChannelData(channel);
      let offset = 0;
      for (const b of buffers) {
        if (channel < b.numberOfChannels) {
          channelData.set(b.getChannelData(channel), offset);
        } else {
          // Fallback mono to stereo
          channelData.set(b.getChannelData(0), offset);
        }
        offset += b.length;
      }
    }
    return merged;
  }

  // Play audio chunks (each chunk is a standalone valid MP3 buffer, decoded cleanly)
  public async playAudioChunks(
    chunkBuffers: ArrayBuffer[],
    onEnded?: () => void,
    pitch: number = 1.0
  ): Promise<number> {
    const ctx = this.initAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.stop();

    // Decode each chunk individually to avoid corrupted MP3 frame headers
    const decodedBuffers: AudioBuffer[] = [];
    for (const chunk of chunkBuffers) {
      try {
        const decoded = await ctx.decodeAudioData(chunk.slice(0));
        decodedBuffers.push(decoded);
      } catch (e) {
        console.warn('Error decoding individual audio chunk:', e);
      }
    }

    if (decodedBuffers.length === 0) {
      if (onEnded) onEnded();
      return 0;
    }

    const mergedBuffer = this.concatenateAudioBuffers(decodedBuffers);
    if (!mergedBuffer) {
      if (onEnded) onEnded();
      return 0;
    }

    return this.playDecodedAudioBuffer(mergedBuffer, onEnded, pitch);
  }

  // Play a single array buffer
  public async playAudioBuffer(
    arrayBuffer: ArrayBuffer,
    onEnded?: () => void,
    pitch: number = 1.0
  ): Promise<number> {
    const ctx = this.initAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.stop();

    try {
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      return this.playDecodedAudioBuffer(decodedBuffer, onEnded, pitch);
    } catch (e) {
      console.warn('Error decoding audio buffer:', e);
      if (onEnded) onEnded();
      return 0;
    }
  }

  // Common playback logic for a decoded AudioBuffer
  private playDecodedAudioBuffer(
    decodedBuffer: AudioBuffer,
    onEnded?: () => void,
    pitch: number = 1.0
  ): number {
    const ctx = this.initAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = decodedBuffer;

    // Natural 1.0 playback rate (mild tweak only if explicitly requested)
    const safeRate = typeof pitch === 'number' && pitch >= 0.85 && pitch <= 1.15 ? pitch : 1.0;
    source.playbackRate.value = safeRate;

    // Connect ONLY to gainNode (gainNode already routes cleanly to speakers, recorder stream, and analyser)
    if (this.gainNode) {
      source.connect(this.gainNode);
    }

    this.currentSource = source;
    this.isPlaying = true;

    source.onended = () => {
      this.isPlaying = false;
      this.currentSource = null;
      if (onEnded) onEnded();
    };

    source.start(0);
    return decodedBuffer.duration / safeRate;
  }

  // Fallback procedural speaking for Web Speech API
  public startSyntheticSpeaking(text: string, durationSeconds = 5) {
    this.syntheticSpeaking = true;
    this.synthStartTime = performance.now();

    // Generate pseudo phoneme timeline based on vowels & consonants in text
    const words = text.split(/\s+/);
    const timeline: Array<{ time: number; viseme: VisemeShape; duration: number }> = [];
    let curTime = 0;
    const avgWordDuration = durationSeconds / Math.max(words.length, 1);

    for (const word of words) {
      const letters = word.toLowerCase().split('');
      const step = avgWordDuration / Math.max(letters.length, 1);

      for (const char of letters) {
        let v: VisemeShape = 'rest';
        if (['a', 'á', 'à', 'ä', 'я'].includes(char)) v = 'open_a';
        else if (['o', 'ó', 'ò', 'ö', 'u', 'ú', 'ù', 'ю'].includes(char)) v = 'round_o';
        else if (['e', 'é', 'è', 'i', 'í', 'ì', 'ы', 'и'].includes(char)) v = 'wide_e';
        else if (['m', 'b', 'p', 'м', 'б', 'п'].includes(char)) v = 'pressed_m';
        else if (['f', 'v', 'ф', 'в'].includes(char)) v = 'teeth_f';
        else if (['l', 'r', 't', 'd', 's', 'z', 'n', 'л', 'р', 'т', 'д', 'с', 'з', 'н'].includes(char)) v = 'tongue_l';

        timeline.push({ time: curTime, viseme: v, duration: step });
        curTime += step;
      }
      curTime += 0.08; // pause between words
    }

    this.synthSyllables = timeline;
  }

  public stopSyntheticSpeaking() {
    this.syntheticSpeaking = false;
    this.synthSyllables = [];
  }

  public stop() {
    if (this.currentSource) {
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
      } catch (e) {
        // ignore already stopped
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
    this.stopSyntheticSpeaking();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying || this.syntheticSpeaking;
  }

  // Call on every animation frame to get the instantaneous lip-sync targets
  public update(sensitivity = 1.0, range = 1.0): DetailedViseme {
    let target: DetailedViseme = { ...REST_VISEME };

    if (this.isPlaying && this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray as any);

      const totalBins = this.dataArray.length;
      // Frequency bands (sample rate usually 44.1k or 48k, each bin ~ 86Hz):
      // Low (100 - 500 Hz): bins 1 - 6
      // Mid (500 - 2000 Hz): bins 6 - 24
      // High (2000 - 6000 Hz): bins 24 - 70

      let lowSum = 0;
      let midSum = 0;
      let highSum = 0;
      let overallSum = 0;

      for (let i = 1; i < 6 && i < totalBins; i++) lowSum += this.dataArray[i];
      for (let i = 6; i < 24 && i < totalBins; i++) midSum += this.dataArray[i];
      for (let i = 24; i < 70 && i < totalBins; i++) highSum += this.dataArray[i];
      for (let i = 0; i < totalBins; i++) overallSum += this.dataArray[i];

      const avgLow = (lowSum / 5) / 255;
      const avgMid = (midSum / 18) / 255;
      const avgHigh = (highSum / 46) / 255;
      const overallRms = (overallSum / totalBins) / 255;

      const threshold = 0.035;

      if (overallRms > threshold) {
        const energy = Math.min(1.0, (overallRms - threshold) * 3.5 * sensitivity);

        // Dominant frequency characteristics scaled for calm broadcast news cadence
        if (avgLow > avgMid * 1.3 && avgLow > avgHigh) {
          // Low vowel resonance: Open 'A' or Round 'O'
          if (avgLow > 0.4 && avgHigh < 0.25) {
            target = {
              viseme: 'round_o',
              openness: Math.min(0.38, (avgLow * 0.45) * range),
              width: 0.4,
              roundness: 0.7,
              jawDrop: Math.min(0.3, avgLow * 0.35 * range),
              teethVisible: 0.1,
              tongueVisible: 0.1,
              eyebrowLift: avgLow > 0.6 ? 0.2 : 0.05,
            };
          } else {
            target = {
              viseme: 'open_a',
              openness: Math.min(0.42, (avgLow * 0.5) * range),
              width: 0.5,
              roundness: 0.2,
              jawDrop: Math.min(0.35, avgLow * 0.4 * range),
              teethVisible: 0.3,
              tongueVisible: 0.15,
              eyebrowLift: avgLow > 0.5 ? 0.25 : 0.08,
            };
          }
        } else if (avgMid > avgLow && avgMid > avgHigh) {
          // Mid formant: 'E', 'I', or tongue dentals
          target = {
            viseme: 'wide_e',
            openness: Math.min(0.32, avgMid * 0.4 * range),
            width: Math.min(0.8, 0.5 + avgMid * 0.3),
            roundness: 0.1,
            jawDrop: Math.min(0.25, avgMid * 0.3 * range),
            teethVisible: 0.4,
            tongueVisible: 0.1,
            eyebrowLift: avgMid > 0.55 ? 0.2 : 0.05,
          };
        } else if (avgHigh > 0.2) {
          // Sibilants, dental fricatives: 'S', 'F', 'T'
          target = {
            viseme: 'teeth_f',
            openness: Math.min(0.18, 0.15 * range),
            width: 0.6,
            roundness: 0.1,
            jawDrop: 0.12 * range,
            teethVisible: 0.5,
            tongueVisible: 0.05,
            eyebrowLift: 0.1,
          };
        } else {
          // General speech syllable
          target = {
            viseme: 'open_a',
            openness: Math.min(0.35, energy * 0.35 * range),
            width: 0.5,
            roundness: 0.2,
            jawDrop: Math.min(0.25, energy * 0.3 * range),
            teethVisible: 0.2,
            tongueVisible: 0.08,
            eyebrowLift: energy * 0.1,
          };
        }
      } else {
        // Below noise floor: mouth returns to resting position
        target = { ...REST_VISEME };
      }
    } else if (this.syntheticSpeaking) {
      // Procedural fallback
      const elapsed = (performance.now() - this.synthStartTime) / 1000;
      const current = this.synthSyllables.find(
        (s) => elapsed >= s.time && elapsed <= s.time + s.duration
      );

      if (current && current.viseme !== 'rest') {
        const v = current.viseme;
        if (v === 'open_a') {
          target = {
            viseme: 'open_a',
            openness: 0.35 * range,
            width: 0.5,
            roundness: 0.2,
            jawDrop: 0.25 * range,
            teethVisible: 0.3,
            tongueVisible: 0.15,
            eyebrowLift: 0.15,
          };
        } else if (v === 'round_o') {
          target = {
            viseme: 'round_o',
            openness: 0.28 * range,
            width: 0.4,
            roundness: 0.6,
            jawDrop: 0.22 * range,
            teethVisible: 0.1,
            tongueVisible: 0.05,
            eyebrowLift: 0.1,
          };
        } else if (v === 'wide_e') {
          target = {
            viseme: 'wide_e',
            openness: 0.24 * range,
            width: 0.65,
            roundness: 0.1,
            jawDrop: 0.18 * range,
            teethVisible: 0.4,
            tongueVisible: 0.1,
            eyebrowLift: 0.08,
          };
        } else if (v === 'teeth_f') {
          target = {
            viseme: 'teeth_f',
            openness: 0.14 * range,
            width: 0.55,
            roundness: 0.1,
            jawDrop: 0.1 * range,
            teethVisible: 0.5,
            tongueVisible: 0.05,
            eyebrowLift: 0.05,
          };
        } else if (v === 'pressed_m') {
          target = {
            viseme: 'pressed_m',
            openness: 0.02,
            width: 0.5,
            roundness: 0.2,
            jawDrop: 0.02,
            teethVisible: 0,
            tongueVisible: 0,
            eyebrowLift: 0.05,
          };
        } else {
          target = {
            viseme: 'tongue_l',
            openness: 0.20 * range,
            width: 0.5,
            roundness: 0.1,
            jawDrop: 0.15 * range,
            teethVisible: 0.3,
            tongueVisible: 0.2,
            eyebrowLift: 0.05,
          };
        }
      } else {
        target = { ...REST_VISEME };
      }
    }

    // Smooth linear interpolation (lerp) towards target for fluid realistic mouth motion
    const lerpFactor = 0.28;
    this.smoothedViseme = {
      viseme: target.viseme,
      openness: this.lerp(this.smoothedViseme.openness, target.openness, lerpFactor),
      width: this.lerp(this.smoothedViseme.width, target.width, lerpFactor),
      roundness: this.lerp(this.smoothedViseme.roundness, target.roundness, lerpFactor),
      jawDrop: this.lerp(this.smoothedViseme.jawDrop, target.jawDrop, lerpFactor),
      teethVisible: this.lerp(this.smoothedViseme.teethVisible, target.teethVisible, lerpFactor),
      tongueVisible: this.lerp(this.smoothedViseme.tongueVisible, target.tongueVisible, lerpFactor),
      eyebrowLift: this.lerp(this.smoothedViseme.eyebrowLift, target.eyebrowLift, lerpFactor),
    };

    return this.smoothedViseme;
  }

  private lerp(start: number, end: number, amt: number): number {
    return (1 - amt) * start + amt * end;
  }
}

export const lipSyncEngine = new AudioLipSyncEngine();
