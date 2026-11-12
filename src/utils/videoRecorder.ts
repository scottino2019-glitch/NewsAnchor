import { lipSyncEngine } from './audioLipSync';

export interface RecorderState {
  isRecording: boolean;
  recordedSeconds: number;
  downloadUrl: string | null;
  mimeType: string;
}

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private intervalTimer: number | null = null;
  private seconds = 0;
  private onStateChange?: (state: RecorderState) => void;

  public async startRecording(
    canvasElement: HTMLCanvasElement,
    onStateChange: (state: RecorderState) => void
  ): Promise<boolean> {
    this.stopRecording();
    this.onStateChange = onStateChange;
    this.recordedChunks = [];
    this.seconds = 0;

    try {
      const ctx = lipSyncEngine.initAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const videoStream = canvasElement.captureStream(30); // 30 FPS
      const audioStream = lipSyncEngine.getAudioStream();

      const combinedTracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
      if (audioStream) {
        const audioTracks = audioStream.getAudioTracks();
        if (audioTracks.length > 0) {
          audioTracks[0].enabled = true;
          combinedTracks.push(audioTracks[0]);
        }
      }

      const combinedStream = new MediaStream(combinedTracks);

      // Determine best supported MIME type: VP8+Opus is universally playable and lightweight
      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps high definition broadcast quality
        audioBitsPerSecond: 128000,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        if (this.onStateChange) {
          this.onStateChange({
            isRecording: false,
            recordedSeconds: this.seconds,
            downloadUrl: url,
            mimeType,
          });
        }
        if (this.intervalTimer) {
          clearInterval(this.intervalTimer);
          this.intervalTimer = null;
        }
      };

      this.mediaRecorder.start(250); // Record in 250ms chunks

      this.intervalTimer = window.setInterval(() => {
        this.seconds += 1;
        if (this.onStateChange) {
          this.onStateChange({
            isRecording: true,
            recordedSeconds: this.seconds,
            downloadUrl: null,
            mimeType,
          });
        }
      }, 1000);

      this.onStateChange({
        isRecording: true,
        recordedSeconds: 0,
        downloadUrl: null,
        mimeType,
      });

      return true;
    } catch (err) {
      console.error('Error starting video recording:', err);
      return false;
    }
  }

  public stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }
}

export const videoRecorder = new VideoRecorder();
