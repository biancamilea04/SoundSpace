"use client";

import Image from "next/image";
import { TopTrack } from "@/types/topTrack";
import "./TopTracks.css";

interface TopTracksProps {
    tracks: TopTrack[];
    isLoading?: boolean;
}

export const TopTracks = ({ tracks, isLoading }: TopTracksProps) => {
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
                <span className="top-tracks__loading">No top tracks found. You may need to log out and log in again to grant permissions.</span>
            </div>
        );
    }

    return (
        <div className="top-tracks">
            <h3 className="top-tracks__title">Top Tracks</h3>
            <div className="top-tracks__list">
                {tracks.map((track) => (
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
                                {track.title?.charAt(0) ?? '?'}
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
        </div>
    );
};

export default TopTracks;
