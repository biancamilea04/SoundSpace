import { create } from "zustand";

interface PresenceState {
    onlineUserIds: Set<string>;
    setOnlineUsers: (ids: string[]) => void;
    markOnline: (id: string) => void;
    markOffline: (id: string) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
    onlineUserIds: new Set(),

    setOnlineUsers: (ids) => set({ onlineUserIds: new Set(ids) }),

    markOnline: (id) =>
        set((s) => ({ onlineUserIds: new Set([...s.onlineUserIds, id]) })),

    markOffline: (id) =>
        set((s) => {
            const next = new Set(s.onlineUserIds);
            next.delete(id);
            return { onlineUserIds: next };
        }),
}));
