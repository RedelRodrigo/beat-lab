import { memo } from "react";
import { usePatternStore } from "../store/patternStore";
import { useTransportStore } from "../store/transportStore";

interface CellProps {
  track: number;
  step: number;
  color: string;
  label: string;
}

export const Cell = memo(function Cell({
  track,
  step,
  color,
  label,
}: CellProps) {
  const active = usePatternStore(
    (state) => state.tracks[track]?.steps[step] ?? false,
  );
  const playing = useTransportStore((state) => state.currentStep === step);
  const isBeat = step % 4 === 0;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`${label}, step ${step + 1}`}
      data-cell={`${track}:${step}`}
      onClick={(event) => {
        if (event.detail !== 0) return;
        const state = usePatternStore.getState();
        state.setStep(track, step, !state.tracks[track].steps[step]);
      }}
      className={[
        "aspect-square w-full rounded-md transition-[transform,box-shadow,background-color] duration-75",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        "motion-reduce:transition-none motion-reduce:scale-100",
        active
          ? ""
          : isBeat
            ? "bg-slate-700/80 hover:bg-slate-600"
            : "bg-slate-800 hover:bg-slate-700",
        playing ? "scale-110 ring-2 ring-white/80" : "",
      ].join(" ")}
      style={
        active
          ? { backgroundColor: color, boxShadow: `0 0 12px ${color}99` }
          : undefined
      }
    />
  );
});
