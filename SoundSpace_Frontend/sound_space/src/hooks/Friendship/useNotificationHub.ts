'use client';

import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { getAccessTokenCookie } from '@/services/auth/authService';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Friendship } from '@/types/friendship';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://localhost:7050';
const HUB_URL = `${BACKEND_URL}/hubs/presence`;

export function useNotificationHub() {
    const { addRequest, removeRequest } = useNotificationStore();
    const connectionRef = useRef<HubConnection | null>(null);

    useEffect(() => {
        const token = getAccessTokenCookie();
        if (!token) return;

        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, { accessTokenFactory: () => getAccessTokenCookie() ?? '' })
            .withAutomaticReconnect()
            .build();

        connection.on('FriendRequestReceived', (request: Friendship) => {
            addRequest(request);
        });

        connection.on('FriendRequestAccepted', (requestId: string) => {
            removeRequest(requestId);
        });

        let disposed = false;
        const startPromise = connection.start().catch(() => {});
        connectionRef.current = connection;

        return () => {
            disposed = true;
            void startPromise.then(() => {
                if (disposed) connection.stop().catch(() => {});
            });
        };
    }, [addRequest, removeRequest]);
}
