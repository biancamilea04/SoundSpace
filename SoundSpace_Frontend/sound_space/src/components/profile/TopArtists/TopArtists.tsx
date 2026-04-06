"use client";

import Image from "next/image";
import "./TopArtists.css";

interface Artist {
    name: string;
    imageUrl: string;
}

interface TopArtistsProps {
    artists: Artist[];
}

export const TopArtists = ({ artists }: TopArtistsProps) => {
    return (
        <div className="top-artists">
            <h3 className="top-artists__title">Most Listened Artists</h3>
            <div className="top-artists__list">
                {artists.map((artist) => (
                    <div key={artist.name} className="top-artists__item">
                        <Image
                            src={artist.imageUrl}
                            alt={artist.name}
                            width={40}
                            height={40}
                            className="top-artists__avatar"
                        />
                        <span className="top-artists__name">{artist.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopArtists;
