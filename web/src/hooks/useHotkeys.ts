import { useEffect } from "react";
import { togglePlayback } from "../audio/playback";
import { usePatternStore } from "../store/patternStore";

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export function useHotkeys() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        isTyping(event.target) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return;
      if (
        event.code === "KeyP" ||
        (event.code === "Space" && document.activeElement === document.body)
      ) {
        event.preventDefault();
        togglePlayback();
      }
      if (event.code === "ArrowUp" || event.code === "ArrowDown") {
        event.preventDefault();
        const { bpm, setBpm } = usePatternStore.getState();
        setBpm(
          bpm + (event.code === "ArrowUp" ? 1 : -1) * (event.shiftKey ? 5 : 1),
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
