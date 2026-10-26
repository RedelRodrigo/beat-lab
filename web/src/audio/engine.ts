import type { TrackId } from "@beat-lab/shared";
import { VOICES } from "./voices";

export class AudioEngine {
  private context: AudioContext | null = null;
  private bus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  analyser: AnalyserNode | null = null;

  get isReady(): boolean {
    return this.context?.state === "running";
  }

  get now(): number {
    return this.context?.currentTime ?? 0;
  }

  get outputLatency(): number {
    return this.context?.outputLatency ?? 0;
  }

  async init(): Promise<void> {
    if (!this.context) {
      const context = new AudioContext({ latencyHint: "interactive" });
      const bus = context.createGain();
      const compressor = context.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;
      const master = context.createGain();
      master.gain.value = 0.8;
      const analyser = context.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.75;

      bus.connect(compressor);
      compressor.connect(master);
      master.connect(context.destination);
      master.connect(analyser);

      const noise = context.createBuffer(
        1,
        context.sampleRate,
        context.sampleRate,
      );
      const data = noise.getChannelData(0);
      for (let index = 0; index < data.length; index += 1)
        data[index] = Math.random() * 2 - 1;

      this.context = context;
      this.bus = bus;
      this.noise = noise;
      this.analyser = analyser;
    }
    if (this.context.state !== "running") await this.context.resume();
  }

  play(track: TrackId, time: number, volume: number): void {
    if (!this.context || !this.bus || !this.noise || volume < 0.01) return;
    VOICES[track](this.context, this.bus, this.noise, time, volume);
  }

  preview(track: TrackId, volume = 0.8): void {
    if (this.isReady) this.play(track, this.now, volume);
  }
}
