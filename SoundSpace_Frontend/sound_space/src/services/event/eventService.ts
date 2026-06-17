import { apiFetch } from '@/lib/apiClient';
import { CreateEventPayload, EventAttendee, EventData, ToggleAttendanceResponse, UpdateEventPayload } from '@/types/event';

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_API_URL ?? ''}/api/Events`;
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? '';

function normalizeEvent(event: EventData): EventData {
    return {
        ...event,
        imageUrl: event.imageUrl?.startsWith('/') ? `${BACKEND}${event.imageUrl}` : (event.imageUrl ?? null),
        coverImageUrl: event.coverImageUrl?.startsWith('/') ? `${BACKEND}${event.coverImageUrl}` : (event.coverImageUrl ?? null),
    };
}

export const fetchEventById = async (eventId: string): Promise<EventData> => {
    const res = await apiFetch(`${BASE}/${eventId}`);
    if (res.status === 404) throw new Error('not_found');
    if (!res.ok) throw new Error(`Failed to fetch event (${res.status})`);
    return (res.json() as Promise<EventData>).then(normalizeEvent);
};

export const fetchPopularEvents = async (): Promise<EventData[]> => {
    const res = await apiFetch(`${BASE}/popular`);
    if (!res.ok) throw new Error(`Failed to fetch popular events (${res.status})`);
    return (res.json() as Promise<EventData[]>).then((arr) => arr.map(normalizeEvent));
};

export const fetchRecommendedEvents = async (): Promise<EventData[]> => {
    const res = await apiFetch(`${BASE}/recommended`);
    if (!res.ok) throw new Error(`Failed to fetch recommended events (${res.status})`);
    return (res.json() as Promise<EventData[]>).then((arr) => arr.map(normalizeEvent));
};

export const fetchFriendsEvents = async (): Promise<EventData[]> => {
    const res = await apiFetch(`${BASE}/friends`);
    if (!res.ok) throw new Error(`Failed to fetch friends' events (${res.status})`);
    return (res.json() as Promise<EventData[]>).then((arr) => arr.map(normalizeEvent));
};

export const fetchMyEvents = async (): Promise<EventData[]> => {
    const res = await apiFetch(`${BASE}/my-events`);
    if (!res.ok) throw new Error(`Failed to fetch my events (${res.status})`);
    return (res.json() as Promise<EventData[]>).then((arr) => arr.map(normalizeEvent));
};

export const createEvent = async (payload: CreateEventPayload): Promise<EventData> => {
    const res = await apiFetch(BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create event (${res.status})`);
    return (res.json() as Promise<EventData>).then(normalizeEvent);
};

export const fetchCreatedEvents = async (): Promise<EventData[]> => {
    const res = await apiFetch(`${BASE}/created`);
    if (!res.ok) throw new Error(`Failed to fetch created events (${res.status})`);
    return (res.json() as Promise<EventData[]>).then((arr) => arr.map(normalizeEvent));
};

export const updateEvent = async (eventId: string, payload: UpdateEventPayload): Promise<EventData> => {
    const res = await apiFetch(`${BASE}/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    if (res.status === 403) throw new Error('not_owner');
    if (res.status === 404) throw new Error('not_found');
    if (!res.ok) throw new Error(`Failed to update event (${res.status})`);
    return (res.json() as Promise<EventData>).then(normalizeEvent);
};

export const deleteEvent = async (eventId: string): Promise<void> => {
    const res = await apiFetch(`${BASE}/${eventId}`, { method: 'DELETE' });
    if (res.status === 403) throw new Error('not_owner');
    if (res.status === 404) throw new Error('not_found');
    if (!res.ok) throw new Error(`Failed to delete event (${res.status})`);
};

export const fetchEventAttendees = async (eventId: string, limit = 10): Promise<EventAttendee[]> => {
    const res = await apiFetch(`${BASE}/${eventId}/attendees?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json() as EventAttendee[];
    return data.map((a) => ({
        ...a,
        profileImageUrl: a.profileImageUrl?.startsWith('/')
            ? `${BACKEND}${a.profileImageUrl}`
            : (a.profileImageUrl ?? null),
    }));
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

export const fetchUserEvents = async (userId: string): Promise<EventData[]> => {
    const res = await apiFetch(`${BASE}/user/${userId}`);
    if (!res.ok) throw new Error(`Failed to fetch user events (${res.status})`);
    return (res.json() as Promise<EventData[]>).then((arr) => arr.map(normalizeEvent));
};
