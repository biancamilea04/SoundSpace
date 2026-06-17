import React from 'react';
import Image from 'next/image';
import type { DiscoveryCardProps } from '@/types/discovery';
import UserInfo from '../UserInfo/UserInfo';
import GenrePills from '../GenrePills/GenrePills';
import CommonSongs from '../CommonSongs/CommonSongs';
import RecentlyBumping from '../RecentlyBumping/RecentlyBumping';
import ActionButtons from '../ActionButtons/ActionButtons';
import './DiscoveryCard.css';

export const DiscoveryCard = ({ profile, onConnect, onSkip }: DiscoveryCardProps) => {
    const {
        id,
        name,
        handle,
        imageUrl,
        tagline,
        genres,
        commonSongsCount,
        commonSongs,
        recentlyBumping,
    } = profile;

    const handleConnect = () => {
        onConnect?.(id);
    };

    const handleSkip = () => {
        onSkip?.(id);
    };

    return (
        <article className="discovery-card">
            {/* Background Image with Neon Effect */}
            <div className="discovery-card__background">
                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={`${name}'s profile`}
                        fill
                        className="discovery-card__background-image"
                        priority
                    />
                )}
                <div className="discovery-card__neon-overlay" />
                <div className="discovery-card__gradient-overlay" />
            </div>

            {/* Content Overlay */}
            <div className="discovery-card__content">
                <UserInfo
                    name={name}
                    handle={handle}
                    tagline={tagline}
                />

                <GenrePills genres={genres} />

                <CommonSongs
                    commonSongsCount={commonSongsCount}
                    commonSongs={commonSongs}
                />

                {recentlyBumping && (
                    <RecentlyBumping recentlyBumping={recentlyBumping} />
                )}
            </div>
        </article>
    );
};

export default DiscoveryCard;
