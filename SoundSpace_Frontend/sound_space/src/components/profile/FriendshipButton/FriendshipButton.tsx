'use client';

import { useState } from 'react';
import { UserPlus, UserCheck, Clock, Check, X } from 'lucide-react';
import { sendFriendRequest, acceptRequest, rejectRequest } from '@/services/friendship/friendshipService';
import { useFriendshipStatus } from '@/hooks/Friendship/useFriendshipStatus';
import './FriendshipButton.css';

interface FriendshipButtonProps {
    currentUserId: string;
    profileUserId: string;
}

export const FriendshipButton = ({ currentUserId, profileUserId }: FriendshipButtonProps) => {
    const { friendship, setFriendship, isLoading } = useFriendshipStatus(profileUserId);
    const [isPending, setIsPending] = useState(false);

    if (currentUserId === profileUserId) return null;

    const handleSendRequest = async () => {
        setIsPending(true);
        try {
            const result = await sendFriendRequest(profileUserId);
            setFriendship(result);
        } catch {
        } finally {
            setIsPending(false);
        }
    };

    const handleAccept = async () => {
        if (!friendship) return;
        setIsPending(true);
        try {
            const result = await acceptRequest(friendship.id);
            setFriendship(result);
        } catch {
        } finally {
            setIsPending(false);
        }
    };

    const handleReject = async () => {
        if (!friendship) return;
        setIsPending(true);
        try {
            const result = await rejectRequest(friendship.id);
            setFriendship(result);
        } catch {
        } finally {
            setIsPending(false);
        }
    };

    if (isLoading) {
        return <div className="friendship-btn__skeleton" />;
    }

    if (!friendship || friendship.status === 'Rejected') {
        return (
            <button
                className="friendship-btn friendship-btn--add"
                onClick={handleSendRequest}
                disabled={isPending}
            >
                <UserPlus size={16} />
                Add Friend
            </button>
        );
    }

    if (friendship.status === 'Accepted') {
        return (
            <div className="friendship-btn friendship-btn--friends">
                <UserCheck size={16} />
                Friends
            </div>
        );
    }

    if (friendship.status === 'Pending') {
        if (friendship.senderId === currentUserId) {
            return (
                <div className="friendship-btn friendship-btn--sent">
                    <Clock size={16} />
                    Request Sent
                </div>
            );
        }

        return (
            <div className="friendship-btn-group">
                <button
                    className="friendship-btn friendship-btn--accept"
                    onClick={handleAccept}
                    disabled={isPending}
                >
                    <Check size={16} />
                    Accept
                </button>
                <button
                    className="friendship-btn friendship-btn--reject"
                    onClick={handleReject}
                    disabled={isPending}
                >
                    <X size={16} />
                    Decline
                </button>
            </div>
        );
    }

    return null;
};
