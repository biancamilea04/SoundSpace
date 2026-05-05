import { apiFetch } from '@/lib/apiClient';

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://localhost:7050'}/api/music`;

export type ListenAlongCode = 'ok' | 'no_device' | 'no_premium' | 'not_listening' | 'error';

export async function listenAlong(friendId: string): Promise<ListenAlongCode> {
    try {
        const res = await apiFetch(`${BASE}/listen-along`, {
            method: 'POST',
            body: JSON.stringify({ friendId }),
        });
        if (res.status === 200) return 'ok';
        if (res.status === 404) return 'no_device';
        if (res.status === 403) return 'no_premium';
        if (res.status === 400) return 'not_listening';
        return 'error';
    } catch {
        return 'error';
    }
}
