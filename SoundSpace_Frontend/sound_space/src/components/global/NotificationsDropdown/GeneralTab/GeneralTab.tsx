'use client';

import { useNotificationStore } from '@/stores/notificationStore';
import { markNotificationRead } from '@/services/notifications/notificationsService';

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

const GeneralTab = () => {
    const { generalNotifications, removeGeneralNotification } = useNotificationStore();

    const handleDismiss = async (id: string) => {
        removeGeneralNotification(id);
        await markNotificationRead(id).catch(() => {});
    };

    if (generalNotifications.length === 0) {
        return (
            <div className="general-tab">
                <p className="general-tab__empty">No new notifications</p>
            </div>
        );
    }

    return (
        <div className="general-tab">
            {generalNotifications.map((n) => (
                <div key={n.id} className="general-tab__item" onClick={() => handleDismiss(n.id)}>
                    <span className="general-tab__item-text">{n.text}</span>
                    <span className="general-tab__item-time">{relativeTime(n.createdAt)}</span>
                </div>
            ))}
        </div>
    );
};

export default GeneralTab;
