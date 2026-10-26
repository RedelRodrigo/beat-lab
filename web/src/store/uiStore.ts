import { create } from "zustand";

interface UiState {
  toast: string | null;
  showToast: (message: string) => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  showToast: (message) => {
    clearTimeout(timer);
    set({ toast: message });
    timer = setTimeout(() => set({ toast: null }), 3000);
  },
}));
