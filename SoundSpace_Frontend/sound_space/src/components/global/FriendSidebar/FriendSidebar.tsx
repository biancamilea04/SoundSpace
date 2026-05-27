"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useFriendsActivity } from '@/hooks/Friendship/useFriendsActivity';
import type { FriendActivity } from '@/types/friendActivity';
import './FriendSidebar.css';

const DEFAULT_COVER = '/icons/SoundSpaceIcon.png';

function getRelativeTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
}

function uriToSpotifyUrl(uri: string | null): string | null {
    if (!uri) return null;
    const parts = uri.split(':');
    if (parts.length < 3) return null;
    return `https://open.spotify.com/${parts[1]}/${parts[2]}`;
}

interface FriendSidebarItemProps {
    friend: FriendActivity;
    isListeningAlong: boolean;
    onListenAlong: () => void;
    onStopListenAlong: () => void;
}

const FriendSidebarItem = ({ friend, isListeningAlong, onListenAlong, onStopListenAlong }: FriendSidebarItemProps) => {
    const {
        displayName, profileImageUrl, isOnline, isListening,
        currentlyPlayingTitle, currentlyPlayingArtist, currentlyPlayingArtistUrl,
        currentlyPlayingCoverUrl, currentlyPlayingUri,
        lastPlayedTitle, lastPlayedArtist, lastPlayedArtistUrl,
        lastPlayedUri, lastPlayedCoverUrl,
        musicStatusUpdatedAt, lastSeen,
    } = friend;

    const showCurrent = isListening && !!currentlyPlayingTitle;
    const showLast = !isListening && !!lastPlayedTitle;

    const albumArt = showCurrent
        ? (currentlyPlayingCoverUrl ?? DEFAULT_COVER)
        : (lastPlayedCoverUrl ?? profileImageUrl ?? DEFAULT_COVER);

    const songTitle = showCurrent ? currentlyPlayingTitle : (showLast ? lastPlayedTitle : null);
    const artistName = showCurrent ? currentlyPlayingArtist : (showLast ? lastPlayedArtist : null);
    const songUrl = uriToSpotifyUrl(showCurrent ? currentlyPlayingUri : (showLast ? lastPlayedUri : null));
    const artistUrl = showCurrent ? currentlyPlayingArtistUrl : (showLast ? lastPlayedArtistUrl : null);

    const timeLabel = (showCurrent || showLast)
        ? getRelativeTime(musicStatusUpdatedAt)
        : getRelativeTime(lastSeen);

    return (
        <div className={`sidebar__friend-item ${isOnline ? 'online' : 'offline'} ${isListening ? 'listening' : ''} ${isListeningAlong ? 'listen-along-active' : ''}`}>
            <Link href={`/profile/${displayName}`} className="sidebar__album-art-link" tabIndex={-1}>
                <div className="sidebar__album-art-wrapper">
                    <Image
                        src={albumArt}
                        alt={songTitle ?? displayName}
                        width={48}
                        height={48}
                        className={`sidebar__album-art ${isOnline ? '' : 'offline'}`}
                    />
                    {isListening && (
                        <div className="sidebar__equalizer-overlay">
                            <div className="sidebar__equalizer-bar" />
                            <div className="sidebar__equalizer-bar" />
                            <div className="sidebar__equalizer-bar" />
                            <div className="sidebar__equalizer-bar" />
                            <div className="sidebar__equalizer-bar" />
                            <div className="sidebar__equalizer-bar" />
                            <div className="sidebar__equalizer-bar" />
                            <div className="sidebar__equalizer-bar" />
                            <div className="sidebar__equalizer-bar" />
                            <div className="sidebar__equalizer-bar" />
                        </div>
                    )}
                    <span className={`sidebar__friend-status ${isOnline ? 'online' : 'offline'}`} />
                </div>
            </Link>

            <div className="sidebar__friend-info">
                <div className="sidebar__friend-header">
                    <Link href={`/profile/${displayName}`} className="sidebar__friend-name">
                        {displayName}
                    </Link>
                    {timeLabel && (
                        <span className="sidebar__friend-time">{timeLabel}</span>
                    )}
                </div>

                {songTitle ? (
                    <div className="sidebar__friend-track-line">
                        {songUrl ? (
                            <a
                                href={songUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`sidebar__friend-track-text ${isListening ? 'listening' : 'muted'}`}
                            >
                                {songTitle}
                                {artistName && <span className="sidebar__friend-track-separator"> · </span>}
                                {artistName && (
                                    <span
                                        className="sidebar__friend-track-artist"
                                        onClick={e => {
                                            if (artistUrl) {
                                                e.preventDefault();
                                                window.open(artistUrl, '_blank', 'noopener,noreferrer');
                                            }
                                        }}
                                    >
                                        {artistName}
                                    </span>
                                )}
                            </a>
                        ) : (
                            <span className={`sidebar__friend-track-text ${isListening ? 'listening' : 'muted'}`}>
                                {songTitle}{artistName ? ` · ${artistName}` : ''}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="sidebar__friend-track-text muted">
                        {isOnline ? 'Not listening' : 'Offline'}
                    </span>
                )}
            </div>

            {isListening && (
                <button
                    className={`sidebar__listen-along-btn ${isListeningAlong ? 'active' : ''}`}
                    onClick={isListeningAlong ? onStopListenAlong : onListenAlong}
                    title={isListeningAlong ? 'Stop Sync' : 'Listen Along'}
                    aria-label={isListeningAlong ? 'Stop Listen Along' : 'Listen Along'}
                >
                    {isListeningAlong ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
};

const FriendSidebar = () => {
    const { friends, loading, listenAlongFriendId, listenAlongError, startListenAlong, stopListenAlong } = useFriendsActivity();
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        if (!listenAlongError) return;
        setToast(listenAlongError);
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [listenAlongError]);

    if (loading) {
        return (
            <div className="friend-sidebar">
                <h3 className="friend-sidebar__header">Friends</h3>
            </div>
        );
    }

    return (
        <div className="friend-sidebar">
            <h3 className="friend-sidebar__header">Friends</h3>
            <div className="friend-sidebar__list">
                {friends.map(friend => (
                    <FriendSidebarItem
                        key={friend.userId}
                        friend={friend}
                        isListeningAlong={listenAlongFriendId === friend.userId}
                        onListenAlong={() => startListenAlong(friend.userId)}
                        onStopListenAlong={stopListenAlong}
                    />
                ))}
                {friends.length === 0 && (
                    <span className="friend-sidebar__empty">No friends yet</span>
                )}
            </div>
            {toast && (
                <div className="friend-sidebar__toast">{toast}</div>
            )}
        </div>
    );
};

export default FriendSidebar;
