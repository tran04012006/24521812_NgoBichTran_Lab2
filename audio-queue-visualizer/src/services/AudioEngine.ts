import type { AudioTrack } from "../types";

export const FFT_SIZE = 256;

export class AudioEngine {
  private context: AudioContext | null = null;

  private source: AudioBufferSourceNode | null = null;

  private analyser: AnalyserNode | null = null;

  private disposed = false;

  private closePromise: Promise<void> | null = null;

  private playVersion = 0;

  private getContext(): AudioContext {
    if (this.disposed) {
      throw new Error("AudioEngine is disposed.");
    }

    if (!this.context) {
      this.context = new AudioContext();
    }

    return this.context;
  }

  /**
   * Create one analyser for this AudioEngine.
   */
  private getAnalyser(
    context: AudioContext
  ): AnalyserNode {
    if (!this.analyser) {
      const analyser = context.createAnalyser();

      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.8;

      analyser.connect(context.destination);

      this.analyser = analyser;
    }

    return this.analyser;
  }

  /**
   * Download and decode an audio file.
   */
  public async load(
    track: AudioTrack,
    signal: AbortSignal
  ): Promise<AudioBuffer> {
    this.assertUsable(signal);

    const response = await fetch(track.url, {
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Unable to load ${track.title}: ` +
        `HTTP ${response.status}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    this.assertUsable(signal);

    const context = this.getContext();

    const buffer =
      await context.decodeAudioData(arrayBuffer);

    this.assertUsable(signal);

    return buffer;
  }

  /**
   * Play a decoded AudioBuffer.
   */
  public async play(
    buffer: AudioBuffer,
    onEnded?: () => void
  ): Promise<void> {
    if (this.disposed) {
      throw new Error("AudioEngine is disposed.");
    }

    this.stop();

    const version = this.playVersion;
    const context = this.getContext();

    if (context.state === "suspended") {
      await context.resume();
    }

    if (
      this.disposed ||
      version !== this.playVersion
    ) {
      return;
    }

    const analyser = this.getAnalyser(context);
    const source = context.createBufferSource();

    source.buffer = buffer;

    source.onended = () => {
      if (this.source !== source) {
        return;
      }

      this.releaseSource(source);
      onEnded?.();
    };

    try {
      // New audio graph:
      // source -> analyser -> destination
      source.connect(analyser);

      this.source = source;
      source.start();
    } catch (error) {
      this.releaseSource(source);
      throw error;
    }
  }

  /**
   * Read frequency data from the analyser.
   *
   * Returns false when there is no playback.
   */
  public readFrequencyData(
    data: Uint8Array
  ): boolean {
    if (
      this.disposed ||
      !this.source ||
      !this.analyser
    ) {
      return false;
    }

    this.analyser.getByteFrequencyData(data);

    return true;
  }

  public get frequencyBinCount(): number {
    return FFT_SIZE / 2;
  }

  /**
   * Stop playback, but keep the analyser
   * available for future playback.
   */
  public stop(): void {
    this.playVersion++;

    const source = this.source;

    if (!source) {
      return;
    }

    this.source = null;
    source.onended = null;

    try {
      source.stop();
    } catch (error) {
      if (
        !(error instanceof DOMException) ||
        error.name !== "InvalidStateError"
      ) {
        console.error(
          "Audio source stop failed:",
          error
        );
      }
    } finally {
      source.disconnect();
    }
  }

  private releaseSource(
    source: AudioBufferSourceNode
  ): void {
    if (this.source === source) {
      this.source = null;
    }

    source.onended = null;
    source.disconnect();
  }

  private assertUsable(
    signal: AbortSignal
  ): void {
    signal.throwIfAborted();

    if (this.disposed) {
      throw new Error("AudioEngine is disposed.");
    }
  }

  /**
   * Release playback and analyser resources.
   */
  public close(): Promise<void> {
    if (this.closePromise) {
      return this.closePromise;
    }

    this.disposed = true;
    this.stop();

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    const context = this.context;
    this.context = null;

    this.closePromise = (async () => {
      if (
        context &&
        context.state !== "closed"
      ) {
        await context.close();
      }
    })();

    return this.closePromise;
  }

  public get isDisposed(): boolean {
    return this.disposed;
  }

  public get isPlaying(): boolean {
    return this.source !== null;
  }
}