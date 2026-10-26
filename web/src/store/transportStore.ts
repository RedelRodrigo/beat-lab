import { create } from "zustand";

interface TransportState {
  isPlaying: boolean;
  currentStep: number;
  setPlaying: (isPlaying: boolean) => void;
  setCurrentStep: (step: number) => void;
}

export const useTransportStore = create<TransportState>((set) => ({
  isPlaying: false,
  currentStep: -1,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentStep: (currentStep) => set({ currentStep }),
}));
