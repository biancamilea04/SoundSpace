'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFriendsList, removeFriend } from '@/services/friendship/friendshipService';
import type { FriendListItem } from '@/types/friendship';

export function useFriendsList(profileUserId: string | undefined) {
    const [friends, setFriends] = useState<FriendListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFriends = useCallback(async () => {
        if (!profileUserId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getFriendsList(profileUserId);
            setFriends(data);
        } catch {
            setError('Failed to load friends');
        } finally {
            setIsLoading(false);
        }
    }, [profileUserId]);

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    const remove = useCallback(async (targetUserId: string) => {
        await removeFriend(targetUserId);
        setFriends(prev => prev.filter(f => f.userId !== targetUserId));
    }, []);

    return { friends, isLoading, error, refresh: fetchFriends, remove };
}
