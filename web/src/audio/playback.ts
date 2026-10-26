import { STEPS } from "@beat-lab/shared";
import { usePatternStore } from "../store/patternStore";
import { useTransportStore } from "../store/transportStore";
import { useUiStore } from "../store/uiStore";
import { AudioEngine } from "./engine";
import { Scheduler } from "./scheduler";

export const engine = new AudioEngine();

const scheduler = new Scheduler({
  now: () => engine.now,
  getBpm: () => usePatternStore.getState().bpm,
  getSwing: () => usePatternStore.getState().swing,
  steps: STEPS,
  onStep: (step, time) => {
    const { tracks } = usePatternStore.getState();
    for (const track of tracks) {
      if (!track.muted && track.steps[step])
        engine.play(track.id, time, track.volume);
    }
    queue.push({ step, time });
  },
});

interface QueuedStep {
  step: number;
  time: number;
}

let queue: QueuedStep[] = [];
let rafId = 0;

function visualLoop() {
  const audibleTime = engine.now - engine.outputLatency;
  while (queue.length > 0 && queue[0].time <= audibleTime) {
    useTransportStore.getState().setCurrentStep(queue.shift()!.step);
  }
  rafId = requestAnimationFrame(visualLoop);
}

export async function startPlayback(): Promise<void> {
  if (scheduler.running) return;
  try {
    await engine.init();
  } catch {
    useUiStore
      .getState()
      .showToast("Your browser blocked audio. Try clicking again.");
    return;
  }
  queue = [];
  scheduler.start();
  useTransportStore.getState().setPlaying(true);
  rafId = requestAnimationFrame(visualLoop);
}

export function stopPlayback(): void {
  scheduler.stop();
  cancelAnimationFrame(rafId);
  queue = [];
  useTransportStore.setState({ isPlaying: false, currentStep: -1 });
}

export function togglePlayback(): void {
  if (useTransportStore.getState().isPlaying) stopPlayback();
  else void startPlayback();
}
