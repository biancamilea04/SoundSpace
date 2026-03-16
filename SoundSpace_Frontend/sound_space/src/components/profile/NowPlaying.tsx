"use client";

import { Heart, Pause, Play } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import "./NowPlaying.css";

interface NowPlayingProps {
    songTitle: string;
    artist: string;
    album: string;
    albumArtUrl: string;
    currentTime: string;
    totalTime: string;
    progress: number;
    isPlaying?: boolean;
}

export const NowPlaying = ({
    songTitle,
    artist,
    album,
    albumArtUrl,
    currentTime,
    totalTime,
    progress,
    isPlaying: initialPlaying = true,
}: NowPlayingProps) => {
    const [isPlaying, setIsPlaying] = useState(initialPlaying);
    const [isLiked, setIsLiked] = useState(false);

    return (
        <section>
            <h2 className="now-playing__section-title">
                Now Playing
            </h2>
            <div className="now-playing__card">
                <div className="now-playing__content">
                    {/* Album Art */}
                    <div className="now-playing__album-art">
                        <Image
                            src={albumArtUrl}
                            alt={`${album} album art`}
                            width={100}
                            height={100}
                            className="now-playing__album-img"
                        />
                    </div>

                    {/* Song Info */}
                    <div className="now-playing__song-info">
                        <h3 className="now-playing__song-title">
                            {songTitle}
                        </h3>
                        <p className="now-playing__song-artist">
                            {artist} · {album}
                        </p>

                        {/* Progress Bar */}
                        <div className="now-playing__progress-wrapper">
                            <div className="now-playing__progress-bar">
                                <div
                                    className="now-playing__progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="now-playing__progress-times">
                                <span>{currentTime}</span>
                                <span>{totalTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="now-playing__controls">

                    {/* Play/Pause Button */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="now-playing__play-btn"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause className="now-playing__play-icon" />
                        ) : (
                            <Play className="now-playing__play-icon now-playing__play-icon--play" />
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NowPlaying;
