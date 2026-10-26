import type { TrackId } from "@beat-lab/shared";

export const TRACK_META: Record<TrackId, { label: string; color: string }> = {
  kick: { label: "Kick", color: "#ff4d6d" },
  snare: { label: "Snare", color: "#ffb703" },
  hat: { label: "Hi-hat", color: "#4cc9f0" },
  clap: { label: "Clap", color: "#b388ff" },
  openhat: { label: "Open hat", color: "#80ed99" },
  tom: { label: "Tom", color: "#ff9e00" },
  rim: { label: "Rim", color: "#f72585" },
  cowbell: { label: "Cowbell", color: "#90e0ef" },
};
