import { create } from 'zustand';

interface UiState {
  isListsModalOpen: boolean;
  isImportModalOpen: boolean;
  toggleListsModal: () => void;
  toggleImportModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isListsModalOpen: false,
  isImportModalOpen: false,
  toggleListsModal: () => set((state) => ({ isListsModalOpen: !state.isListsModalOpen })),
  toggleImportModal: () => set((state) => ({ isImportModalOpen: !state.isImportModalOpen })),
}));
