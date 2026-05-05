'use client';

import { useState, useEffect } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useIncomingRequests } from '@/hooks/Friendship/useIncomingRequests';
import { acceptRequest, rejectRequest } from '@/services/friendship/friendshipService';
import { fetchUserProfile } from '@/services/user/userService';
import FriendRequestItem from './FriendRequestItem/FriendRequestItem';
import FriendRequestHistoryItem from './FriendRequestHistoryItem/FriendRequestHistoryItem';
import './FriendRequestsTab.css';

const FriendRequestsTab = () => {
    const { pendingRequests, removeRequest } = useNotificationStore();
    const { history, isLoading, refresh } = useIncomingRequests();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchUserProfile()
            .then((u) => setCurrentUserId(u.id))
            .catch(() => {});
    }, []);

    const handleAccept = async (id: string) => {
        setProcessingId(id);
        try {
            await acceptRequest(id);
            removeRequest(id);
            await refresh();
        } catch {
            // noop
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        try {
            await rejectRequest(id);
            removeRequest(id);
            await refresh();
        } catch {
            // noop
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="friend-requests-tab">
            <div className="friend-requests-tab__section">
                <span className="friend-requests-tab__label">Requests</span>
                {isLoading && <div className="friend-requests-tab__empty">Loading...</div>}
                {!isLoading && pendingRequests.length === 0 && (
                    <div className="friend-requests-tab__empty">No pending requests</div>
                )}
                {pendingRequests.map((req) => (
                    <FriendRequestItem
                        key={req.id}
                        request={req}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        isProcessing={processingId === req.id}
                    />
                ))}
            </div>

            {history.length > 0 && currentUserId && (
                <div className="friend-requests-tab__section">
                    <span className="friend-requests-tab__label">History</span>
                    {history.map((item) => (
                        <FriendRequestHistoryItem
                            key={item.id}
                            item={item}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FriendRequestsTab;
