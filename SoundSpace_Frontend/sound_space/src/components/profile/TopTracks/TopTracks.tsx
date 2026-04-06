"use client";

import Image from "next/image";
import "./TopTracks.css";

interface Track {
    rank: number;
    title: string;
    artist: string;
    albumArtUrl: string;
}

interface TopTracksProps {
    tracks: Track[];
}

export const TopTracks = ({ tracks }: TopTracksProps) => {
    return (
        <div className="top-tracks">
            <h3 className="top-tracks__title">Top Tracks</h3>
            <div className="top-tracks__list">
                {tracks.map((track) => (
                    <div key={track.rank} className="top-tracks__item">
                        <Image
                            src={track.albumArtUrl}
                            alt={`${track.title} album art`}
                            width={40}
                            height={40}
                            className="top-tracks__album-art"
                        />
                        <div className="top-tracks__info">
                            <span className="top-tracks__track-name">{track.title}</span>
                            <span className="top-tracks__artist">{track.artist}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopTracks;
