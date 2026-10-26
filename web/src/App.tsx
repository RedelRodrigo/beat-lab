import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHotkeys } from "./hooks/useHotkeys";
import { getPattern } from "./lib/api";
import { usePatternStore } from "./store/patternStore";
import { navigateToPattern, useRouteStore } from "./store/routeStore";
import { Gallery } from "./ui/Gallery";
import { Grid } from "./ui/Grid";
import { Toast } from "./ui/Toast";
import { Transport } from "./ui/Transport";
import { Visualizer } from "./ui/Visualizer";

export default function App() {
  useHotkeys();
  const patternId = useRouteStore((state) => state.patternId);
  const { data, isPending, isError } = useQuery({
    queryKey: ["pattern", patternId],
    queryFn: ({ signal }) => getPattern(patternId!, signal),
    enabled: patternId !== null,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data) usePatternStore.getState().loadPattern(data);
  }, [data]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-5 px-4 py-6 md:px-8 md:py-10">
      <header className="flex items-center justify-between gap-5">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
            Web drum machine
          </p>
          <h1 className="text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
            Beat<span className="text-emerald-300">Lab</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Crea un ritmo, escúchalo inmediatamente y luego comparte el patrón
            exacto.
          </p>
        </div>
        <Visualizer />
      </header>
      <Transport />
      {patternId && isPending && (
        <p className="text-sm text-slate-400">Loading beat...</p>
      )}
      {patternId && isError && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          We could not find that beat.{" "}
          <button className="underline" onClick={() => navigateToPattern(null)}>
            Start a new one
          </button>
        </p>
      )}
      <Grid />
      <Gallery />
      <Toast />
    </main>
  );
}
