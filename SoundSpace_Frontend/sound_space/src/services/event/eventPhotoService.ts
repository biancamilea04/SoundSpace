import { apiFetch, apiFetchFormData } from '@/lib/apiClient';
import { EventPhoto } from '@/types/event';

const BASE        = `${process.env.NEXT_PUBLIC_BACKEND_API_URL ?? ''}/api/events`;
const PHOTOS_BASE = `${process.env.NEXT_PUBLIC_BACKEND_API_URL ?? ''}/api/photos`;

export const uploadCoverPhoto = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const res = await apiFetchFormData(`${PHOTOS_BASE}/upload`, form);
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Upload failed (${res.status})`);
    }
    const data = await res.json() as { filePath: string };
    return data.filePath;
};

export const fetchEventPhotos = async (eventId: string): Promise<EventPhoto[]> => {
    const res = await apiFetch(`${BASE}/${eventId}/photos`);
    if (!res.ok) throw new Error(`Failed to load photos (${res.status})`);
    return res.json() as Promise<EventPhoto[]>;
};

export const uploadPhotoFile = async (eventId: string, file: File): Promise<EventPhoto> => {
    const form = new FormData();
    form.append('file', file);

    const res = await apiFetchFormData(`${BASE}/${eventId}/photos/file`, form);
    if (!res.ok) {
        const message = await res.text();
        throw new Error(message || `Upload failed (${res.status})`);
    }
    return res.json() as Promise<EventPhoto>;
};

export const uploadPhotoFromUrl = async (eventId: string, url: string): Promise<EventPhoto> => {
    const res = await apiFetch(`${BASE}/${eventId}/photos/url`, {
        method: 'POST',
        body: JSON.stringify({ url }),
    });
    if (!res.ok) {
        const message = await res.text();
        throw new Error(message || `Upload failed (${res.status})`);
    }
    return res.json() as Promise<EventPhoto>;
};
