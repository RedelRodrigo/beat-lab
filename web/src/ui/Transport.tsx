import { BPM_MAX, BPM_MIN, MAX_TRACKS, PRESETS } from "@beat-lab/shared";
import { useSavePattern } from "../hooks/useSavePattern";
import { togglePlayback } from "../audio/playback";
import { navigateToPattern } from "../store/routeStore";
import { usePatternStore } from "../store/patternStore";
import { useTransportStore } from "../store/transportStore";

export function Transport() {
  const isPlaying = useTransportStore((state) => state.isPlaying);
  const bpm = usePatternStore((state) => state.bpm);
  const swing = usePatternStore((state) => state.swing);
  const name = usePatternStore((state) => state.name);
  const loadedId = usePatternStore((state) => state.loadedId);
  const trackCount = usePatternStore((state) => state.tracks.length);
  const { setBpm, setSwing, setName, clear, addTrack, loadPreset } =
    usePatternStore.getState();
  const save = useSavePattern();

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Stop" : "Play"}
          className={`flex h-12 w-28 items-center justify-center gap-2 rounded-xl font-semibold transition-colors ${isPlaying ? "bg-rose-500 text-white" : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"}`}
        >
          <span aria-hidden="true">{isPlaying ? "■" : "▶"}</span>
          {isPlaying ? "Stop" : "Play"}
        </button>
        <div className="min-w-40 flex-1">
          <label
            htmlFor="bpm"
            className="mb-1 flex justify-between text-xs uppercase tracking-widest text-slate-400"
          >
            <span>Tempo</span>
            <span className="font-mono text-slate-200">{bpm} BPM</span>
          </label>
          <input
            id="bpm"
            type="range"
            min={BPM_MIN}
            max={BPM_MAX}
            value={bpm}
            onChange={(event) => setBpm(Number(event.target.value))}
            className="w-full accent-emerald-400"
          />
        </div>
        <div className="min-w-32 flex-1">
          <label
            htmlFor="swing"
            className="mb-1 flex justify-between text-xs uppercase tracking-widest text-slate-400"
          >
            <span>Swing</span>
            <span className="font-mono text-slate-200">
              {Math.round((swing / 0.6) * 100)}%
            </span>
          </label>
          <input
            id="swing"
            type="range"
            min={0}
            max={0.6}
            step={0.01}
            value={swing}
            onChange={(event) => setSwing(Number(event.target.value))}
            className="w-full accent-emerald-400"
          />
        </div>
        <div>
          <label
            htmlFor="preset"
            className="mb-1 block text-xs uppercase tracking-widest text-slate-400"
          >
            Preset
          </label>
          <select
            id="preset"
            value=""
            onChange={(event) => {
              const preset = PRESETS.find(
                (item) => item.key === event.target.value,
              );
              if (preset) {
                loadPreset(preset.pattern);
                navigateToPattern(null);
              }
            }}
            className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100"
          >
            <option value="" disabled>
              Load...
            </option>
            {PRESETS.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <button
          type="button"
          onClick={clear}
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={addTrack}
          disabled={trackCount >= MAX_TRACKS}
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700 disabled:opacity-40"
        >
          + Track
        </button>
        <div className="ml-auto flex min-w-0 flex-1 items-end justify-end gap-2">
          <div className="min-w-0">
            <label
              htmlFor="name"
              className="mb-1 block text-xs uppercase tracking-widest text-slate-400"
            >
              Name
            </label>
            <input
              id="name"
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              className="w-full max-w-48 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
          >
            {save.isPending
              ? "Saving..."
              : loadedId
                ? "Save remix"
                : "Save & share"}
          </button>
        </div>
      </div>
    </section>
  );
}
