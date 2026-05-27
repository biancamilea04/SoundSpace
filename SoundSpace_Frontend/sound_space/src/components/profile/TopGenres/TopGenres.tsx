"use client";

import { GenreTags } from "@/components/profile/GenreTags/GenreTags";
import "./TopGenres.css";

interface TopGenresProps {
    genres: string[];
    isLoading: boolean;
}

export const TopGenres = ({ genres, isLoading }: TopGenresProps) => {
    if (isLoading) {
        return (
            <div className="top-genres">
                <h3 className="top-genres__title">Top Genres</h3>
                <span className="top-genres__loading">Loading...</span>
            </div>
        );
    }

    if (genres.length === 0) {
        return (
            <div className="top-genres">
                <h3 className="top-genres__title">Top Genres</h3>
                <span className="top-genres__loading">No genre data available.</span>
            </div>
        );
    }

    return (
        <div className="top-genres">
            <h3 className="top-genres__title">Top Genres</h3>
            <GenreTags tags={genres.slice(0, 5)} />
        </div>
    );
};

export default TopGenres;
