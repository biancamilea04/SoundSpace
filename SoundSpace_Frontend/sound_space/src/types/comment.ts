export interface CommentUser {
    name: string;
    avatarUrl: string;
}

export interface Comment {
    id: string;
    user: CommentUser;
    text: string;
    timeAgo: string;
    replies?: Comment[];
}

export interface CommentData {
    id: string;
    userId: string;
    displayName: string;
    profileImageUrl: string | null;
    content: string;
    createdAt: string;
    updatedAt: string;
    parentCommentId?: string | null;
}

export interface CommentNode {
    id: string;
    userId: string;
    displayName: string;
    profileImageUrl: string | null;
    content: string;
    createdAt: string;
    updatedAt: string;
    replies: CommentNode[];
}
