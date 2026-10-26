import { describe, expect, test } from "bun:test";
import { Scheduler, secondsPerStep, swingOffset } from "./scheduler";

describe("scheduler timing", () => {
  test("uses sixteenth-note duration at 120 BPM", () =>
    expect(secondsPerStep(120)).toBeCloseTo(0.125));
  test("applies swing only to odd steps", () => {
    expect(swingOffset(0, 0.5, 120)).toBe(0);
    expect(swingOffset(1, 0.5, 120)).toBeCloseTo(0.0625);
  });

  test("schedules steps in order", () => {
    let now = 0;
    const calls: Array<{ step: number; time: number }> = [];
    const scheduler = new Scheduler({
      now: () => now,
      getBpm: () => 120,
      getSwing: () => 0,
      steps: 16,
      onStep: (step, time) => calls.push({ step, time }),
    });
    scheduler.start();
    scheduler.stop();
    expect(calls).toEqual([{ step: 0, time: 0.05 }]);
    now = 0.1;
    scheduler.tick();
    expect(calls[1].step).toBe(1);
    expect(calls[1].time - calls[0].time).toBeCloseTo(0.125);
  });
});
