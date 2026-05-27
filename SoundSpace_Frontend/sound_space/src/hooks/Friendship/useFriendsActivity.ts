"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { getFriendsActivity } from '@/services/friendship/friendshipService';
import { listenAlong as listenAlongApi, type ListenAlongCode } from '@/services/music/musicService';
import { getAccessTokenCookie } from '@/services/auth/authService';
import type { FriendActivity, UserStatusChangedPayload } from '@/types/friendActivity';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://localhost:7050';
const HUB_URL = `${BACKEND_URL}/hubs/presence`;

function getErrorMessage(code: ListenAlongCode): string {
    switch (code) {
        case 'no_device': return 'Please open Spotify on any device to start listening.';
        case 'no_premium': return 'Spotify Premium is required for Listen Along.';
        case 'not_listening': return 'Your friend is no longer listening.';
        default: return 'Failed to start Listen Along. Please try again.';
    }
}

export function useFriendsActivity() {
    const [friends, setFriends] = useState<FriendActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [listenAlongFriendId, setListenAlongFriendId] = useState<string | null>(null);
    const [listenAlongError, setListenAlongError] = useState<string | null>(null);
    const connectionRef = useRef<HubConnection | null>(null);
    const listenAlongRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        getFriendsActivity()
            .then(data => {
                if (!cancelled) {
                    setFriends(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });

        const token = getAccessTokenCookie();
        if (!token) return;

        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, { accessTokenFactory: () => getAccessTokenCookie() ?? '' })
            .withAutomaticReconnect()
            .build();

        connection.on('FriendOnlineStatusChanged', (payload: { userId: string; isOnline: boolean }) => {
            setFriends(prev =>
                prev.map(f =>
                    f.userId === payload.userId
                        ? { ...f, isOnline: payload.isOnline }
                        : f
                )
            );

            if (!payload.isOnline && listenAlongRef.current === payload.userId) {
                listenAlongRef.current = null;
                setListenAlongFriendId(null);
                setListenAlongError('Your host went offline. Listen Along ended.');
            }
        });

        connection.on('UserStatusChanged', async (payload: UserStatusChangedPayload) => {
            setFriends(prev =>
                prev.map(f =>
                    f.userId === payload.userId
                        ? {
                            ...f,
                            isListening: payload.isListening,
                            currentlyPlayingTitle: payload.currentlyPlayingTitle,
                            currentlyPlayingArtist: payload.currentlyPlayingArtist,
                            currentlyPlayingArtistUrl: payload.currentlyPlayingArtistUrl,
                            currentlyPlayingCoverUrl: payload.currentlyPlayingCoverUrl,
                            currentlyPlayingUri: payload.currentlyPlayingUri,
                            currentlyPlayingProgressMs: payload.currentlyPlayingProgressMs,
                            lastPlayedTitle: payload.lastPlayedTitle ?? f.lastPlayedTitle,
                            lastPlayedArtist: payload.lastPlayedArtist ?? f.lastPlayedArtist,
                            lastPlayedArtistUrl: payload.lastPlayedArtistUrl ?? f.lastPlayedArtistUrl,
                            lastPlayedUri: payload.lastPlayedUri ?? f.lastPlayedUri,
                            lastPlayedCoverUrl: payload.lastPlayedCoverUrl ?? f.lastPlayedCoverUrl,
                            musicStatusUpdatedAt: payload.musicStatusUpdatedAt ?? f.musicStatusUpdatedAt,
                          }
                        : f
                )
            );

            const followedId = listenAlongRef.current;
            if (followedId && payload.userId === followedId) {
                if (payload.isListening && payload.currentlyPlayingUri) {
                    const code = await listenAlongApi(followedId);
                    if (code !== 'ok') {
                        listenAlongRef.current = null;
                        setListenAlongFriendId(null);
                        setListenAlongError(getErrorMessage(code));
                    }
                } else {
                    listenAlongRef.current = null;
                    setListenAlongFriendId(null);
                    setListenAlongError('Your host stopped listening. Listen Along ended.');
                }
            }
        });

        let disposed = false;
        const startPromise = connection.start().catch(() => {});
        connectionRef.current = connection;

        return () => {
            cancelled = true;
            disposed = true;
            void startPromise.then(() => {
                if (disposed) connection.stop().catch(() => {});
            });
        };
    }, []);

    const startListenAlong = useCallback(async (friendId: string): Promise<void> => {
        const code = await listenAlongApi(friendId);
        if (code === 'ok') {
            listenAlongRef.current = friendId;
            setListenAlongFriendId(friendId);
            setListenAlongError(null);
        } else {
            setListenAlongError(getErrorMessage(code));
        }
    }, []);

    const stopListenAlong = useCallback(() => {
        listenAlongRef.current = null;
        setListenAlongFriendId(null);
        setListenAlongError(null);
    }, []);

    const sorted = [...friends].sort((a, b) => {
        const score = (f: FriendActivity) =>
            f.isOnline && f.isListening ? 2 : f.isOnline ? 1 : 0;
        return score(b) - score(a);
    });

    return { friends: sorted, loading, listenAlongFriendId, listenAlongError, startListenAlong, stopListenAlong };
}
