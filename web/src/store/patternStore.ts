import { create } from "zustand";
import {
  BPM_MAX,
  BPM_MIN,
  DEFAULT_PRESET,
  MAX_TRACKS,
  STEPS,
  TRACK_IDS,
  makeTrack,
  type Pattern,
  type PatternInput,
  type Track,
} from "@beat-lab/shared";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const cloneTracks = (tracks: Track[]): Track[] =>
  tracks.map((track) => ({ ...track, steps: [...track.steps] }));

interface PatternState {
  name: string;
  bpm: number;
  swing: number;
  tracks: Track[];
  loadedId: string | null;
  setName: (name: string) => void;
  setBpm: (bpm: number) => void;
  setSwing: (swing: number) => void;
  setStep: (track: number, step: number, value: boolean) => void;
  setVolume: (track: number, volume: number) => void;
  toggleMute: (track: number) => void;
  addTrack: () => void;
  removeTrack: (track: number) => void;
  clear: () => void;
  loadPattern: (pattern: Pattern) => void;
  loadPreset: (pattern: Omit<PatternInput, "parentId">) => void;
  setLoadedId: (id: string | null) => void;
}

export const usePatternStore = create<PatternState>((set) => ({
  name: DEFAULT_PRESET.pattern.name,
  bpm: DEFAULT_PRESET.pattern.bpm,
  swing: DEFAULT_PRESET.pattern.swing,
  tracks: cloneTracks(DEFAULT_PRESET.pattern.tracks),
  loadedId: null,
  setName: (name) => set({ name }),
  setBpm: (bpm) => set({ bpm: clamp(Math.round(bpm), BPM_MIN, BPM_MAX) }),
  setSwing: (swing) => set({ swing: clamp(swing, 0, 0.6) }),
  setStep: (track, step, value) =>
    set((state) => {
      const current = state.tracks[track];
      if (!current || current.steps[step] === value) return state;
      const steps = [...current.steps];
      steps[step] = value;
      return {
        tracks: state.tracks.map((item, index) =>
          index === track ? { ...item, steps } : item,
        ),
      };
    }),
  setVolume: (track, volume) =>
    set((state) => ({
      tracks: state.tracks.map((item, index) =>
        index === track ? { ...item, volume: clamp(volume, 0, 1) } : item,
      ),
    })),
  toggleMute: (track) =>
    set((state) => ({
      tracks: state.tracks.map((item, index) =>
        index === track ? { ...item, muted: !item.muted } : item,
      ),
    })),
  addTrack: () =>
    set((state) => {
      if (state.tracks.length >= MAX_TRACKS) return state;
      const used = new Set(state.tracks.map((track) => track.id));
      const next = TRACK_IDS.find((id) => !used.has(id));
      return next ? { tracks: [...state.tracks, makeTrack(next)] } : state;
    }),
  removeTrack: (track) =>
    set((state) =>
      state.tracks.length <= 1
        ? state
        : { tracks: state.tracks.filter((_, index) => index !== track) },
    ),
  clear: () =>
    set((state) => ({
      tracks: state.tracks.map((track) => ({
        ...track,
        steps: Array(STEPS).fill(false),
      })),
    })),
  loadPattern: (pattern) =>
    set({
      name: pattern.name,
      bpm: pattern.bpm,
      swing: pattern.swing,
      tracks: cloneTracks(pattern.tracks),
      loadedId: pattern.id,
    }),
  loadPreset: (pattern) =>
    set({
      name: pattern.name,
      bpm: pattern.bpm,
      swing: pattern.swing,
      tracks: cloneTracks(pattern.tracks),
      loadedId: null,
    }),
  setLoadedId: (loadedId) => set({ loadedId }),
}));
