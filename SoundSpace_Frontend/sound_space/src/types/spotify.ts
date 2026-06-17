export type SpotifyMediaType = 'track' | 'album' | 'show';

export interface SpotifyMediaItem {
    uri: string;
    name: string;
    type: SpotifyMediaType;
    coverUrl: string;
    subtitle: string;
    externalUrl: string;
    subtitleUrl: string;
    previewUrl?: string | null;
}

export interface SpotifyMediaPayload extends SpotifyMediaItem {
    previewStartSecond?: number;
    previewDuration?: number;
}
