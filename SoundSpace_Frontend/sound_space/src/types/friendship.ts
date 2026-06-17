export type FriendshipStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Removed';

export interface FriendListItem {
    userId: string;
    displayName: string;
    profileImageUrl: string | null;
}

export interface Friendship {
    id: string;
    senderId: string;
    senderDisplayName: string;
    senderProfileImageUrl: string | null;
    receiverId: string;
    receiverDisplayName: string;
    receiverProfileImageUrl: string | null;
    status: FriendshipStatus;
    createdAt: string;
    updatedAt: string | null;
}
