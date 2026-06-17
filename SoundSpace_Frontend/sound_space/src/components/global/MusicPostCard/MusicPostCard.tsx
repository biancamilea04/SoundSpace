"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import "./MusicPostCard.css";

interface MusicPostCardProps {
    postId: string;
    previewUrl: string;
    coverUrl?: string | null;
    title: string;
    artist: string;
    externalUrl?: string | null;
    subtitleUrl?: string | null;
    previewStartSecond?: number | null;
    previewDuration?: number | null;
}

const SpotifyLogo = () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="#1DB954" aria-label="Spotify">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zm.16-3.42C16.44 7.38 9.6 7.2 5.58 8.4c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.62-1.38 12.12-1.2 16.32 1.26.54.36.72 1.02.36 1.56-.3.54-1.02.72-1.44.48z" />
    </svg>
);

const MusicPostCard = ({ postId, previewUrl, coverUrl, title, artist, externalUrl, subtitleUrl, previewStartSecond, previewDuration }: MusicPostCardProps) => {
    const { playingPostId, audioRef, startPlaying, stopPlaying } = useAudioPlayer();
    const isPlaying = playingPostId === postId;
    const [progress, setProgress] = useState(0);
    const animFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isPlaying) {
            setProgress(0);
            if (animFrameRef.current !== null) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
            return;
        }

        const audio = audioRef.current;
        if (!audio) return;

        const startOffset = previewStartSecond ?? 0;
        const totalDuration = previewDuration ?? audio.duration;

        const tick = () => {
            if (totalDuration > 0) {
                setProgress(Math.min(1, (audio.currentTime - startOffset) / totalDuration));
            }
            animFrameRef.current = requestAnimationFrame(tick);
        };

        animFrameRef.current = requestAnimationFrame(tick);

        return () => {
            if (animFrameRef.current !== null) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
        };
    }, [isPlaying, audioRef, previewStartSecond, previewDuration]);

    const handleToggle = () => {
        if (isPlaying) {
            stopPlaying();
        } else {
            startPlaying(
                postId,
                previewUrl,
                previewStartSecond ?? undefined,
                previewDuration ?? undefined,
            );
        }
    };

    const circumference = 2 * Math.PI * 16;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className={`music-post-card${isPlaying ? " music-post-card--playing" : ""}`}>
            <div className="music-post-card__cover-wrap">
                <Image
                    src={coverUrl || "/icons/SoundSpaceIcon.png"}
                    alt={title}
                    width={72}
                    height={72}
                    className="music-post-card__cover"
                />
            </div>

            <div className="music-post-card__meta">
                <div className="music-post-card__badge-row">
                    <SpotifyLogo />
                    <span className="music-post-card__type-label">TRACK</span>
                </div>
                <h3 className="music-post-card__title" title={title}>
                    {externalUrl ? (
                        <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                            {title}
                        </a>
                    ) : title}
                </h3>
                <p className="music-post-card__artist">
                    {subtitleUrl ? (
                        <a href={subtitleUrl} target="_blank" rel="noopener noreferrer">
                            {artist}
                        </a>
                    ) : artist}
                </p>
            </div>

            <button
                className="music-post-card__play-btn"
                onClick={handleToggle}
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
            >
                <svg className="music-post-card__ring" viewBox="0 0 40 40" width="40" height="40">
                    <circle
                        className="music-post-card__ring-track"
                        cx="20" cy="20" r="16"
                        fill="none"
                        strokeWidth="2.5"
                    />
                    <circle
                        className="music-post-card__ring-progress"
                        cx="20" cy="20" r="16"
                        fill="none"
                        strokeWidth="2.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 20 20)"
                    />
                </svg>
                <span className="music-post-card__play-icon">
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </span>
            </button>
        </div>
    );
};

export default MusicPostCard;
