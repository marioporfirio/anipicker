import { create } from 'zustand';

interface UiState {
  isImportModalOpen: boolean;
  toggleImportModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isImportModalOpen: false,
  toggleImportModal: () => set((state) => ({ isImportModalOpen: !state.isImportModalOpen })),
}));
