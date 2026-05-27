export interface EventData {
    id: string;
    title: string;
    imageUrl: string | null;
    artistName: string;
    artistSpotifyId: string | null;
    artistImageUrl: string | null;
    location: string;
    city: string;
    country: string;
    eventDate: string;
    eventTime: string;
    description: string | null;
    ticketsUrl: string | null;
    artistProfileUrl: string | null;
    createdByUserId: string;
    createdByDisplayName: string;
    createdAt: string;
    attendeeCount: number;
    isAttendedByCurrentUser: boolean;
    tags?: string[];
}

export interface CreateEventPayload {
    title: string;
    imageUrl?: string;
    artistName: string;
    artistSpotifyId?: string;
    artistImageUrl?: string;
    location: string;
    city: string;
    country: string;
    eventDate: string;
    eventTime: string;
    description?: string;
    ticketsUrl?: string;
    artistProfileUrl?: string;
}

export interface ToggleAttendanceResponse {
    isAttending: boolean;
}

export interface EventPhoto {
    id: string;
    eventId: string;
    uploaderId: string;
    uploaderDisplayName: string;
    /** Server-relative path, e.g. "/uploads/events/abc.jpg".
     *  Prepend NEXT_PUBLIC_BACKEND_API_URL to build the full <img> src. */
    filePath: string;
    uploadedAt: string;
}
