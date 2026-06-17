import { apiFetch } from '@/lib/apiClient';

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://localhost:7050'}/api/notifications`;

export interface GeneralNotification {
    id: string;
    type: string;
    text: string;
    referenceId: string | null;
    createdAt: string;
}

export async function fetchUnreadNotifications(): Promise<GeneralNotification[]> {
    const res = await apiFetch(BASE);
    if (!res.ok) return [];
    return res.json();
}

export async function markNotificationRead(id: string): Promise<void> {
    await apiFetch(`${BASE}/${id}/read`, { method: 'POST' });
}
