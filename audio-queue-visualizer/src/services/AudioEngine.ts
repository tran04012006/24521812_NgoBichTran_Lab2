import type { AudioTrack } from "../types";

export class AudioEngine {
  private context: AudioContext | null = null;

  private source: AudioBufferSourceNode | null = null;

  private disposed = false;

  private closePromise: Promise<void> | null = null;

  // Used to prevent stale asynchronous playback.
  private playVersion = 0;

  /**
   * Create one shared AudioContext lazily.
   */
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
        `Unable to load ${track.title}: HTTP ${response.status}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    this.assertUsable(signal);

    const context = this.getContext();

    const buffer = await context.decodeAudioData(
      arrayBuffer
    );

    this.assertUsable(signal);

    return buffer;
  }

  /**
   * Play a decoded AudioBuffer.
   *
   * A new source is created for every playback.
   */
  public async play(
    buffer: AudioBuffer,
    onEnded?: () => void
  ): Promise<void> {
    if (this.disposed) {
      throw new Error("AudioEngine is disposed.");
    }

    // Invalidate any previous play request.
    this.stop();

    const version = this.playVersion;
    const context = this.getContext();

    // Browsers may suspend audio until user interaction.
    if (context.state === "suspended") {
      await context.resume();
    }

    // Stop or a newer Play may have occurred
    // while resume() was awaiting.
    if (
      this.disposed ||
      version !== this.playVersion
    ) {
      return;
    }

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
      source.connect(context.destination);

      this.source = source;

      source.start();
    } catch (error) {
      this.releaseSource(source);
      throw error;
    }
  }

  /**
   * Stop current playback.
   *
   * Safe to call when nothing is playing.
   */
  public stop(): void {
    this.playVersion++;

    const source = this.source;

    if (!source) {
      return;
    }

    // Release ownership before stop().
    // This prevents an old ended event from
    // changing the state of a newer playback.
    this.source = null;

    source.onended = null;

    try {
      source.stop();
    } catch (error) {
      // Ignore only the case where the source
      // was never successfully started.
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

  /**
   * Disconnect a naturally ended source.
   */
  private releaseSource(
    source: AudioBufferSourceNode
  ): void {
    if (this.source === source) {
      this.source = null;
    }

    source.onended = null;
    source.disconnect();
  }

  /**
   * Check whether the current load is usable.
   */
  private assertUsable(
    signal: AbortSignal
  ): void {
    signal.throwIfAborted();

    if (this.disposed) {
      throw new Error("AudioEngine is disposed.");
    }
  }

  /**
   * Stop playback and close AudioContext.
   *
   * The owning session must wait for its
   * loading queue to finish shutting down first.
   */
  public close(): Promise<void> {
    if (this.closePromise) {
      return this.closePromise;
    }

    this.disposed = true;

    this.stop();

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