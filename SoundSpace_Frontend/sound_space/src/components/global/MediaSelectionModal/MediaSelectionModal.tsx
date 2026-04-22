"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, Search, Music, Disc3, Mic2, AlertCircle, Clock } from 'lucide-react';
import { useSpotifySearch } from '@/hooks/spotify/useSpotifySearch';
import type { SpotifyMediaItem, SpotifyMediaType } from '@/types/spotify';
import './MediaSelectionModal.css';

interface MediaSelectionModalProps {
    onSelect: (item: SpotifyMediaItem) => void;
    onClose: () => void;
}

const FOCUSABLE = 'button, input, [tabindex]:not([tabindex="-1"])';

const TypeIcon = ({ type }: { type: SpotifyMediaType }) => {
    if (type === 'album') return <Disc3 size={14} className="media-modal__item-type-icon" />;
    if (type === 'episode') return <Mic2 size={14} className="media-modal__item-type-icon" />;
    return <Music size={14} className="media-modal__item-type-icon" />;
};

const SkeletonRow = () => (
    <div className="media-modal__skeleton-row">
        <div className="media-modal__skeleton-cover" />
        <div className="media-modal__skeleton-lines">
            <div className="media-modal__skeleton-line" />
            <div className="media-modal__skeleton-line media-modal__skeleton-line--short" />
        </div>
    </div>
);

const SKELETON_COUNT = 8;

const TABS: { type: SpotifyMediaType; label: string }[] = [
    { type: 'track', label: 'Song' },
    { type: 'album', label: 'Album' },
    { type: 'episode', label: 'Episode' },
];

const RECENT_LABEL: Record<SpotifyMediaType, string> = {
    track: 'Recently Played Songs',
    album: 'Recently Played Albums',
    episode: 'Saved Episodes',
};

const EMPTY_LABEL: Record<SpotifyMediaType, string> = {
    track: 'No recently played songs.',
    album: 'No recently played albums.',
    episode: 'No saved episodes.',
};

const ModalContent = ({ onSelect, onClose }: MediaSelectionModalProps) => {
    const [activeTab, setActiveTab] = useState<SpotifyMediaType>('track');
    const { query, setQuery, results, recentItems, isLoading, isLoadingRecent, error } =
        useSpotifySearch(activeTab);
    const dialogRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        dialog.focus();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab') return;
            const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    useEffect(() => {
        setQuery('');
    }, [activeTab, setQuery]);

    const renderContent = () => {
        if ((isLoadingRecent && !query) || (isLoading && !!query)) {
            return (
                <div className="media-modal__skeleton-list">
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                        <SkeletonRow key={i} />
                    ))}
                </div>
            );
        }

        if (error === 'rate-limited') {
            return (
                <div className="media-modal__empty-state">
                    <AlertCircle size={28} className="media-modal__empty-icon" />
                    <p className="media-modal__empty-text">Too many requests. Try again in a moment.</p>
                </div>
            );
        }

        if (error === 'generic') {
            return (
                <div className="media-modal__empty-state">
                    <AlertCircle size={28} className="media-modal__empty-icon" />
                    <p className="media-modal__empty-text">Something went wrong.</p>
                </div>
            );
        }

        if (!query) {
            if (recentItems.length === 0) {
                return (
                    <div className="media-modal__empty-state">
                        <Clock size={28} className="media-modal__empty-icon" />
                        <p className="media-modal__empty-text">{EMPTY_LABEL[activeTab]}</p>
                    </div>
                );
            }
            return (
                <>
                    <p className="media-modal__section-label">{RECENT_LABEL[activeTab]}</p>
                    {recentItems.map((item) => (
                        <ItemRow key={item.uri} item={item} onSelect={onSelect} />
                    ))}
                </>
            );
        }

        if (results.length === 0) {
            return (
                <div className="media-modal__empty-state">
                    <Search size={28} className="media-modal__empty-icon" />
                    <p className="media-modal__empty-text">No results for &ldquo;{query}&rdquo;</p>
                </div>
            );
        }

        return results.map((item) => (
            <ItemRow key={item.uri} item={item} onSelect={onSelect} />
        ));
    };

    return (
        <>
            <div className="media-modal__overlay" onClick={onClose} aria-hidden="true" />
            <div
                className="media-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Select a song, album, or episode"
                tabIndex={-1}
                ref={dialogRef}
            >
                <div className="media-modal__header">
                    <h2 className="media-modal__title">Add Media</h2>
                    <button
                        type="button"
                        className="media-modal__close-btn"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="media-modal__search-bar">
                    <Search size={16} className="media-modal__search-icon" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="media-modal__search-input"
                        placeholder="Search songs, albums, episodes..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoComplete="off"
                    />
                    {query && (
                        <button
                            type="button"
                            className="media-modal__search-clear"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="media-modal__tabs">
                    {TABS.map(({ type, label }) => (
                        <button
                            key={type}
                            type="button"
                            className={`media-modal__tab${activeTab === type ? ' media-modal__tab--active' : ''}`}
                            onClick={() => setActiveTab(type)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="media-modal__body">{renderContent()}</div>
            </div>
        </>
    );
};

const ItemRow = ({
    item,
    onSelect,
}: {
    item: SpotifyMediaItem;
    onSelect: (item: SpotifyMediaItem) => void;
}) => (
    <button type="button" className="media-modal__item" onClick={() => onSelect(item)}>
        <div className="media-modal__item-cover-wrap">
            <Image
                src={item.coverUrl || '/icons/SoundSpaceIcon.png'}
                alt={item.name}
                width={44}
                height={44}
                className="media-modal__item-cover"
            />
        </div>
        <div className="media-modal__item-info">
            <span className="media-modal__item-name">{item.name}</span>
            <span className="media-modal__item-subtitle">{item.subtitle}</span>
        </div>
        <TypeIcon type={item.type} />
    </button>
);

export const MediaSelectionModal = ({ onSelect, onClose }: MediaSelectionModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <ModalContent onSelect={onSelect} onClose={onClose} />,
        document.body
    );
};

export default MediaSelectionModal;
