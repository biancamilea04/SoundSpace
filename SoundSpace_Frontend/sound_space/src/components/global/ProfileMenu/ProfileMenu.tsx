import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './ProfileMenu.css';
import {logoutUser} from "@/services/auth/authService";

interface HeaderProfileMenuProps {
    userName: string;
    currentSong: string;
    avatarSrc: string;
    profileHref?: string;
    settingsHref?: string;
}

const ProfileMenu = ({
    userName,
    currentSong,
    avatarSrc,
    profileHref = '/profile',
    settingsHref = '/settings',
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
                    <span className="profile-song">{currentSong}</span>
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
                        href={settingsHref}
                        className="profile-dropdown-item"
                        role="menuitem"
                        onClick={handleCloseProfileMenu}
                    >
                        Settings
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
