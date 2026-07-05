import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './ProfileMenu.css';
import {logoutUser} from "@/services/auth/authService";

interface HeaderProfileMenuProps {
    userName: string;
    currentSong?: string;
    avatarSrc: string;
    profileHref?: string;
    eventsHref?: string;
    likedPostsHref?: string;
}

const ProfileMenu = ({
    userName,
    avatarSrc,
    profileHref = '/profile',
    eventsHref = '/events/my-events',
    likedPostsHref = '/liked-posts',
}: HeaderProfileMenuProps) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggleProfileMenu = () => {
        setShowProfileMenu((prev) => !prev);
    };

    const handleCloseProfileMenu = () => {
        setShowProfileMenu(false);
    };

    const handleLogout = () => {
        setShowProfileMenu(false);
        logoutUser().then(r => {});
    };

    return (
        <div className="profile-menu"
             ref={profileMenuRef}
             onClick={handleToggleProfileMenu}
        >
            <button
                type="button"
                className="profile"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
            >
                <div className="profile-avatar-wrap">
                    <Image
                        src={avatarSrc}
                        alt="User avatar"
                        width={36}
                        height={36}
                        className="profile-avatar"
                    />
                </div>
                <div className="profile-info">
                    <span className="profile-name">{userName}</span>
                </div>
            </button>

            {showProfileMenu && (
                <div className="profile-dropdown" role="menu" aria-label="Profile options">
                    <Link
                        href={profileHref}
                        className="profile-dropdown-item"
                        role="menuitem"
                        onClick={handleCloseProfileMenu}
                    >
                        Profile
                    </Link>
                    <Link
                        href={likedPostsHref}
                        className="profile-dropdown-item"
                        role="menuitem"
                        onClick={handleCloseProfileMenu}
                    >
                        Liked Posts
                    </Link>
                    <Link
                        href={eventsHref}
                        className="profile-dropdown-item"
                        role="menuitem"
                        onClick={handleCloseProfileMenu}
                    >
                        My Events
                    </Link>
                    <button
                        type="button"
                        className="profile-dropdown-item profile-dropdown-item--danger"
                        role="menuitem"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileMenu;
