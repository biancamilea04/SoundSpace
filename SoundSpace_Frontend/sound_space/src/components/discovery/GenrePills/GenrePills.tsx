import React from 'react';
import type { GenrePillsProps } from '@/types/discovery';
import './GenrePills.css';

export const GenrePills = ({ genres }: GenrePillsProps) => {
    return (
        <div className="genre-pills">
            {genres.map((genre) => (
                <span key={genre} className="genre-pills__pill">
                    {genre}
                </span>
            ))}
        </div>
    );
};

export default GenrePills;