import { apiFetch } from '@/lib/apiClient';
import type { Friendship, FriendListItem } from '@/types/friendship';
import type { FriendActivity } from '@/types/friendActivity';

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://localhost:7050'}/api/friendships`;

export async function sendFriendRequest(targetUserId: string): Promise<Friendship> {
    const res = await apiFetch(BASE, {
        method: 'POST',
        body: JSON.stringify({ targetUserId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getFriendshipStatus(targetUserId: string): Promise<Friendship | null> {
    const res = await apiFetch(`${BASE}/status/${targetUserId}`);
    if (res.status === 204) return null;
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getIncomingRequests(): Promise<Friendship[]> {
    const res = await apiFetch(`${BASE}/requests/incoming`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getRequestHistory(): Promise<Friendship[]> {
    const res = await apiFetch(`${BASE}/requests/history`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function acceptRequest(id: string): Promise<Friendship> {
    const res = await apiFetch(`${BASE}/${id}/accept`, { method: 'PATCH' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function rejectRequest(id: string): Promise<Friendship> {
    const res = await apiFetch(`${BASE}/${id}/reject`, { method: 'PATCH' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getFriendsActivity(): Promise<FriendActivity[]> {
    const res = await apiFetch(`${BASE}/friends/activity`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getFriendsList(profileUserId: string): Promise<FriendListItem[]> {
    const res = await apiFetch(`${BASE}/friends/list/${profileUserId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function removeFriend(targetUserId: string): Promise<void> {
    const res = await apiFetch(`${BASE}/friends/${targetUserId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
}
