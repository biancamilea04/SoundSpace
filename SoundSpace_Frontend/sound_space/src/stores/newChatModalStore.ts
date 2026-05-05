import { create } from "zustand";

interface NewChatModalState {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const useNewChatModal = create<NewChatModalState>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
}));
