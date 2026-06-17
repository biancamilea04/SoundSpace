import React from 'react';
import Image from 'next/image';
import './Song.css';

export interface SongProps {
    title: string;
    artist: string;
    albumName?: string;
    albumImageUrl?: string;
    isNewRelease?: boolean;
    showProgress?: boolean;
    progressPercent?: number;
    durationFormatted?: string;
}

export const Song = ({
    title,
    artist,
    albumName,
    albumImageUrl,
    isNewRelease = false,
    showProgress = false,
    progressPercent = 0,
    durationFormatted = ""
}: SongProps) => {
    const progressStyle = { "--song-progress": `${progressPercent}%` } as React.CSSProperties;

    return (
        <div className="song-component">
            <div className="song-component__image-container">
                <Image
                    src={albumImageUrl || "/icons/SoundSpaceIcon.png"}
                    alt={`${albumName || title} album art`}
                    width={90}
                    height={90}
                    className="song-component__image"
                />
            </div>

            <div className="song-component__info">
                <div className="song-component__header">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#1ed760" className="song-component__spotify-icon">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM20.16 9.6C16.44 7.38 9.6 7.2 5.58 8.4c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.62-1.38 12.12-1.2 16.32 1.26.54.36.72 1.02.36 1.56-.3.54-1.02.72-1.44.48z"/>
                    </svg>
                </div>

                <div className="song-component__titles">
                    <h3 className="song-component__title">{title}</h3>
                    <p className="song-component__artist">
                        {artist} {albumName && `· ${albumName}`}
                    </p>
                </div>

                {showProgress && (
                    <div className="song-component__progress-container">
                        <div className="song-component__progress-slider" style={progressStyle}>
                            <div className="song-component__progress-track">
                                <div className="song-component__progress-fill"></div>
                            </div>
                            <div className="song-component__progress-thumb"></div>
                        </div>
                        <span className="song-component__progress-time">
                            {durationFormatted}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Song;
