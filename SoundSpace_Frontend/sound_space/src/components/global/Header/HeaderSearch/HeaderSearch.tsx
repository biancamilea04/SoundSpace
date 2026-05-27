"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchUsers } from '@/hooks/Users/useSearchUsers';
import './HeaderSearch.css';

const HeaderSearch = ({ placeholder = 'Search users...' }: { placeholder?: string }) => {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounce(searchInput, 400);
    const isSearching = debouncedQuery.trim().length >= 2;

    const { data: results, isLoading } = useSearchUsers(debouncedQuery);

    useEffect(() => {
        setIsOpen(isSearching);
    }, [isSearching]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setSearchInput('');
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSelect = (displayName: string) => {
        router.push(`/profile/${encodeURIComponent(displayName)}`);
        setSearchInput('');
        setIsOpen(false);
    };

    return (
        <div className="main-header__center" ref={containerRef}>
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
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={() => isSearching && setIsOpen(true)}
                />
            </div>

            {isOpen && (
                <div className="main-header__search-dropdown">
                    {isLoading && (
                        <div className="main-header__search-state">Searching…</div>
                    )}
                    {!isLoading && results && results.length === 0 && (
                        <div className="main-header__search-state">No users found.</div>
                    )}
                    {!isLoading && results && results.map((user) => (
                        <button
                            key={user.id}
                            className="main-header__search-item"
                            onClick={() => handleSelect(user.displayName)}
                        >
                            <div className="main-header__search-avatar">
                                {user.profileImageUrl
                                    ? <img src={user.profileImageUrl} alt={user.displayName} className="main-header__search-avatar-img" />
                                    : <span className="main-header__search-avatar-fallback">{user.displayName[0].toUpperCase()}</span>
                                }
                            </div>
                            <span className="main-header__search-name">{user.displayName}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeaderSearch;
