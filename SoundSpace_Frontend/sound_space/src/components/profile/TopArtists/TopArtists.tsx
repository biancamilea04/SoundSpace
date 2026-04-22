"use client";

import Image from "next/image";
import { TopArtist } from "@/types/topArtist";
import "./TopArtists.css";

interface TopArtistsProps {
    artists: TopArtist[];
    isLoading: boolean;
}

export const TopArtists = ({ artists, isLoading }: TopArtistsProps) => {
    if (isLoading) {
        return (
            <div className="top-artists">
                <h3 className="top-artists__title">Most Listened Artists</h3>
                <span className="top-artists__loading">Loading...</span>
            </div>
        );
    }

    if (artists.length === 0) {
        return (
            <div className="top-artists">
                <h3 className="top-artists__title">Most Listened Artists</h3>
                <span className="top-artists__loading">No top artists found. You may need to log out and log in again to grant permissions.</span>
            </div>
        );
    }

    return (
        <div className="top-artists">
            <h3 className="top-artists__title">Most Listened Artists</h3>
            <div className="top-artists__list">
                {artists.map((artist) => (
                    <div key={artist.name} className="top-artists__item">
                        {artist.imageUrl ? (
                            <Image
                                src={artist.imageUrl}
                                alt={artist.name}
                                width={40}
                                height={40}
                                className="top-artists__avatar"
                            />
                        ) : (
                            <div className="top-artists__avatar top-artists__avatar--fallback">
                                {artist.name.charAt(0)}
                            </div>
                        )}
                        <a
                            href={artist.spotifyUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="top-artists__link"
                        >
                            {artist.name}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopArtists;
