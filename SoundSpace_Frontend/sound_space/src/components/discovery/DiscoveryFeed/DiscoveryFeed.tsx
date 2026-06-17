import React from 'react';
import { Music2 } from 'lucide-react';
import DiscoveryCard from '../DiscoveryCard/DiscoveryCard';
import DiscoveryProfilePanel from '../DiscoveryProfilePanel/DiscoveryProfilePanel';
import type { DiscoveryFeedProps, DiscoveryUserProfile } from '@/types/discovery';
import './DiscoveryFeed.css';

export const DiscoveryFeed = ({
    profiles,
    onConnect,
    onSkip,
    onExpand,
    isLoading = false,
    isCountryFallback = false,
}: DiscoveryFeedProps) => {
    const [panelProfile, setPanelProfile] = React.useState<DiscoveryUserProfile | null>(null);

    const handleExpand = (profile: DiscoveryUserProfile) => {
        onExpand?.(profile);
        setPanelProfile(profile);
    };

    const handleClosePanel = () => setPanelProfile(null);

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
                <div className="discovery-feed__scroll-container">
                    {profiles.map((profile) => (
                        <div key={profile.id} className="discovery-feed__card-wrapper">
                            <DiscoveryCard
                                profile={profile}
                                onConnect={onConnect}
                                onSkip={onSkip}
                                onExpand={handleExpand}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {panelProfile && (
                <DiscoveryProfilePanel
                    profile={panelProfile}
                    onClose={handleClosePanel}
                />
            )}
        </>
    );
};

export default DiscoveryFeed;
