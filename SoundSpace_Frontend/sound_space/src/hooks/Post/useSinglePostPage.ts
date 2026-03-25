import { useCallback, useEffect, useState } from 'react';
import type { Comment } from '../../types/comment';
import type { SelectedPostPayload } from '../../components/global/Post/Post.types';

interface UseSinglePostPageResult {
    selectedPost: SelectedPostPayload;
    liked: boolean;
    likeCount: number;
    comments: Comment[];
    currentUserAvatar: string;
    handleToggleLike: () => void;
    handleAddComment: (text: string) => void;
}

const initialComments: Comment[] = [
    {
        id: '1',
        user: { name: 'Emily W.', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
        text: 'This is such a vibe! Been listening on repeat all day 🎶',
        timeAgo: '2h ago',
    },
    {
        id: '2',
        user: { name: 'Marcus J.', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
        text: 'The bridge in this song is unreal. Definitely adding to my playlist.',
        timeAgo: '1h ago',
    },
    {
        id: '3',
        user: { name: 'Olivia T.', avatarUrl: 'https://i.pravatar.cc/150?img=9' },
        text: "Anyone know if they're touring soon? Would love to see this live!",
        timeAgo: '45m ago',
    },
    {
        id: '4',
        user: { name: 'Jake P.', avatarUrl: 'https://i.pravatar.cc/150?img=8' },
        text: 'Production quality is insane on this one.',
        timeAgo: '30m ago',
    },
    {
        id: '5',
        user: { name: 'Nina S.', avatarUrl: 'https://i.pravatar.cc/150?img=16' },
        text: 'Shared this with all my friends. Pure fire 🔥',
        timeAgo: '15m ago',
    },
];

const initialLikeCount = 245;
const currentUserAvatar = 'https://i.pravatar.cc/150?img=7';

const fallbackPost: SelectedPostPayload = {
    postKey: 'fallback-post',
    user: { name: 'Alex R.', avatarUrl: 'https://i.pravatar.cc/150?img=11' },
    timeAgo: '3h ago',
    content: "Vibing to this new single! The production on this is absolutely insane. Can't stop listening to it on repeat. Drop your thoughts below!",
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

export const useSinglePostPage = (): UseSinglePostPageResult => {
    const [selectedPost] = useState<SelectedPostPayload>(getStoredPost);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState<number>(selectedPost.stats.likes);
    const [comments, setComments] = useState<Comment[]>(() => getStoredComments(selectedPost.postKey));

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

    const handleAddComment = useCallback((text: string) => {
        const newComment: Comment = {
            id: String(Date.now()),
            user: { name: 'You', avatarUrl: currentUserAvatar },
            text,
            timeAgo: 'Just now',
        };

        setComments((prevComments) => [newComment, ...prevComments]);
    }, []);

    return {
        selectedPost,
        liked,
        likeCount,
        comments,
        currentUserAvatar,
        handleToggleLike,
        handleAddComment,
    };
};
