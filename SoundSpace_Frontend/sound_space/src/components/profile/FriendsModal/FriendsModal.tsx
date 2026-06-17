'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Search, UserMinus } from 'lucide-react';
import type { FriendListItem } from '@/types/friendship';
import './FriendsModal.css';

interface FriendsModalProps {
    friends: FriendListItem[];
    isLoading: boolean;
    isOwnProfile: boolean;
    onClose?: () => void;
    onRemove: (userId: string) => Promise<void>;
    asSidebar?: boolean;
}

export const FriendsModal = ({
    friends,
    isLoading,
    isOwnProfile,
    onClose,
    onRemove,
    asSidebar = false,
}: FriendsModalProps) => {
    const [query, setQuery] = useState('');
    const [removing, setRemoving] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const filtered = query.trim()
        ? friends.filter(f =>
              f.displayName.toLowerCase().includes(query.trim().toLowerCase())
          )
        : friends;

    const handleRemove = async (userId: string) => {
        setRemoving(userId);
        try {
            await onRemove(userId);
        } finally {
            setRemoving(null);
        }
    };

    const innerContent = (
        <>
            <div className="friends-modal__header">
                <span className="friends-modal__title">
                    Friends
                    {friends.length > 0 && (
                        <span className="friends-modal__count">{friends.length}</span>
                    )}
                </span>
                {!asSidebar && (
                    <button
                        className="friends-modal__close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="friends-modal__search-wrap">
                <Search className="friends-modal__search-icon" size={14} />
                <input
                    ref={inputRef}
                    className="friends-modal__search"
                    type="text"
                    placeholder="Search friends"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>

            <div className="friends-modal__list">
                {isLoading ? (
                    <div className="friends-modal__spinner-wrap">
                        <div className="friends-modal__spinner" />
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="friends-modal__empty">
                        {query.trim() ? 'No results found' : 'No friends yet'}
                    </p>
                ) : (
                    filtered.map(friend => (
                        <div key={friend.userId} className="friends-modal__item">
                            <Link
                                href={`/profile/${friend.displayName}`}
                                className="friends-modal__item-link"
                                onClick={!asSidebar ? onClose : undefined}
                            >
                                <div className="friends-modal__avatar">
                                    {friend.profileImageUrl ? (
                                        <img
                                            src={friend.profileImageUrl}
                                            alt={friend.displayName}
                                            className="friends-modal__avatar-img"
                                        />
                                    ) : (
                                        <span className="friends-modal__avatar-fallback">
                                            {friend.displayName[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <span className="friends-modal__name">
                                    {friend.displayName}
                                </span>
                            </Link>

                            {isOwnProfile && (
                                <button
                                    className="friends-modal__remove-btn"
                                    onClick={() => handleRemove(friend.userId)}
                                    disabled={removing === friend.userId}
                                    aria-label={`Remove ${friend.displayName}`}
                                    title="Remove friend"
                                >
                                    <UserMinus size={15} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );

    if (asSidebar) {
        return (
            <aside className="friends-modal friends-modal--sidebar">
                {innerContent}
            </aside>
        );
    }

    return (
        <div className="friends-modal__backdrop" onClick={onClose}>
            <div
                className="friends-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Friends"
                onClick={e => e.stopPropagation()}
            >
                {innerContent}
            </div>
        </div>
    );
};

export default FriendsModal;
