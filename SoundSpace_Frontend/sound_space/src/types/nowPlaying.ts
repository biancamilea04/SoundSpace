export interface NowPlayingArtist {
    name: string;
    uri: string | null;
    spotifyUrl: string | null;
}

export interface NowPlayingData {
    // Playback state
    isPlaying: boolean;
    progressMs: number;
    durationMs: number;
    repeatState: string;
    shuffleState: boolean;

    // Track
    songTitle: string;
    songUri: string;
    isExplicit: boolean;

    // Artists
    artistNames: string;
    artists: NowPlayingArtist[];

    // Album
    albumName: string;
    albumUri: string;
    albumImageUrl: string | null;
    releaseDate: string | null;

    // Device
    deviceName: string | null;
    deviceType: string | null;
    volumePercent: number;
}
