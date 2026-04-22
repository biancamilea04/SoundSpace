export type SpotifyMediaType = 'track' | 'album' | 'episode';

export interface SpotifyMediaItem {
    uri: string;
    name: string;
    type: SpotifyMediaType;
    coverUrl: string;
    subtitle: string;
    externalUrl: string;
    subtitleUrl: string;
}

export type SpotifyMediaPayload = SpotifyMediaItem;
