"use client";

import "./GenreTags.css";

interface GenreTagsProps {
    tags: string[];
    isLoading?: boolean;
}

export const GenreTags = ({ tags, isLoading }: GenreTagsProps) => {
    if (isLoading) return null;
    if (tags.length === 0) return null;

    return (
        <div className="genre-tags">
            {tags.map((tag) => (
                <span key={tag} className="genre-tags__pill">
                    {tag}
                </span>
            ))}
        </div>
    );
};

export default GenreTags;
