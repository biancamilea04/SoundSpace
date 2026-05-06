import { create } from 'zustand';
import type { Friendship } from '@/types/friendship';

interface NotificationState {
    pendingRequests: Friendship[];
    setPendingRequests: (requests: Friendship[]) => void;
    addRequest: (request: Friendship) => void;
    removeRequest: (id: string) => void;
    updateRequest: (updated: Friendship) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    pendingRequests: [],

    setPendingRequests: (requests) => set({ pendingRequests: requests }),

    addRequest: (request) =>
        set((s) => ({
            pendingRequests: s.pendingRequests.some((r) => r.id === request.id)
                ? s.pendingRequests
                : [request, ...s.pendingRequests],
        })),

    removeRequest: (id) =>
        set((s) => ({ pendingRequests: s.pendingRequests.filter((r) => r.id !== id) })),

    updateRequest: (updated) =>
        set((s) => ({
            pendingRequests: s.pendingRequests.map((r) => (r.id === updated.id ? updated : r)),
        })),
}));
