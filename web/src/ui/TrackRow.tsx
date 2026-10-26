import { memo } from "react";
import { STEPS } from "@beat-lab/shared";
import { TRACK_META } from "../lib/tracks";
import { usePatternStore } from "../store/patternStore";
import { Cell } from "./Cell";

export const TrackRow = memo(function TrackRow({ index }: { index: number }) {
  const track = usePatternStore((state) => state.tracks[index]);
  const canRemove = usePatternStore((state) => state.tracks.length > 1);
  const { toggleMute, setVolume, removeTrack } = usePatternStore.getState();
  const { label, color } = TRACK_META[track.id];

  return (
    <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[15rem_minmax(0,1fr)]">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="shrink-0 whitespace-nowrap text-sm">{label}</span>
        <button
          type="button"
          aria-pressed={track.muted}
          aria-label={`Mute ${label}`}
          onClick={() => toggleMute(index)}
          className={`h-6 w-6 shrink-0 rounded text-xs font-bold ${track.muted ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
        >
          M
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={track.volume}
          aria-label={`${label} volume`}
          onChange={(event) => setVolume(index, Number(event.target.value))}
          className="w-full min-w-0 accent-cyan-400"
        />
        {canRemove && (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={() => removeTrack(index)}
            className="hidden text-slate-500 hover:text-rose-400 md:block"
          >
            x
          </button>
        )}
      </div>
      <div
        className={`grid grid-cols-16 gap-1 ${track.muted ? "opacity-40" : ""}`}
      >
        {Array.from({ length: STEPS }, (_, step) => (
          <Cell
            key={step}
            track={index}
            step={step}
            color={color}
            label={label}
          />
        ))}
      </div>
    </div>
  );
});
