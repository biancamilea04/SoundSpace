import { useCallback, useState } from 'react';
import type { Comment } from '@/types/comment';

interface UseSinglePostPageResult {
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

export const useSinglePostPage = (): UseSinglePostPageResult => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [comments, setComments] = useState<Comment[]>(initialComments);

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

        setComments((prevComments) => [...prevComments, newComment]);
    }, []);

    return {
        liked,
        likeCount,
        comments,
        currentUserAvatar,
        handleToggleLike,
        handleAddComment,
    };
};
