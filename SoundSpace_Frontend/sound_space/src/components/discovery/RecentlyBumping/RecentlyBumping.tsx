import React from 'react';
import Image from 'next/image';
import type { RecentlyBumpingProps } from '@/types/discovery';
import './RecentlyBumping.css';

export const RecentlyBumping = ({ recentlyBumping }: RecentlyBumpingProps) => {
    return (
        <div className="recently-bumping">
            <div className="recently-bumping__album">
                <Image
                    src={recentlyBumping.albumImageUrl}
                    alt={`${recentlyBumping.title} album art`}
                    width={48}
                    height={48}
                    className="recently-bumping__image"
                />
            </div>
            <div className="recently-bumping__info">
                <span className="recently-bumping__label">Recently Listen</span>
                <span className="recently-bumping__track">
                    {recentlyBumping.title} / {recentlyBumping.artist}
                </span>
            </div>
            {recentlyBumping.isPlaying && (
                <div className="recently-bumping__status">
                    <span className="recently-bumping__status-dot" />
                </div>
            )}
        </div>
    );
};

export default RecentlyBumping;