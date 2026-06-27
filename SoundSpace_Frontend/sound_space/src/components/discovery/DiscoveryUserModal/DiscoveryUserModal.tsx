'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Check, MessageSquare, Music2, MapPin } from 'lucide-react';
import type { DiscoveryUserProfile } from '@/types/discovery';
import { sendFriendRequest, getFriendshipStatus } from '@/services/friendship/friendshipService';
import { createDirectChat } from '@/services/messages/messageService';
import { useMessageStore } from '@/stores/messageStore';
import { ProfileStatsView } from '@/components/profile/ProfileStatsView/ProfileStatsView';
import './DiscoveryUserModal.css';

interface DiscoveryUserModalProps {
    profile: DiscoveryUserProfile;
    onClose: () => void;
}

type FriendState = 'idle' | 'loading' | 'sent' | 'error';

export const DiscoveryUserModal = ({ profile, onClose }: DiscoveryUserModalProps) => {
    const router = useRouter();
    const setActiveConversation = useMessageStore((s) => s.setActiveConversation);
    const [friendState, setFriendState] = useState<FriendState>('idle');
    const [msgLoading, setMsgLoading] = useState(false);

    const { data: friendshipStatus } = useQuery({
        queryKey: ['friendship-status', profile.id],
        queryFn: () => getFriendshipStatus(profile.id),
        staleTime: 30 * 1000,
    });

    const isAlreadyFriend =
        friendshipStatus?.status === 'Accepted' || friendshipStatus?.status === 'Pending';
    const addFriendDisabled = isAlreadyFriend || friendState !== 'idle';

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleAddFriend = async () => {
        if (addFriendDisabled) return;
        setFriendState('loading');
        try {
            await sendFriendRequest(profile.id);
            setFriendState('sent');
        } catch {
            setFriendState('error');
        }
    };

    const handleSendMessage = async () => {
        if (msgLoading) return;
        setMsgLoading(true);
        try {
            const { conversationId } = await createDirectChat(profile.id);
            setActiveConversation(conversationId);
            router.push('/messages');
            onClose();
        } catch {
            setMsgLoading(false);
        }
    };

    const showCheckIcon = isAlreadyFriend || friendState === 'sent';

    return (
        <>
            <div className="du-modal__backdrop" onClick={onClose} aria-hidden="true" />

            <div
                className="du-modal"
                role="dialog"
                aria-modal="true"
                aria-label={`${profile.name}'s profile`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Hero */}
                <div className="du-modal__hero">
                    <div className="du-modal__avatar">
                        {profile.imageUrl ? (
                            <Image
                                src={profile.imageUrl}
                                alt={profile.name}
                                fill
                                className="du-modal__avatar-img"
                            />
                        ) : (
                            <div className="du-modal__avatar-fallback">
                                <Music2 size={28} />
                            </div>
                        )}
                    </div>

                    <div className="du-modal__hero-text">
                        <h2 className="du-modal__name">{profile.name}</h2>
                        {profile.tagline && (
                            <span className="du-modal__country">
                                <MapPin size={12} />
                                {profile.tagline}
                            </span>
                        )}
                        <span className="du-modal__match-badge">{profile.matchPercentage}% match</span>
                    </div>

                    <div className="du-modal__actions">
                        <button
                            className={`du-modal__action-btn du-modal__action-btn--friend${addFriendDisabled ? ' du-modal__action-btn--disabled' : ''}`}
                            onClick={handleAddFriend}
                            disabled={addFriendDisabled}
                            aria-label={showCheckIcon ? 'Already connected' : 'Add friend'}
                            title={showCheckIcon ? 'Already connected' : 'Add friend'}
                        >
                            {showCheckIcon ? <Check size={17} /> : <UserPlus size={17} />}
                        </button>

                        <button
                            className={`du-modal__action-btn du-modal__action-btn--message${msgLoading ? ' du-modal__action-btn--disabled' : ''}`}
                            onClick={handleSendMessage}
                            disabled={msgLoading}
                            aria-label="Send message"
                            title="Send message"
                        >
                            <MessageSquare size={17} />
                        </button>
                    </div>
                </div>

                {/* Scrollable stats body */}
                <div className="du-modal__body">
                    <ProfileStatsView username={profile.name} />
                </div>
            </div>
        </>
    );
};

export default DiscoveryUserModal;
