'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DiscoveryUserProfile, FilterType } from '@/types/discovery';
import { updateUserLocation, fetchDiscoveryFeed } from '@/services/discovery/discoveryService';
import { sendFriendRequest } from '@/services/friendship/friendshipService';

interface UseDiscoveryReturn {
    activeFilter:          FilterType;
    profiles:              DiscoveryUserProfile[];
    isLoading:             boolean;
    locationDenied:        boolean;
    locationRequired:      boolean;
    isFeedCountryFallback: boolean;
    expandedProfile:       DiscoveryUserProfile | null;
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

    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

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

    const { data: rawProfiles = [], isLoading, error } = useQuery<DiscoveryUserProfile[], Error>({
        queryKey: ['discovery'],
        queryFn:  () => fetchDiscoveryFeed(1, 50),
        enabled:  locationReady,
        retry: false,
    });

    const locationRequired =
        locationDenied ||
        (error?.message?.toLowerCase().includes('location') ?? false);

    const isFeedCountryFallback = rawProfiles.some(p => p.isCountryFallback === true);

    const profiles = rawProfiles.filter((p) => {
        if (dismissed.has(p.id)) return false;
        if (activeFilter === 'genres')  return p.genres.length > 0;
        if (activeFilter === 'songs')   return p.commonSongsCount > 0;
        return true;
    });

    const handleFilterChange = useCallback((filter: FilterType) => {
        setActiveFilter(filter);
    }, []);

    const handleConnect = useCallback(async (profileId: string) => {
        try {
            await sendFriendRequest(profileId);
        } catch {
            // already friends or pending — still dismiss the card
        }
        setDismissed((prev) => new Set(prev).add(profileId));
    }, []);

    const handleSkip = useCallback((profileId: string) => {
        setDismissed((prev) => new Set(prev).add(profileId));
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
        locationDenied,
        locationRequired,
        isFeedCountryFallback,
        expandedProfile,
        handleFilterChange,
        handleConnect,
        handleSkip,
        handleExpand,
        handleClosePanel,
    };
};

export default useDiscovery;
