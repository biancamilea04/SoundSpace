'use client';

import type { Friendship } from '@/types/friendship';
import './FriendRequestHistoryItem.css';

interface FriendRequestHistoryItemProps {
    item: Friendship;
    currentUserId: string;
}

const FriendRequestHistoryItem = ({ item, currentUserId }: FriendRequestHistoryItemProps) => {
    const isSender = item.senderId === currentUserId;
    const otherName = isSender ? item.receiverDisplayName : item.senderDisplayName;
    const otherAvatar = isSender ? item.receiverProfileImageUrl : item.senderProfileImageUrl;

    return (
        <div className="friend-history-item">
            <div className="friend-history-item__avatar">
                {otherAvatar ? (
                    <img
                        src={otherAvatar}
                        alt={otherName}
                        className="friend-history-item__avatar-img"
                    />
                ) : (
                    <span className="friend-history-item__avatar-fallback">
                        {otherName[0].toUpperCase()}
                    </span>
                )}
            </div>

            <div className="friend-history-item__info">
                <span className="friend-history-item__name">{otherName}</span>
                <span className="friend-history-item__subtitle">
                    {isSender ? 'Request sent' : 'Request received'}
                </span>
            </div>

            <span className={`friend-history-item__badge friend-history-item__badge--${item.status.toLowerCase()}`}>
                {item.status}
            </span>
        </div>
    );
};

export default FriendRequestHistoryItem;
