export interface EventData {
    id: string;
    title: string;
    imageUrl: string | null;
    coverImageUrl: string | null;
    artistName: string | null;
    artistSpotifyId: string | null;
    artistImageUrl: string | null;
    location: string;
    city: string;
    country: string;
    eventDate: string;
    eventTime: string;
    genre: string | null;
    description: string | null;
    ticketsUrl: string | null;
    artistProfileUrl: string | null;
    latitude: number | null;
    longitude: number | null;
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
    coverImageUrl?: string;
    artistName?: string;
    artistSpotifyId?: string;
    artistImageUrl?: string;
    location: string;
    city: string;
    country: string;
    eventDate: string;
    eventTime: string;
    genre?: string;
    description?: string;
    ticketsUrl?: string;
    artistProfileUrl?: string;
    latitude?: number;
    longitude?: number;
}

export interface UpdateEventPayload {
    title: string;
    imageUrl?: string;
    coverImageUrl?: string;
    artistName?: string;
    artistSpotifyId?: string;
    artistImageUrl?: string;
    location: string;
    city: string;
    country: string;
    eventDate: string;
    eventTime: string;
    genre?: string;
    description?: string;
    ticketsUrl?: string;
    artistProfileUrl?: string;
    latitude?: number;
    longitude?: number;
}

export interface ToggleAttendanceResponse {
    isAttending: boolean;
}

export interface EventAttendee {
    userId: string;
    displayName: string;
    profileImageUrl: string | null;
}

export interface EventPhoto {
    id: string;
    eventId: string;
    uploaderId: string;
    uploaderDisplayName: string;
    filePath: string;
    uploadedAt: string;
}
