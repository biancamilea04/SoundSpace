'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getFriendshipStatus } from '@/services/friendship/friendshipService';
import type { Friendship } from '@/types/friendship';

export function useFriendshipStatus(targetUserId: string | null) {
    const [friendship, setFriendship] = useState<Friendship | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const hasFetched = useRef(false);

    const refresh = useCallback(async () => {
        if (!targetUserId) return;
        setIsLoading(true);
        try {
            const result = await getFriendshipStatus(targetUserId);
            setFriendship(result);
        } catch {
            setFriendship(null);
        } finally {
            setIsLoading(false);
        }
    }, [targetUserId]);

    useEffect(() => {
        if (!targetUserId || hasFetched.current) return;
        hasFetched.current = true;
        refresh();
    }, [targetUserId, refresh]);

    return { friendship, setFriendship, isLoading, refresh };
}
