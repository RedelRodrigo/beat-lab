import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import { engine } from "../audio/playback";
import { usePatternStore } from "../store/patternStore";
import { TrackRow } from "./TrackRow";

export function Grid() {
  const trackCount = usePatternStore((state) => state.tracks.length);
  const paintValue = useRef<boolean | null>(null);
  const lastCell = useRef("");

  const paint = (target: Element | null, isFirst: boolean) => {
    const cell = target?.closest<HTMLElement>("[data-cell]");
    const key = cell?.dataset.cell;
    if (!key || key === lastCell.current || paintValue.current === null) return;
    lastCell.current = key;
    const [track, step] = key.split(":").map(Number);
    const state = usePatternStore.getState();
    state.setStep(track, step, paintValue.current);
    if (isFirst && paintValue.current)
      engine.preview(state.tracks[track].id, state.tracks[track].volume);
  };

  const onPointerDown = (event: PointerEvent) => {
    const cell = (event.target as Element).closest<HTMLElement>("[data-cell]");
    if (!cell || event.button !== 0) return;
    const [track, step] = cell.dataset.cell!.split(":").map(Number);
    paintValue.current = !usePatternStore.getState().tracks[track].steps[step];
    lastCell.current = "";
    paint(cell, true);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (paintValue.current !== null)
      paint(document.elementFromPoint(event.clientX, event.clientY), false);
  };

  useEffect(() => {
    const end = () => {
      paintValue.current = null;
      lastCell.current = "";
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  return (
    <section
      aria-label="Step sequencer"
      className="no-select touch-none space-y-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-2xl shadow-cyan-950/20 md:p-5"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      {Array.from({ length: trackCount }, (_, index) => (
        <TrackRow key={index} index={index} />
      ))}
    </section>
  );
}
