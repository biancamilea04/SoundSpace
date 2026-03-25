import React from 'react';
import DiscoveryCard from '../DiscoveryCard/DiscoveryCard';
import type { DiscoveryFeedProps } from '@/types/discovery';
import './DiscoveryFeed.css';

export const DiscoveryFeed = ({
    profiles,
    onConnect,
    onSkip,
    isLoading = false
}: DiscoveryFeedProps) => {
    if (isLoading) {
        return (
            <div className="discovery-feed">
                <div className="discovery-feed__loading">
                    <div className="discovery-feed__loading-spinner" />
                    <span>Finding your music matches...</span>
                </div>
            </div>
        );
    }

    if (profiles.length === 0) {
        return (
            <div className="discovery-feed">
                <div className="discovery-feed__empty">
                    <span className="discovery-feed__empty-icon">🎵</span>
                    <h3>No more profiles</h3>
                    <p>Check back later for new music connections!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="discovery-feed">
            <div className="discovery-feed__scroll-container">
                {profiles.map((profile) => (
                    <div key={profile.id} className="discovery-feed__card-wrapper">
                        <DiscoveryCard
                            profile={profile}
                            onConnect={onConnect}
                            onSkip={onSkip}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiscoveryFeed;
