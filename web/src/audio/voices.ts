import type { TrackId } from "@beat-lab/shared";

export type Voice = (
  ctx: AudioContext,
  out: AudioNode,
  noise: AudioBuffer,
  time: number,
  volume: number,
) => void;

function envelope(gain: GainNode, time: number, peak: number, decay: number) {
  gain.gain.setValueAtTime(peak, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
}

function noiseHit(
  ctx: AudioContext,
  noise: AudioBuffer,
  time: number,
  duration: number,
) {
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.start(time, Math.random() * 0.5, duration);
  return source;
}

function tone(
  ctx: AudioContext,
  type: OscillatorType,
  time: number,
  duration: number,
  startFrequency: number,
  endFrequency = startFrequency,
  sweep = 0.1,
) {
  const oscillator = ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, time);
  if (endFrequency !== startFrequency)
    oscillator.frequency.exponentialRampToValueAtTime(
      endFrequency,
      time + sweep,
    );
  oscillator.start(time);
  oscillator.stop(time + duration);
  return oscillator;
}

const kick: Voice = (ctx, out, _noise, time, volume) => {
  const gain = ctx.createGain();
  envelope(gain, time, volume, 0.45);
  tone(ctx, "sine", time, 0.5, 150, 45, 0.12).connect(gain).connect(out);
};

const snare: Voice = (ctx, out, noise, time, volume) => {
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1800;
  const noiseGain = ctx.createGain();
  envelope(noiseGain, time, volume * 0.8, 0.2);
  noiseHit(ctx, noise, time, 0.25)
    .connect(filter)
    .connect(noiseGain)
    .connect(out);

  const toneGain = ctx.createGain();
  envelope(toneGain, time, volume * 0.6, 0.12);
  tone(ctx, "triangle", time, 0.15, 220, 120, 0.1)
    .connect(toneGain)
    .connect(out);
};

function makeHat(decay: number): Voice {
  return (ctx, out, noise, time, volume) => {
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    const gain = ctx.createGain();
    envelope(gain, time, volume * 0.5, decay);
    noiseHit(ctx, noise, time, decay + 0.05)
      .connect(filter)
      .connect(gain)
      .connect(out);
  };
}

const clap: Voice = (ctx, out, noise, time, volume) => {
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1500;
  filter.Q.value = 1;
  const gain = ctx.createGain();
  for (const offset of [0, 0.011, 0.022]) {
    gain.gain.setValueAtTime(volume, time + offset);
    gain.gain.exponentialRampToValueAtTime(volume * 0.2, time + offset + 0.009);
  }
  gain.gain.setValueAtTime(volume, time + 0.033);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
  noiseHit(ctx, noise, time, 0.25).connect(filter).connect(gain).connect(out);
};

const tom: Voice = (ctx, out, _noise, time, volume) => {
  const gain = ctx.createGain();
  envelope(gain, time, volume * 0.9, 0.35);
  tone(ctx, "sine", time, 0.4, 160, 90, 0.15).connect(gain).connect(out);
};

const rim: Voice = (ctx, out, _noise, time, volume) => {
  const gain = ctx.createGain();
  envelope(gain, time, volume * 0.35, 0.04);
  tone(ctx, "square", time, 0.06, 1700).connect(gain).connect(out);
};

const cowbell: Voice = (ctx, out, _noise, time, volume) => {
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 800;
  filter.Q.value = 1.5;
  const gain = ctx.createGain();
  envelope(gain, time, volume * 0.45, 0.35);
  tone(ctx, "square", time, 0.4, 540).connect(filter);
  tone(ctx, "square", time, 0.4, 800).connect(filter);
  filter.connect(gain).connect(out);
};

export const VOICES: Record<TrackId, Voice> = {
  kick,
  snare,
  hat: makeHat(0.05),
  openhat: makeHat(0.3),
  clap,
  tom,
  rim,
  cowbell,
};
