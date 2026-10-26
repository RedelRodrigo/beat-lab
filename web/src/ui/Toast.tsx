import { useUiStore } from "../store/uiStore";

export function Toast() {
  const toast = useUiStore((state) => state.toast);
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center transition-opacity ${toast ? "opacity-100" : "opacity-0"}`}
    >
      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-950 shadow-lg">
        {toast}
      </span>
    </div>
  );
}
