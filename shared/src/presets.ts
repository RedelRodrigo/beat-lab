import { STEPS, type PatternInput, type Track, type TrackId } from "./schema";

export function stepsFromString(pattern: string): boolean[] {
  const clean = pattern.replace(/\s/g, "");
  if (clean.length !== STEPS) {
    throw new Error(`Pattern must have ${STEPS} steps, got ${clean.length}`);
  }
  return Array.from(clean, (character) => character === "x");
}

export function makeTrack(
  id: TrackId,
  pattern = "................",
  volume = 0.8,
): Track {
  return { id, steps: stepsFromString(pattern), volume, muted: false };
}

export interface Preset {
  key: string;
  label: string;
  pattern: Omit<PatternInput, "parentId">;
}

export const PRESETS: Preset[] = [
  {
    key: "boom-bap",
    label: "Boom Bap",
    pattern: {
      name: "Boom Bap",
      bpm: 90,
      swing: 0.25,
      tracks: [
        makeTrack("kick", "x.....x...x....."),
        makeTrack("snare", "....x.......x..."),
        makeTrack("hat", "x.x.x.x.x.x.x.x.", 0.55),
        makeTrack("clap"),
      ],
    },
  },
  {
    key: "house",
    label: "Four on the Floor",
    pattern: {
      name: "Four on the Floor",
      bpm: 124,
      swing: 0,
      tracks: [
        makeTrack("kick", "x...x...x...x..."),
        makeTrack("clap", "....x.......x..."),
        makeTrack("hat", "x.x.x.x.x.x.x.x.", 0.45),
        makeTrack("openhat", "..x...x...x...x.", 0.5),
      ],
    },
  },
  {
    key: "trap",
    label: "Trap",
    pattern: {
      name: "Trap",
      bpm: 140,
      swing: 0,
      tracks: [
        makeTrack("kick", "x.......x..x...."),
        makeTrack("snare", "........x......."),
        makeTrack("hat", "xxxxxxxxxxxxxxxx", 0.4),
        makeTrack("clap", "........x.......", 0.6),
      ],
    },
  },
  {
    key: "breakbeat",
    label: "Breakbeat",
    pattern: {
      name: "Breakbeat",
      bpm: 130,
      swing: 0.1,
      tracks: [
        makeTrack("kick", "x.x.......x..x.."),
        makeTrack("snare", "....x..x.x..x..."),
        makeTrack("hat", "x.x.x.x.x.x.x.xx", 0.5),
        makeTrack("clap"),
      ],
    },
  },
];

export const DEFAULT_PRESET = PRESETS[0];
