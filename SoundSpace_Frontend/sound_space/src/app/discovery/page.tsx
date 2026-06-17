"use client";

import React, { Suspense } from 'react';
import Header from '@/components/global/Header/Header';
import MenuSidebar from '@/components/global/MenuSidebar/MenuSidebar';
import FriendSidebar from '@/components/global/FriendSidebar/FriendSidebar';
import DiscoveryFeed from '@/components/discovery/DiscoveryFeed/DiscoveryFeed';
import FilterButtons from '@/components/discovery/FilterButtons/FilterButtons';
import { useDiscovery } from '@/hooks/discovery';
import './page.css';

function DiscoveryContent() {
    const {
        activeFilter,
        profiles,
        isLoading,
        locationDenied,
        isFeedCountryFallback,
        handleFilterChange,
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
                        isLoading={isLoading}
                        isCountryFallback={isFeedCountryFallback}
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
