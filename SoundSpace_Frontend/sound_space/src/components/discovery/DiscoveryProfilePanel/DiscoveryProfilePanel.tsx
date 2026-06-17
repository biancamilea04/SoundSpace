'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, UserPlus, Check, Music2, Mic2, Clock, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { DiscoveryUserProfile } from '@/types/discovery';
import {
    fetchDiscoveryUserArtists,
    fetchDiscoveryUserTracks,
    fetchDiscoveryUserStreams,
    fetchDiscoveryUserPosts,
} from '@/services/discovery/discoveryService';
import { sendFriendRequest } from '@/services/friendship/friendshipService';
import './DiscoveryProfilePanel.css';

interface DiscoveryProfilePanelProps {
    profile: DiscoveryUserProfile;
    onClose: () => void;
}

type FriendState = 'idle' | 'loading' | 'sent' | 'error';

export const DiscoveryProfilePanel = ({ profile, onClose }: DiscoveryProfilePanelProps) => {
    const [friendState, setFriendState] = useState<FriendState>('idle');

    const { data: artists = [] } = useQuery({
        queryKey: ['dp-artists', profile.name],
        queryFn:  () => fetchDiscoveryUserArtists(profile.name),
        staleTime: 5 * 60 * 1000,
    });

    const { data: tracks = [] } = useQuery({
        queryKey: ['dp-tracks', profile.name],
        queryFn:  () => fetchDiscoveryUserTracks(profile.name),
        staleTime: 5 * 60 * 1000,
    });

    const { data: streams = [] } = useQuery({
        queryKey: ['dp-streams', profile.name],
        queryFn:  () => fetchDiscoveryUserStreams(profile.name),
        staleTime: 5 * 60 * 1000,
    });

    const { data: posts = [] } = useQuery({
        queryKey: ['dp-posts', profile.id],
        queryFn:  () => fetchDiscoveryUserPosts(profile.id),
        staleTime: 5 * 60 * 1000,
    });

    const handleAddFriend = async () => {
        if (friendState !== 'idle') return;
        setFriendState('loading');
        try {
            await sendFriendRequest(profile.id);
            setFriendState('sent');
        } catch {
            setFriendState('error');
        }
    };

    const friendLabel =
        friendState === 'loading' ? 'Sending…' :
        friendState === 'sent'    ? 'Requested' :
        friendState === 'error'   ? 'Already sent' :
        'Add Friend';

    return (
        <>
            <div className="dp-panel__backdrop" onClick={onClose} aria-hidden="true" />

            <div className="dp-panel" role="dialog" aria-modal="true" aria-label={`${profile.name}'s profile`}>
                {/* Drag handle + close */}
                <div className="dp-panel__topbar">
                    <div className="dp-panel__drag-handle" />
                    <button className="dp-panel__close-btn" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Hero */}
                <div className="dp-panel__hero">
                    <div className="dp-panel__avatar">
                        {profile.imageUrl ? (
                            <Image
                                src={profile.imageUrl}
                                alt={profile.name}
                                fill
                                className="dp-panel__avatar-img"
                            />
                        ) : (
                            <div className="dp-panel__avatar-fallback">
                                <Music2 size={28} />
                            </div>
                        )}
                    </div>

                    <div className="dp-panel__hero-text">
                        <h2 className="dp-panel__name">{profile.name}</h2>
                        {profile.tagline && (
                            <span className="dp-panel__country">{profile.tagline}</span>
                        )}
                        <span className="dp-panel__match-badge">{profile.matchPercentage}% match</span>
                    </div>

                    <button
                        className={`dp-panel__friend-btn dp-panel__friend-btn--${friendState}`}
                        onClick={handleAddFriend}
                        disabled={friendState !== 'idle'}
                    >
                        {friendState === 'sent' ? <Check size={15} /> : <UserPlus size={15} />}
                        {friendLabel}
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="dp-panel__body">

                    {/* Top Artists */}
                    {artists.length > 0 && (
                        <section className="dp-panel__section">
                            <h3 className="dp-panel__section-title">
                                <Mic2 size={15} />
                                Top Artists
                            </h3>
                            <div className="dp-panel__artists-row">
                                {artists.map((a) => (
                                    <div key={a.id} className="dp-panel__artist-chip">
                                        <div className="dp-panel__artist-thumb">
                                            {a.imageUrl ? (
                                                <Image
                                                    src={a.imageUrl}
                                                    alt={a.name}
                                                    fill
                                                    className="dp-panel__artist-img"
                                                />
                                            ) : (
                                                <div className="dp-panel__artist-fallback">
                                                    <Mic2 size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="dp-panel__artist-name">{a.name}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Top Tracks */}
                    {tracks.length > 0 && (
                        <section className="dp-panel__section">
                            <h3 className="dp-panel__section-title">
                                <Music2 size={15} />
                                Top Tracks
                            </h3>
                            <div className="dp-panel__track-list">
                                {tracks.map((t, i) => (
                                    <div key={t.id || i} className="dp-panel__track-row">
                                        <div className="dp-panel__track-cover">
                                            {t.coverUrl ? (
                                                <Image src={t.coverUrl} alt={t.title} fill className="dp-panel__track-cover-img" />
                                            ) : (
                                                <div className="dp-panel__track-cover-fallback">
                                                    <Music2 size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="dp-panel__track-info">
                                            <span className="dp-panel__track-title">{t.title}</span>
                                            <span className="dp-panel__track-artist">{t.artist}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recently Listened */}
                    {streams.length > 0 && (
                        <section className="dp-panel__section">
                            <h3 className="dp-panel__section-title">
                                <Clock size={15} />
                                Recently Listened
                            </h3>
                            <div className="dp-panel__track-list">
                                {streams.map((s, i) => (
                                    <div key={s.id || i} className="dp-panel__track-row">
                                        <div className="dp-panel__track-cover">
                                            {s.coverUrl ? (
                                                <Image src={s.coverUrl} alt={s.title} fill className="dp-panel__track-cover-img" />
                                            ) : (
                                                <div className="dp-panel__track-cover-fallback">
                                                    <Music2 size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="dp-panel__track-info">
                                            <span className="dp-panel__track-title">{s.title}</span>
                                            <span className="dp-panel__track-artist">{s.artist}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recent Posts */}
                    {posts.length > 0 && (
                        <section className="dp-panel__section">
                            <h3 className="dp-panel__section-title">
                                <FileText size={15} />
                                Recent Posts
                            </h3>
                            <div className="dp-panel__posts">
                                {posts.map((p) => (
                                    <div key={p.id} className="dp-panel__post">
                                        {p.spotifyCoverUrl && (
                                            <div className="dp-panel__post-cover">
                                                <Image
                                                    src={p.spotifyCoverUrl}
                                                    alt={p.spotifyName ?? 'track'}
                                                    fill
                                                    className="dp-panel__post-cover-img"
                                                />
                                            </div>
                                        )}
                                        <div className="dp-panel__post-info">
                                            {p.spotifyName && (
                                                <span className="dp-panel__post-track">{p.spotifyName}</span>
                                            )}
                                            <p className="dp-panel__post-content">{p.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty body state */}
                    {artists.length === 0 && tracks.length === 0 && streams.length === 0 && posts.length === 0 && (
                        <div className="dp-panel__body-empty">
                            <Music2 size={32} />
                            <p>No music data available yet</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DiscoveryProfilePanel;
