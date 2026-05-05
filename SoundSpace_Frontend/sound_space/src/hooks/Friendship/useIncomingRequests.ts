'use client';

import { useState, useCallback, useEffect } from 'react';
import { getIncomingRequests, getRequestHistory } from '@/services/friendship/friendshipService';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Friendship } from '@/types/friendship';

export function useIncomingRequests() {
    const { setPendingRequests } = useNotificationStore();
    const [history, setHistory] = useState<Friendship[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const [incoming, hist] = await Promise.all([
                getIncomingRequests(),
                getRequestHistory(),
            ]);
            setPendingRequests(incoming);
            setHistory(hist);
        } catch {
            // silently fail — store keeps previous state
        } finally {
            setIsLoading(false);
        }
    }, [setPendingRequests]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { history, isLoading, refresh };
}
