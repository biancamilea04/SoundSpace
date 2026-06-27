'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DiscoveryUserProfile, FilterType } from '@/types/discovery';
import { updateUserLocation, fetchDiscoveryBatch } from '@/services/discovery/discoveryService';
import { sendFriendRequest } from '@/services/friendship/friendshipService';

interface UseDiscoveryReturn {
    activeFilter:          FilterType;
    profiles:              DiscoveryUserProfile[];
    isLoading:             boolean;
    isExhausted:           boolean;
    locationDenied:        boolean;
    locationRequired:      boolean;
    isFeedCountryFallback: boolean;
    expandedProfile:       DiscoveryUserProfile | null;
    loadMore:              () => void;
    handleFilterChange:    (filter: FilterType) => void;
    handleConnect:         (profileId: string) => void;
    handleSkip:            (profileId: string) => void;
    handleExpand:          (profile: DiscoveryUserProfile) => void;
    handleClosePanel:      () => void;
}

export const useDiscovery = (): UseDiscoveryReturn => {
    const [activeFilter,    setActiveFilter]    = useState<FilterType>('all');
    const [locationReady,   setLocationReady]   = useState(false);
    const [locationDenied,  setLocationDenied]  = useState(false);
    const [expandedProfile, setExpandedProfile] = useState<DiscoveryUserProfile | null>(null);

    const [discoveryCards, setDiscoveryCards] = useState<DiscoveryUserProfile[]>([]);
    const [isLoading,      setIsLoading]      = useState(false);
    const [isExhausted,    setIsExhausted]    = useState(false);

    const isFetchingRef    = useRef(false);
    const discoveryCardsRef = useRef<DiscoveryUserProfile[]>([]);

    useEffect(() => {
        discoveryCardsRef.current = discoveryCards;
    }, [discoveryCards]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationDenied(true);
            setLocationReady(true);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    await updateUserLocation(pos.coords.latitude, pos.coords.longitude);
                } catch {
                }
                setLocationReady(true);
            },
            () => {
                setLocationDenied(true);
                setLocationReady(true);
            },
            { timeout: 8000 },
        );
    }, []);

    const loadNextBatch = useCallback(async (seenIds: string[]) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setIsLoading(true);
        console.log('[Discovery] fetchDiscoveryBatch → seenIds:', seenIds.length, 'ids');
        try {
            const newCards = await fetchDiscoveryBatch(seenIds, 10);
            console.log('[Discovery] batch received:', newCards.length, 'cards');
            newCards.forEach(c => console.log(`  • ${c.name} | matchType=${c.matchType} | score=${c.matchPercentage}`));
            if (newCards.length === 0) {
                setIsExhausted(true);
            } else {
                setDiscoveryCards(prev => [...prev, ...newCards]);
            }
        } catch (e) {
            console.error('[Discovery] fetchDiscoveryBatch failed:', e);
        } finally {
            isFetchingRef.current = false;
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!locationReady) return;
        loadNextBatch([]);
    }, [locationReady, loadNextBatch]);

    const loadMore = useCallback(() => {
        if (isFetchingRef.current || isExhausted) return;
        const seenIds = discoveryCardsRef.current.map(c => c.id);
        loadNextBatch(seenIds);
    }, [isExhausted, loadNextBatch]);

    const locationRequired = locationDenied;

    const isFeedCountryFallback = discoveryCards.some(p => p.isCountryFallback === true);

    const profiles = discoveryCards.filter((p) => {
        if (activeFilter === 'genres') return p.genres.length > 0;
        if (activeFilter === 'songs')  return p.commonSongsCount > 0;
        return true;
    });

    const handleFilterChange = useCallback((filter: FilterType) => {
        setActiveFilter(filter);
    }, []);

    const handleConnect = useCallback(async (profileId: string) => {
        try {
            await sendFriendRequest(profileId);
        } catch {
        }
    }, []);

    const handleSkip = useCallback((_profileId: string) => {
    }, []);

    const handleExpand = useCallback((profile: DiscoveryUserProfile) => {
        setExpandedProfile(profile);
    }, []);

    const handleClosePanel = useCallback(() => {
        setExpandedProfile(null);
    }, []);

    return {
        activeFilter,
        profiles,
        isLoading: isLoading || !locationReady,
        isExhausted,
        locationDenied,
        locationRequired,
        isFeedCountryFallback,
        expandedProfile,
        loadMore,
        handleFilterChange,
        handleConnect,
        handleSkip,
        handleExpand,
        handleClosePanel,
    };
};

export default useDiscovery;
