export interface CommentUser {
    name: string;
    avatarUrl: string;
}

export interface Comment {
    id: string;
    user: CommentUser;
    text: string;
    timeAgo: string;
}
