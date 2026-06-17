import { create } from 'zustand';
import type { Friendship } from '@/types/friendship';
import type { GeneralNotification } from '@/services/notifications/notificationsService';

export interface NotificationState {
    pendingRequests: Friendship[];
    setPendingRequests: (requests: Friendship[]) => void;
    addRequest: (request: Friendship) => void;
    removeRequest: (id: string) => void;
    updateRequest: (updated: Friendship) => void;

    generalNotifications: GeneralNotification[];
    setGeneralNotifications: (items: GeneralNotification[]) => void;
    addGeneralNotification: (item: GeneralNotification) => void;
    removeGeneralNotification: (id: string) => void;
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

    generalNotifications: [],

    setGeneralNotifications: (items) => set({ generalNotifications: items }),

    addGeneralNotification: (item) =>
        set((s) => ({
            generalNotifications: s.generalNotifications.some((n) => n.id === item.id)
                ? s.generalNotifications
                : [item, ...s.generalNotifications],
        })),

    removeGeneralNotification: (id) =>
        set((s) => ({ generalNotifications: s.generalNotifications.filter((n) => n.id !== id) })),
}));
