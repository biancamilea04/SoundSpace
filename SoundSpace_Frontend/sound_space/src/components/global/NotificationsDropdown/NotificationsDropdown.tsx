'use client';

import { useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import GeneralTab from './GeneralTab/GeneralTab';
import FriendRequestsTab from './FriendRequestsTab/FriendRequestsTab';
import './NotificationsDropdown.css';

type Tab = 'General' | 'Friend Requests';

const NotificationsDropdown = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Friend Requests');
    const pendingCount = useNotificationStore((s) => s.pendingRequests.length);

    return (
        <div className="notifications-dropdown" role="dialog" aria-label="Notifications">
            <div className="notifications-dropdown__header">
                <span className="notifications-dropdown__title">Notifications</span>
            </div>

            <div className="notifications-dropdown__tabs" role="tablist">
                {(['General', 'Friend Requests'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        className={`notifications-dropdown__tab ${activeTab === tab ? 'notifications-dropdown__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                        {tab === 'Friend Requests' && pendingCount > 0 && (
                            <span className="notifications-dropdown__tab-badge">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="notifications-dropdown__content">
                {activeTab === 'General' && <GeneralTab />}
                {activeTab === 'Friend Requests' && <FriendRequestsTab />}
            </div>
        </div>
    );
};

export default NotificationsDropdown;
