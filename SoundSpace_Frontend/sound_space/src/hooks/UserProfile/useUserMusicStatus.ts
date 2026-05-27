"use client";

import { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { fetchUserMusicStatus } from '@/services/user/userService';
import { getAccessTokenCookie } from '@/services/auth/authService';
import type { UserMusicStatus } from '@/types/user';
import type { UserStatusChangedPayload } from '@/types/friendActivity';

const HUB_URL = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://localhost:7050'}/hubs/presence`;

export function useUserMusicStatus(username: string | undefined) {
    const [status, setStatus] = useState<UserMusicStatus | null>(null);
    const userIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!username) return;

        let cancelled = false;

        fetchUserMusicStatus(username).then(data => {
            if (cancelled) return;
            if (data) {
                userIdRef.current = data.userId;
                setStatus(data);
            }
        });

        const token = getAccessTokenCookie();
        if (!token) return;

        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, { accessTokenFactory: () => getAccessTokenCookie() ?? '' })
            .withAutomaticReconnect()
            .build();

        connection.on('UserStatusChanged', (payload: UserStatusChangedPayload) => {
            if (!userIdRef.current || payload.userId !== userIdRef.current) return;
            setStatus(prev => prev ? {
                ...prev,
                isListening: payload.isListening,
                currentlyPlayingTitle: payload.currentlyPlayingTitle,
                currentlyPlayingArtist: payload.currentlyPlayingArtist,
                currentlyPlayingArtistUrl: payload.currentlyPlayingArtistUrl,
                currentlyPlayingCoverUrl: payload.currentlyPlayingCoverUrl,
                currentlyPlayingUri: payload.currentlyPlayingUri,
                currentlyPlayingProgressMs: payload.currentlyPlayingProgressMs,
            } : null);
        });

        connection.start().catch(() => {});

        return () => {
            cancelled = true;
            connection.stop();
        };
    }, [username]);

    return status;
}
