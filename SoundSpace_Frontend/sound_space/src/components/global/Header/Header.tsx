"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import './Header.css';
import HeaderBrand from './HeaderBrand/HeaderBrand';
import HeaderSearch from '@/components/global/Header/HeaderSearch/HeaderSearch';
import NotificationsDropdown from '@/components/global/NotificationsDropdown/NotificationsDropdown';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNotificationHub } from '@/hooks/Friendship/useNotificationHub';
import { useIncomingRequests } from '@/hooks/Friendship/useIncomingRequests';

interface HeaderProps {
    title: string;
}

const Header = ({ title }: HeaderProps) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const pendingCount = useNotificationStore((s) => s.pendingRequests.length);

    useNotificationHub();
    useIncomingRequests();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="main-header" aria-label={title}>
            <HeaderBrand
                href="/"
                logoSrc="/icons/SoundSpaceIcon.png"
                logoAlt="SoundSpace Logo"
                titleText="SoundSpace"
            />

            <HeaderSearch placeholder="Search users..." />

            <div className="header-actions">
                <div className="header-notif-wrapper" ref={notifRef}>
                    <button
                        className="header-notif-btn"
                        onClick={() => setShowNotifications((prev) => !prev)}
                        aria-label="Notifications"
                        aria-expanded={showNotifications}
                    >
                        <Bell size={20} />
                        {pendingCount > 0 && (
                            <span className="header-notif-badge">
                                {pendingCount > 9 ? '9+' : pendingCount}
                            </span>
                        )}
                    </button>
                    {showNotifications && <NotificationsDropdown />}
                </div>
            </div>
        </header>
    );
};

export default Header;
