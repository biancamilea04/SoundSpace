'use client';

import { useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import NotificationsDropdown from '@/components/global/NotificationsDropdown/NotificationsDropdown';
import './NotificationBell.css';

interface NotificationBellProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

const NotificationBell = ({ isOpen, onToggle, onClose }: NotificationBellProps) => {
    const pendingCount = useNotificationStore().pendingRequests.length;
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className="notification-bell" ref={wrapperRef}>
            <button
                className="notification-bell__btn"
                onClick={onToggle}
                aria-label="Notifications"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Bell size={20} />
                {pendingCount > 0 && (
                    <span className="notification-bell__badge">
                        {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                )}
            </button>

            {isOpen && <NotificationsDropdown />}
        </div>
    );
};

export default NotificationBell;
