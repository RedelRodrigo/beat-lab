import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savePattern } from "../lib/api";
import { usePatternStore } from "../store/patternStore";
import { navigateToPattern } from "../store/routeStore";
import { useUiStore } from "../store/uiStore";

export function useSavePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      const { name, bpm, swing, tracks, loadedId } = usePatternStore.getState();
      return savePattern({
        name: name.trim() || "Untitled beat",
        bpm,
        swing,
        tracks,
        parentId: loadedId ?? undefined,
      });
    },
    onSuccess: async (saved) => {
      queryClient.setQueryData(["pattern", saved.id], saved);
      void queryClient.invalidateQueries({ queryKey: ["patterns"] });
      navigateToPattern(saved.id);
      const url = `${window.location.origin}/p/${saved.id}`;
      try {
        await navigator.clipboard.writeText(url);
        useUiStore.getState().showToast("Link copied to clipboard");
      } catch {
        useUiStore.getState().showToast(`Saved! ${url}`);
      }
    },
    onError: (error) =>
      useUiStore
        .getState()
        .showToast(
          error instanceof Error ? error.message : "Could not save the beat",
        ),
  });
}
