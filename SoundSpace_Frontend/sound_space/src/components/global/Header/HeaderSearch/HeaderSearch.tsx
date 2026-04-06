import React from 'react';
import './HeaderSearch.css';

interface HeaderSearchProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

const HeaderSearch = ({ placeholder = 'Search', value, onChange }: HeaderSearchProps) => {
    return (
        <div className="main-header__center">
            <div className="main-header__search">
                <svg
                    className="main-header__search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
                </svg>
                <input
                    type="text"
                    className="main-header__search-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => onChange?.(event.target.value)}
                />
            </div>
        </div>
    );
};

export default HeaderSearch;

