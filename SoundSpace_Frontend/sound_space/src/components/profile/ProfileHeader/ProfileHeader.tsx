"use client";

import { Users, Heart, Music, Mail, Globe } from "lucide-react";
import "./ProfileHeader.css";

interface ProfileHeaderProps {
    name: string;
    isPremium?: boolean;
    followers: number;
    following: number;
    playlists: number;
    avatarUrl?: string;
    email?: string;
    country?: string;
}

export const ProfileHeader = ({
    name,
    isPremium = false,
    followers,
    following,
    playlists,
    avatarUrl,
    email,
    country,
}: ProfileHeaderProps) => {
    return (
        <div className="profile-header">
            {/* Avatar */}
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

            {/* Info */}
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
                    <span className="profile-header__stat">
                        <Users className="profile-header__stat-icon" />
                        <strong className="profile-header__stat-value">{followers.toLocaleString()}</strong> followers
                    </span>
                    <span className="profile-header__stat">
                        <Heart className="profile-header__stat-icon" />
                        <strong className="profile-header__stat-value">{following.toLocaleString()}</strong> following
                    </span>
                    <span className="profile-header__stat">
                        <Music className="profile-header__stat-icon" />
                        <strong className="profile-header__stat-value">{playlists}</strong> playlists
                    </span>
                </div>

                {/* Email & Country */}
                <div className="profile-header__details">
                    {email && (
                        <span className="profile-header__detail">
                            <Mail className="profile-header__detail-icon" />
                            <span className="profile-header__detail-value">{email}</span>
                        </span>
                    )}
                    {country && (
                        <span className="profile-header__detail">
                            <Globe className="profile-header__detail-icon" />
                            <span className="profile-header__detail-value">{country}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
