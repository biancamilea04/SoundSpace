import { useCallback, useEffect, useState } from 'react';
import type { Comment } from '../../types/comment';
import type { SelectedPostPayload } from '../../components/global/Post/Post.types';

interface UseSinglePostPageResult {
    selectedPost: SelectedPostPayload;
    liked: boolean;
    likeCount: number;
    comments: Comment[];
    replyToName: string | null;
    currentUserAvatar: string;
    handleToggleLike: () => void;
    handleStartReply: (comment: Comment) => void;
    handleCancelReply: () => void;
    handleAddComment: (text: string) => void;
}

const initialComments: Comment[] = [
    {
        id: '1',
        user: { name: 'test_user_1', avatarUrl: '/icons/SoundSpaceIcon.png' },
        text: 'test',
        timeAgo: '2h ago',
    },
    {
        id: '2',
        user: { name: 'test_user_2', avatarUrl: '/icons/SoundSpaceIcon.png' },
        text: 'test',
        timeAgo: '1h ago',
    },
    {
        id: '3',
        user: { name: 'test_user_3', avatarUrl: '/icons/SoundSpaceIcon.png' },
        text: 'test',
        timeAgo: '45m ago',
    },
    {
        id: '4',
        user: { name: 'test_user_4', avatarUrl: '/icons/SoundSpaceIcon.png' },
        text: 'test',
        timeAgo: '30m ago',
    },
    {
        id: '5',
        user: { name: 'test_user_5', avatarUrl: '/icons/SoundSpaceIcon.png' },
        text: 'test',
        timeAgo: '15m ago',
    },
];

const initialLikeCount = 245;
const currentUserAvatar = '/icons/SoundSpaceIcon.png';

const fallbackPost: SelectedPostPayload = {
    postKey: 'fallback-post',
    user: { name: 'test_user', avatarUrl: currentUserAvatar },
    timeAgo: '3h ago',
    content: 'test',
    stats: { likes: initialLikeCount, comments: initialComments.length },
    song: {
        title: 'Midnight Echoes',
        artist: 'The Synthwave Collective',
        albumImageUrl: '/icons/SoundSpaceIcon.png',
        durationFormatted: '1:24',
    },
};

const commentsStoragePrefix = 'postComments:';

const getCommentsStorageKey = (postKey: string): string => {
    return `${commentsStoragePrefix}${encodeURIComponent(postKey)}`;
};

const isComment = (value: unknown): value is Comment => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const maybeComment = value as Partial<Comment>;
    return (
        typeof maybeComment.id === 'string'
        && typeof maybeComment.text === 'string'
        && typeof maybeComment.timeAgo === 'string'
        && typeof maybeComment.user?.name === 'string'
        && typeof maybeComment.user?.avatarUrl === 'string'
    );
};

const getStoredPost = (): SelectedPostPayload => {
    if (typeof window === 'undefined') {
        return fallbackPost;
    }

    const storedPost = window.sessionStorage.getItem('selectedPost');
    if (!storedPost) {
        return fallbackPost;
    }

    try {
        const parsedPost = JSON.parse(storedPost) as SelectedPostPayload;
        if (!parsedPost?.user?.name || !parsedPost?.content || !parsedPost?.stats || !parsedPost?.postKey) {
            return fallbackPost;
        }

        return parsedPost;
    } catch {
        window.sessionStorage.removeItem('selectedPost');
        return fallbackPost;
    }
};

const getStoredComments = (postKey: string): Comment[] => {
    if (typeof window === 'undefined') {
        return initialComments;
    }

    const storedComments = window.sessionStorage.getItem(getCommentsStorageKey(postKey));
    if (!storedComments) {
        return initialComments;
    }

    try {
        const parsedComments = JSON.parse(storedComments) as unknown;
        if (!Array.isArray(parsedComments)) {
            return initialComments;
        }

        const validComments = parsedComments.filter(isComment);
        return validComments.length > 0 ? validComments : initialComments;
    } catch {
        return initialComments;
    }
};

const addReplyToThread = (comments: Comment[], parentCommentId: string, reply: Comment): Comment[] => {
    return comments.map((comment) => {
        if (comment.id === parentCommentId) {
            return {
                ...comment,
                replies: [...(comment.replies || []), reply],
            };
        }

        if (!comment.replies || comment.replies.length === 0) {
            return comment;
        }

        return {
            ...comment,
            replies: addReplyToThread(comment.replies, parentCommentId, reply),
        };
    });
};

export const useSinglePostPage = (): UseSinglePostPageResult => {
    const [selectedPost] = useState<SelectedPostPayload>(getStoredPost);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState<number>(selectedPost.stats.likes);
    const [comments, setComments] = useState<Comment[]>(() => getStoredComments(selectedPost.postKey));
    const [replyTo, setReplyTo] = useState<{ commentId: string; userName: string } | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.sessionStorage.setItem(getCommentsStorageKey(selectedPost.postKey), JSON.stringify(comments));
    }, [comments, selectedPost.postKey]);

    const handleToggleLike = useCallback(() => {
        setLiked((prevLiked) => {
            const nextLiked = !prevLiked;
            setLikeCount((prevCount) => (nextLiked ? prevCount + 1 : prevCount - 1));
            return nextLiked;
        });
    }, []);

    const handleStartReply = useCallback((comment: Comment) => {
        setReplyTo({ commentId: comment.id, userName: comment.user.name });
    }, []);

    const handleCancelReply = useCallback(() => {
        setReplyTo(null);
    }, []);

    const handleAddComment = useCallback((text: string) => {
        const newComment: Comment = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            user: { name: 'You', avatarUrl: currentUserAvatar },
            text,
            timeAgo: 'Just now',
        };

        setComments((prevComments) => {
            if (!replyTo) {
                return [newComment, ...prevComments];
            }

            return addReplyToThread(prevComments, replyTo.commentId, newComment);
        });

        setReplyTo(null);
    }, [replyTo]);

    return {
        selectedPost,
        liked,
        likeCount,
        comments,
        replyToName: replyTo?.userName || null,
        currentUserAvatar,
        handleToggleLike,
        handleStartReply,
        handleCancelReply,
        handleAddComment,
    };
};
