import { describe, expect, test } from "bun:test";
import {
  PRESETS,
  makeTrack,
  patternInputSchema,
  stepsFromString,
} from "./index";

describe("shared pattern contract", () => {
  test("converts a text pattern into sixteen steps", () => {
    const steps = stepsFromString("x...x...x...x...");
    expect(steps).toHaveLength(16);
    expect(steps[0]).toBe(true);
    expect(steps[1]).toBe(false);
  });

  test("validates every preset", () => {
    for (const preset of PRESETS)
      expect(patternInputSchema.safeParse(preset.pattern).success).toBe(true);
  });

  test("rejects duplicate tracks and invalid BPM", () => {
    const duplicate = {
      ...PRESETS[0].pattern,
      tracks: [makeTrack("kick"), makeTrack("kick")],
    };
    expect(patternInputSchema.safeParse(duplicate).success).toBe(false);
    expect(
      patternInputSchema.safeParse({ ...PRESETS[0].pattern, bpm: 999 }).success,
    ).toBe(false);
  });
});
