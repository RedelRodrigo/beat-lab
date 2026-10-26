export const LOOKAHEAD_MS = 25;
export const SCHEDULE_AHEAD_S = 0.1;

export const secondsPerStep = (bpm: number): number => 60 / bpm / 4;
export const swingOffset = (
  step: number,
  swing: number,
  bpm: number,
): number => (step % 2 === 1 ? swing * secondsPerStep(bpm) : 0);

export interface SchedulerOptions {
  now: () => number;
  getBpm: () => number;
  getSwing: () => number;
  steps: number;
  onStep: (step: number, time: number) => void;
}

export class Scheduler {
  private readonly options: SchedulerOptions;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextGridTime = 0;
  private step = 0;

  constructor(options: SchedulerOptions) {
    this.options = options;
  }

  get running(): boolean {
    return this.timer !== null;
  }

  start(): void {
    if (this.timer) return;
    this.step = 0;
    this.nextGridTime = this.options.now() + 0.05;
    this.timer = setInterval(() => this.tick(), LOOKAHEAD_MS);
    this.tick();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  tick(): void {
    const horizon = this.options.now() + SCHEDULE_AHEAD_S;
    while (this.nextGridTime < horizon) {
      const bpm = this.options.getBpm();
      const time =
        this.nextGridTime +
        swingOffset(this.step, this.options.getSwing(), bpm);
      this.options.onStep(this.step, time);
      this.nextGridTime += secondsPerStep(bpm);
      this.step = (this.step + 1) % this.options.steps;
    }
  }
}
