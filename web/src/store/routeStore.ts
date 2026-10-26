import { create } from "zustand";

const PATTERN_PATH = /^\/p\/([0-9A-Za-z]{8})$/;
const idFromPath = (path: string) => PATTERN_PATH.exec(path)?.[1] ?? null;

export const useRouteStore = create<{ patternId: string | null }>(() => ({
  patternId: idFromPath(window.location.pathname),
}));

window.addEventListener("popstate", () => {
  useRouteStore.setState({ patternId: idFromPath(window.location.pathname) });
});

export function navigateToPattern(id: string | null) {
  window.history.pushState(null, "", id ? `/p/${id}` : "/");
  useRouteStore.setState({ patternId: id });
}
