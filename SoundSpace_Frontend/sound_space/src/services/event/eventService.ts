import { apiFetch } from '@/lib/apiClient';
import { CreateEventPayload, EventData, ToggleAttendanceResponse } from '@/types/event';

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_API_URL ?? ''}/api/Events`;

export const fetchEventById = async (eventId: string): Promise<EventData> => {
    const res = await apiFetch(`${BASE}/${eventId}`);
    if (res.status === 404) throw new Error('not_found');
    if (!res.ok) throw new Error(`Failed to fetch event (${res.status})`);
    return res.json() as Promise<EventData>;
};

export const fetchPopularEvents = async (): Promise<EventData[]> => {
    const res = await apiFetch(`${BASE}/popular`);
    if (!res.ok) throw new Error(`Failed to fetch popular events (${res.status})`);
    return res.json() as Promise<EventData[]>;
};

export const fetchRecommendedEvents = async (): Promise<EventData[]> => {
    const res = await apiFetch(`${BASE}/recommended`);
    if (!res.ok) throw new Error(`Failed to fetch recommended events (${res.status})`);
    return res.json() as Promise<EventData[]>;
};

export const fetchFriendsEvents = async (): Promise<EventData[]> => {
    const res = await apiFetch(`${BASE}/friends`);
    if (!res.ok) throw new Error(`Failed to fetch friends' events (${res.status})`);
    return res.json() as Promise<EventData[]>;
};

export const fetchMyEvents = async (): Promise<EventData[]> => {
    const res = await apiFetch(`${BASE}/my-events`);
    if (!res.ok) throw new Error(`Failed to fetch my events (${res.status})`);
    return res.json() as Promise<EventData[]>;
};

export const createEvent = async (payload: CreateEventPayload): Promise<EventData> => {
    const res = await apiFetch(BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create event (${res.status})`);
    return res.json() as Promise<EventData>;
};

export const toggleAttendance = async (eventId: string): Promise<ToggleAttendanceResponse> => {
    const res = await apiFetch(`${BASE}/${eventId}/attend`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to toggle attendance (${res.status})`);
    return res.json() as Promise<ToggleAttendanceResponse>;
};

export interface EventConversationResult {
    conversationId: string;
    participantCount: number;
}

export const getEventConversation = async (eventId: string): Promise<EventConversationResult> => {
    const res = await apiFetch(`${BASE}/${eventId}/conversation`);
    if (!res.ok) throw new Error(`Failed to get event conversation (${res.status})`);
    return res.json() as Promise<EventConversationResult>;
};
