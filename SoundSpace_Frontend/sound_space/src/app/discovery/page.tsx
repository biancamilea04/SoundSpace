"use client";

import { Suspense } from 'react';
import Header from '@/components/global/Header/Header';
import MenuSidebar from '@/components/global/MenuSidebar/MenuSidebar';
import FriendSidebar from '@/components/global/FriendSidebar/FriendSidebar';
import DiscoveryFeed from '@/components/discovery/DiscoveryFeed/DiscoveryFeed';
import { useDiscovery } from '@/hooks/discovery';
import './page.css';

function DiscoveryContent() {
    const {
        profiles,
        isLoading,
        isExhausted,
        isFeedCountryFallback,
        loadMore,
        handleConnect,
        handleSkip,
        handleExpand,
    } = useDiscovery();

    return (
        <div className="page-wrapper">
            <Header title="Discovery" />
            <div className="discovery-container">
                <MenuSidebar />
                <div className="discovery-main">
                    <DiscoveryFeed
                        profiles={profiles}
                        onConnect={handleConnect}
                        onSkip={handleSkip}
                        onExpand={handleExpand}
                        onLoadMore={loadMore}
                        isLoading={isLoading}
                        isCountryFallback={isFeedCountryFallback}
                        isExhausted={isExhausted}
                    />
                </div>
                <FriendSidebar />
            </div>
        </div>
    );
}

export default function DiscoveryPage() {
    return (
        <Suspense fallback={<div>Loading Discovery...</div>}>
            <DiscoveryContent />
        </Suspense>
    );
}
