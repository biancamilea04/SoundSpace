"use client";

import Image from "next/image";
import "./CurrentlyListening.css";

const DEFAULT_COVER = '/icons/SoundSpaceIcon.png';

function uriToSpotifyUrl(uri: string | null): string | null {
    if (!uri) return null;
    const parts = uri.split(':');
    if (parts.length < 3) return null;
    return `https://open.spotify.com/${parts[1]}/${parts[2]}`;
}

interface CurrentlyListeningProps {
    trackName: string | null;
    artistName: string | null;
    coverUrl: string | null;
    trackUri: string | null;
    artistUrl: string | null;
    label?: string;
    isListening?: boolean;
}

export const CurrentlyListening = ({
    trackName,
    artistName,
    coverUrl,
    trackUri,
    artistUrl,
    label = 'Currently Listening',
    isListening = true,
}: CurrentlyListeningProps) => {
    if (!trackName) return null;

    const trackUrl = uriToSpotifyUrl(trackUri);

    return (
        <div className="currently-listening">
            <h3 className="currently-listening__label">{label}</h3>
            <div className="currently-listening__content">
                <div className="currently-listening__art-wrapper">
                    <Image
                        src={coverUrl ?? DEFAULT_COVER}
                        alt={trackName}
                        width={48}
                        height={48}
                        className="currently-listening__art"
                    />
                    {isListening && (
                        <div className="currently-listening__equalizer-overlay">
                            <div className="currently-listening__bar" />
                            <div className="currently-listening__bar" />
                            <div className="currently-listening__bar" />
                            <div className="currently-listening__bar" />
                            <div className="currently-listening__bar" />
                            <div className="currently-listening__bar" />
                        </div>
                    )}
                </div>

                <div className="currently-listening__info">
                    {trackUrl ? (
                        <a
                            href={trackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="currently-listening__track"
                        >
                            {trackName}
                        </a>
                    ) : (
                        <span className="currently-listening__track">{trackName}</span>
                    )}
                    {artistName && (
                        artistUrl ? (
                            <a
                                href={artistUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="currently-listening__artist"
                            >
                                {artistName}
                            </a>
                        ) : (
                            <span className="currently-listening__artist">{artistName}</span>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default CurrentlyListening;
