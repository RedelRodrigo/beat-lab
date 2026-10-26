import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Pattern } from "@beat-lab/shared";
import { listPatterns } from "../lib/api";
import { TRACK_META } from "../lib/tracks";
import { navigateToPattern } from "../store/routeStore";

function MiniGrid({ pattern }: { pattern: Pattern }) {
  return (
    <div className="space-y-0.5" aria-hidden="true">
      {pattern.tracks.map((track) => (
        <div key={track.id} className="grid grid-cols-16 gap-0.5">
          {track.steps.map((on, index) => (
            <span
              key={index}
              className="h-1.5 rounded-[1px] bg-slate-800"
              style={
                on ? { backgroundColor: TRACK_META[track.id].color } : undefined
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Gallery() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["patterns"],
    queryFn: ({ signal }) => listPatterns(12, signal),
  });
  return (
    <section aria-labelledby="gallery-title" className="space-y-3 pb-6">
      <div className="flex items-center justify-between">
        <h2
          id="gallery-title"
          className="text-xs uppercase tracking-[0.25em] text-slate-400"
        >
          Recent beats
        </h2>
        <span className="text-xs text-slate-600">public gallery</span>
      </div>
      {isPending && (
        <p className="text-sm text-slate-500">Loading gallery...</p>
      )}
      {isError && (
        <p className="text-sm text-slate-400">
          Could not reach the server.{" "}
          <button className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </p>
      )}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((pattern) => (
          <li key={pattern.id}>
            <button
              type="button"
              onClick={() => {
                queryClient.setQueryData(["pattern", pattern.id], pattern);
                navigateToPattern(pattern.id);
              }}
              className="w-full space-y-3 rounded-xl border border-white/5 bg-slate-950/60 p-3 text-left transition-colors hover:border-cyan-400/40 hover:bg-slate-900"
            >
              <MiniGrid pattern={pattern} />
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium">
                  {pattern.name}
                </span>
                <span className="shrink-0 font-mono text-xs text-slate-400">
                  {pattern.bpm} BPM
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
