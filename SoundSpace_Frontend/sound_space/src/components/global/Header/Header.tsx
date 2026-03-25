"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './Header.css';

interface HeaderProps {
    title: string;
}

const Header = ({ title }: HeaderProps) => {
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
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    return (
        <header className="main-header">
            <Link href="/" className="main-header__left">
                <Image
                    src="/icons/SoundSpaceIcon.png"
                    alt="SoundSpace Logo"
                    width={36}
                    height={36}
                    className="main-header__logo"
                />
                <span className="main-header__title">SoundSpace</span>
            </Link> 
            
            <div className="main-header__center">
                <div className="main-header__search">
                    <svg className="main-header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        className="main-header__search-input" 
                        placeholder="Search" 
                    />
                </div>
            </div>

            <div className="main-header__right">
                <div className="main-header__profile-menu" ref={profileMenuRef}>
                    <button
                        type="button"
                        className="main-header__profile"
                        aria-label="Open profile menu"
                        aria-haspopup="menu"
                        aria-expanded={showProfileMenu}
                        onClick={handleToggleProfileMenu}
                    >
                        <div className="main-header__profile-avatar-wrap">
                            <Image
                                src="/icons/SoundSpaceIcon.png"
                                alt="User avatar"
                                width={36}
                                height={36}
                                className="main-header__profile-avatar"
                            />
                        </div>
                        <div className="main-header__profile-info">
                            <span className="main-header__profile-name">test</span>
                            <span className="main-header__profile-song">test</span>
                        </div>
                    </button>

                    {showProfileMenu && (
                        <div className="main-header__profile-dropdown" role="menu" aria-label="Profile options">
                            <Link href="/profile" className="main-header__profile-dropdown-item" role="menuitem" onClick={handleCloseProfileMenu}>
                                Profile
                            </Link>
                            <Link href="/settings" className="main-header__profile-dropdown-item" role="menuitem" onClick={handleCloseProfileMenu}>
                                Settings
                            </Link>
                            <button
                                type="button"
                                className="main-header__profile-dropdown-item main-header__profile-dropdown-item--danger"
                                role="menuitem"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
