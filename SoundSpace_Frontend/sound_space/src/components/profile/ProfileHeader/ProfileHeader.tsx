"use client";

import { UserCheck, Calendar } from "lucide-react";
import type { ReactNode } from "react";
import "./ProfileHeader.css";

interface ProfileHeaderProps {
    name: string;
    isPremium?: boolean;
    followers: number;
    following: number;
    playlists: number;
    friends?: number;
    onFriendsClick?: () => void;
    events?: number;
    onEventsClick?: () => void;
    avatarUrl?: string;
    action?: ReactNode;
}

export const ProfileHeader = ({
    name,
    isPremium = false,
    followers,
    following,
    playlists,
    friends,
    onFriendsClick,
    events,
    onEventsClick,
    avatarUrl,
    action
}: ProfileHeaderProps) => {
    return (
        <div className="profile-header">
            <div className="profile-header__avatar-wrapper">
                <div className="profile-header__avatar-glow" />
                <div className="profile-header__avatar">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={name}
                            className="profile-header__avatar-img"
                        />
                    ) : (
                        <svg
                            viewBox="0 0 64 64"
                            className="profile-header__avatar-placeholder"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M16 52c0-8 6-14 16-14s16 6 16 14" strokeLinecap="round" />
                            <circle cx="32" cy="22" r="10" />
                            <path d="M20 18c0-8 5-14 12-14s12 6 12 14" strokeLinecap="round" />
                            <path d="M18 18 C18 18 14 20 14 18 C14 12 16 8 18 8" strokeLinecap="round" />
                            <path d="M46 18 C46 18 50 20 50 18 C50 12 48 8 46 8" strokeLinecap="round" />
                        </svg>
                    )}
                </div>
            </div>

            <div className="profile-header__info">
                {isPremium && (
                    <span className="profile-header__premium-badge">
                        <svg viewBox="0 0 16 16" className="profile-header__premium-icon" fill="currentColor">
                            <path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5z" />
                        </svg>
                        Premium
                    </span>
                )}
                <h1 className="profile-header__name">
                    {name}
                </h1>
                <div className="profile-header__stats">
                    {friends !== undefined && (
                        <button
                            className={`profile-header__stat profile-header__stat--btn${onFriendsClick ? ' profile-header__stat--clickable' : ''}`}
                            onClick={onFriendsClick}
                            disabled={!onFriendsClick}
                        >
                            <UserCheck className="profile-header__stat-icon" />
                            <strong className="profile-header__stat-value">{friends}</strong> friends
                        </button>
                    )}
                    {events !== undefined && (
                        <button
                            className={`profile-header__stat profile-header__stat--btn${onEventsClick ? ' profile-header__stat--clickable' : ''}`}
                            onClick={onEventsClick}
                            disabled={!onEventsClick}
                        >
                            <Calendar className="profile-header__stat-icon" />
                            <strong className="profile-header__stat-value">{events}</strong> events
                        </button>
                    )}
                </div>
                {action && <div className="profile-header__action">{action}</div>}
            </div>
        </div>
    );
};

export default ProfileHeader;
