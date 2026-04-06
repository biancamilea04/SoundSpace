import React from 'react';
import type { FilterButtonsProps } from '@/types/discovery';
import './FilterButtons.css';

export const FilterButtons = ({ activeFilter, onFilterChange }: FilterButtonsProps) => {
    return (
        <div className="filter-buttons">
            <button
                type="button"
                className={`filter-buttons__btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => onFilterChange('all')}
            >
                All
            </button>
            <button
                type="button"
                className={`filter-buttons__btn ${activeFilter === 'genres' ? 'active' : ''}`}
                onClick={() => onFilterChange('genres')}
            >
                By Genres
            </button>
            <button
                type="button"
                className={`filter-buttons__btn ${activeFilter === 'songs' ? 'active' : ''}`}
                onClick={() => onFilterChange('songs')}
            >
                By Songs
            </button>
        </div>
    );
};

export default FilterButtons;