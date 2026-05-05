'use client';

import { Check, X } from 'lucide-react';
import type { Friendship } from '@/types/friendship';
import './FriendRequestItem.css';

interface FriendRequestItemProps {
    request: Friendship;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    isProcessing: boolean;
}

const FriendRequestItem = ({ request, onAccept, onReject, isProcessing }: FriendRequestItemProps) => {
    return (
        <div className="friend-request-item">
            <div className="friend-request-item__avatar">
                {request.senderProfileImageUrl ? (
                    <img
                        src={request.senderProfileImageUrl}
                        alt={request.senderDisplayName}
                        className="friend-request-item__avatar-img"
                    />
                ) : (
                    <span className="friend-request-item__avatar-fallback">
                        {request.senderDisplayName[0].toUpperCase()}
                    </span>
                )}
            </div>

            <div className="friend-request-item__info">
                <span className="friend-request-item__name">{request.senderDisplayName}</span>
                <span className="friend-request-item__subtitle">wants to be your friend</span>
            </div>

            <div className="friend-request-item__actions">
                <button
                    className="friend-request-item__btn friend-request-item__btn--accept"
                    onClick={() => onAccept(request.id)}
                    disabled={isProcessing}
                    aria-label="Accept"
                >
                    <Check size={14} />
                </button>
                <button
                    className="friend-request-item__btn friend-request-item__btn--reject"
                    onClick={() => onReject(request.id)}
                    disabled={isProcessing}
                    aria-label="Reject"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default FriendRequestItem;
