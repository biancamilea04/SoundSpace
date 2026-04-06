"use client";

import "./GenreTags.css";

interface GenreTagsProps {
    tags: string[];
}

export const GenreTags = ({ tags }: GenreTagsProps) => {
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
