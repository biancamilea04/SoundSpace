"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { TopTrack } from "@/types/topTrack";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import "./TopTracks.css";

interface TopTracksProps {
    tracks: TopTrack[];
    isLoading?: boolean;
    showSlider?: boolean;
}

export const TopTracks = ({ tracks, isLoading, showSlider = false }: TopTracksProps) => {
    const listRef = useRef<HTMLDivElement>(null);
    const { playingPostId, startPlaying } = useAudioPlayer();
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (msg: string) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(msg);
        toastTimer.current = setTimeout(() => setToast(null), 3000);
    };

    // Seed the scroll at the start of the middle copy so both directions loop
    useEffect(() => {
        if (!showSlider || !listRef.current || tracks.length === 0) return;
        const el = listRef.current;
        el.scrollLeft = el.scrollWidth / 3;
    }, [showSlider, tracks]);

    useEffect(() => {
        return () => {
            if (toastTimer.current) clearTimeout(toastTimer.current);
        };
    }, []);

    const handleScroll = useCallback(() => {
        const el = listRef.current;
        if (!el) return;
        const setWidth = el.scrollWidth / 3;
        if (el.scrollLeft >= setWidth * 2) {
            el.scrollLeft -= setWidth;
        } else if (el.scrollLeft < setWidth) {
            el.scrollLeft += setWidth;
        }
    }, []);

    const scrollByCard = (direction: "left" | "right") => {
        const el = listRef.current;
        if (!el) return;
        const firstCard = el.firstElementChild as HTMLElement | null;
        const cardWidth = firstCard ? firstCard.offsetWidth + 12 : 140;
        el.scrollLeft += direction === "left" ? -cardWidth : cardWidth;
    };

    const handlePlayClick = (track: TopTrack) => {
        if (!track.previewUrl) {
            showToast("No preview available for this track.");
            return;
        }
        const playerId = track.spotifyUrl ?? track.title;
        startPlaying(playerId, track.previewUrl);
    };

    if (isLoading) {
        return (
            <div className="top-tracks">
                <h3 className="top-tracks__title">Top Tracks</h3>
                <span className="top-tracks__loading">Loading...</span>
            </div>
        );
    }

    if (tracks.length === 0) {
        return (
            <div className="top-tracks">
                <h3 className="top-tracks__title">Top Tracks</h3>
                <span className="top-tracks__loading">
                    No top tracks found. You may need to log out and log in again to grant permissions.
                </span>
            </div>
        );
    }

    const displayTracks = showSlider ? [...tracks, ...tracks, ...tracks] : tracks;

    return (
        <div className={`top-tracks${showSlider ? " top-tracks--slider" : ""}`}>
            <h3 className="top-tracks__title">Top Tracks</h3>

            {toast && (
                <div className="top-tracks__toast" role="status">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    {toast}
                </div>
            )}

            {showSlider ? (
                <div className="top-tracks__carousel">
                    <button
                        className="top-tracks__btn top-tracks__btn--left"
                        onClick={() => scrollByCard("left")}
                        aria-label="Previous tracks"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>

                    <div className="top-tracks__list" ref={listRef} onScroll={handleScroll}>
                        {displayTracks.map((track, i) => {
                            const playerId = track.spotifyUrl ?? track.title;
                            const isPlaying = playingPostId === playerId;

                            return (
                                <div key={`${track.title}-${i}`} className="top-tracks__item">
                                    <div className="top-tracks__art-wrap">
                                        {track.imageUrl ? (
                                            <Image
                                                src={track.imageUrl}
                                                alt={`${track.title} album art`}
                                                width={112}
                                                height={112}
                                                className="top-tracks__album-art"
                                            />
                                        ) : (
                                            <div className="top-tracks__album-art top-tracks__album-art--fallback">
                                                {track.title?.charAt(0) ?? "?"}
                                            </div>
                                        )}
                                        <button
                                            className={`top-tracks__play-btn${isPlaying ? " top-tracks__play-btn--active" : ""}${!track.previewUrl ? " top-tracks__play-btn--disabled" : ""}`}
                                            aria-label={isPlaying ? "Pause preview" : "Play preview"}
                                            onClick={() => handlePlayClick(track)}
                                        >
                                            {isPlaying ? (
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="top-tracks__info">
                                        <a
                                            href={track.spotifyUrl || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="top-tracks__track-name-link"
                                        >
                                            {track.title}
                                        </a>
                                        <a
                                            href={track.artistUrl || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="top-tracks__artist-link"
                                        >
                                            {track.artistName}
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        className="top-tracks__btn top-tracks__btn--right"
                        onClick={() => scrollByCard("right")}
                        aria-label="Next tracks"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="top-tracks__list">
                    {displayTracks.map((track) => (
                        <div key={track.title} className="top-tracks__item">
                            {track.imageUrl ? (
                                <Image
                                    src={track.imageUrl}
                                    alt={`${track.title} album art`}
                                    width={40}
                                    height={40}
                                    className="top-tracks__album-art"
                                />
                            ) : (
                                <div className="top-tracks__album-art top-tracks__album-art--fallback">
                                    {track.title?.charAt(0) ?? "?"}
                                </div>
                            )}
                            <div className="top-tracks__info">
                                <a
                                    href={track.spotifyUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="top-tracks__track-name-link"
                                >
                                    {track.title}
                                </a>
                                <a
                                    href={track.artistUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="top-tracks__artist-link"
                                >
                                    {track.artistName}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopTracks;
