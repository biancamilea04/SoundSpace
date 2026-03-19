"use client";

import {Pause, Play} from "lucide-react";
import Image from "next/image";
import {useSpotifyStatus} from "@/hooks/NowPlaying/useNowPlaying";
import "./NowPlaying.css";

/** Convert milliseconds → "m:ss" */
const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const NowPlaying = () => {
    const {nowPlaying, isLoading} = useSpotifyStatus();

    if (isLoading) {
        return (
            <section>
                <h2 className="now-playing__section-title">Now Playing</h2>
                <div className="now-playing__card">
                    <p className="now-playing__empty">Loading...</p>
                </div>
            </section>
        );
    }

    if (!nowPlaying) {
        return (
            <section>
                <h2 className="now-playing__section-title">Now Playing</h2>
                <div className="now-playing__card">
                    <p className="now-playing__empty">Nothing playing right now</p>
                </div>
            </section>
        );
    }

    const progress = nowPlaying.durationMs > 0
        ? (nowPlaying.progressMs / nowPlaying.durationMs) * 100
        : 0;

    return (
        <section>
            <h2 className="now-playing__section-title">
                {nowPlaying.isPlaying ? "Now Playing" : "Last Played"}
            </h2>
            <div className="now-playing__card">
                <div className="now-playing__content">
                    {/* Album Art */}
                    <div className="now-playing__album-art">
                        <Image
                            src={nowPlaying.albumImageUrl || "/icons/SoundSpaceIcon.png"}
                            alt={`${nowPlaying.albumName} album art`}
                            width={100}
                            height={100}
                            className="now-playing__album-img"
                        />
                    </div>

                    {/* Song Info */}
                    <div className="now-playing__song-info">
                        <h3 className="now-playing__song-title">
                            {nowPlaying.songTitle}
                        </h3>
                        <p className="now-playing__song-artist">
                            {nowPlaying.artistNames} · {nowPlaying.albumName}
                        </p>

                        {/* Progress Bar */}
                        {nowPlaying.isPlaying && (
                            <div className="now-playing__progress-wrapper">
                                <div className="now-playing__progress-bar">
                                    <div
                                        className="now-playing__progress-fill"
                                        style={{width: `${progress}%`}}
                                    />
                                </div>
                                <div className="now-playing__progress-times">
                                    <span>{formatTime(nowPlaying.progressMs)}</span>
                                    <span>{formatTime(nowPlaying.durationMs)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NowPlaying;
