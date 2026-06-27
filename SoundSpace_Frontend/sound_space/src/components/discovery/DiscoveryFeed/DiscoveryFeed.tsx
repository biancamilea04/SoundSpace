import React, { useRef, useCallback } from 'react';
import { Music2 } from 'lucide-react';
import DiscoveryCard from '../DiscoveryCard/DiscoveryCard';
import DiscoveryUserModal from '../DiscoveryUserModal/DiscoveryUserModal';
import type { DiscoveryFeedProps, DiscoveryUserProfile } from '@/types/discovery';
import './DiscoveryFeed.css';

export const DiscoveryFeed = ({
    profiles,
    onConnect,
    onSkip,
    onExpand,
    onLoadMore,
    isLoading = false,
    isCountryFallback = false,
    isExhausted = false,
}: DiscoveryFeedProps) => {
    const [panelProfile, setPanelProfile] = React.useState<DiscoveryUserProfile | null>(null);
    const scrollContainerRef  = useRef<HTMLDivElement>(null);
    const lastCardObserverRef = useRef<IntersectionObserver | null>(null);

    const lastCardRef = useCallback((node: HTMLDivElement | null) => {
        if (lastCardObserverRef.current) {
            lastCardObserverRef.current.disconnect();
            lastCardObserverRef.current = null;
        }
        if (!node || !onLoadMore || isExhausted) return;

        lastCardObserverRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) onLoadMore();
            },
            { root: scrollContainerRef.current, threshold: 0.5 },
        );
        lastCardObserverRef.current.observe(node);
    }, [onLoadMore, isExhausted]);

    const handleExpand = (profile: DiscoveryUserProfile) => {
        onExpand?.(profile);
        setPanelProfile(profile);
    };

    const handleClosePanel = () => setPanelProfile(null);

    if (isLoading && profiles.length === 0) {
        return (
            <div className="discovery-feed">
                <div className="discovery-feed__loading">
                    <div className="discovery-feed__loading-spinner" />
                    <span>Finding your music matches...</span>
                </div>
            </div>
        );
    }

    if (profiles.length === 0 && isExhausted) {
        return (
            <div className="discovery-feed">
                <div className="discovery-feed__empty">
                    <div className="discovery-feed__empty-icon">
                        <Music2 size={40} />
                    </div>
                    <h3>No more users to discover</h3>
                    <p>{"You've seen everyone for now. Check back later for new music connections!"}</p>
                </div>
            </div>
        );
    }

    if (profiles.length === 0) {
        return (
            <div className="discovery-feed">
                <div className="discovery-feed__empty">
                    <div className="discovery-feed__empty-icon">
                        <Music2 size={40} />
                    </div>
                    <h3>No more profiles</h3>
                    <p>
                        {isCountryFallback
                            ? 'No music matches found in your area. Check back later!'
                            : 'Check back later for new music connections!'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="discovery-feed">
                <div className="discovery-feed__scroll-container" ref={scrollContainerRef}>
                    {profiles.map((profile, index) => (
                        <div
                            key={profile.id}
                            className="discovery-feed__card-wrapper"
                            ref={index === profiles.length - 1 ? lastCardRef : undefined}
                        >
                            <DiscoveryCard
                                profile={profile}
                                onConnect={onConnect}
                                onSkip={onSkip}
                                onExpand={handleExpand}
                            />
                        </div>
                    ))}

                    {isLoading && (
                        <div className="discovery-feed__load-more-spinner">
                            <div className="discovery-feed__loading-spinner" />
                        </div>
                    )}

                    {isExhausted && (
                        <div className="discovery-feed__exhausted">
                            <Music2 size={24} />
                            <span>{"You've seen everyone for now!"}</span>
                        </div>
                    )}
                </div>
            </div>

            {panelProfile && (
                <DiscoveryUserModal
                    profile={panelProfile}
                    onClose={handleClosePanel}
                />
            )}
        </>
    );
};

export default DiscoveryFeed;
