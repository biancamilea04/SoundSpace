export interface NowPlayingArtist {
    name: string;
    uri: string | null;
    spotifyUrl: string | null;
}

export interface NowPlayingData {
    isPlaying: boolean;
    progressMs: number;
    durationMs: number;
    repeatState: string;
    shuffleState: boolean;

    songTitle: string;
    songUri: string;
    isExplicit: boolean;

    artistNames: string;
    artists: NowPlayingArtist[];

    albumName: string;
    albumUri: string;
    albumImageUrl: string | null;
    releaseDate: string | null;

    deviceName: string | null;
    deviceType: string | null;
    volumePercent: number;
}
