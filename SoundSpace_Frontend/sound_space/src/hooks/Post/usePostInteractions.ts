import { useCallback, useEffect, useRef, useState } from 'react';
import { toggleLike } from '@/services/post/likeService';

type SharePlatform = 'instagram' | 'facebook' | 'x';

interface UsePostInteractionsParams {
    postId: string;
    userName: string;
    content: string;
    initialLiked: boolean;
    initialLikeCount: number;
}

interface UsePostInteractionsResult {
    liked: boolean;
    likeCount: number;
    showShareMenu: boolean;
    showOptionsMenu: boolean;
    copiedToast: boolean;
    shareMenuRef: React.RefObject<HTMLDivElement | null>;
    optionsMenuRef: React.RefObject<HTMLDivElement | null>;
    toggleLiked: () => void;
    toggleShareMenu: () => void;
    toggleOptionsMenu: () => void;
    handleReportPost: () => void;
    handleShare: (platform: SharePlatform) => void;
}

export const usePostInteractions = ({ postId, userName, content, initialLiked, initialLikeCount }: UsePostInteractionsParams): UsePostInteractionsResult => {
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [copiedToast, setCopiedToast] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const optionsMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (shareMenuRef.current && !shareMenuRef.current.contains(target)) {
                setShowShareMenu(false);
            }

            if (optionsMenuRef.current && !optionsMenuRef.current.contains(target)) {
                setShowOptionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleLiked = useCallback(async () => {
        const prevLiked = liked;
        const prevCount = likeCount;

        setLiked(!prevLiked);
        setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

        try {
            const result = await toggleLike(postId);
            setLiked(result.isLikedByCurrentUser);
            setLikeCount(result.likeCount);
        } catch {
            setLiked(prevLiked);
            setLikeCount(prevCount);
        }
    }, [postId, liked, likeCount]);

    const toggleShareMenu = useCallback(() => {
        setShowShareMenu((prev) => {
            const next = !prev;
            if (next) {
                setShowOptionsMenu(false);
            }
            return next;
        });
    }, []);

    const toggleOptionsMenu = useCallback(() => {
        setShowOptionsMenu((prev) => {
            const next = !prev;
            if (next) {
                setShowShareMenu(false);
            }
            return next;
        });
    }, []);

    const handleReportPost = useCallback(() => {
        setShowOptionsMenu(false);
    }, []);

    const handleShare = useCallback(async (platform: SharePlatform) => {
        if (typeof window === 'undefined') return;

        const currentUrl = window.location.href;
        const shareText = `${userName} shared on SoundSpace: ${content}`;

        setShowShareMenu(false);

        if (platform === 'facebook') {
            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
            window.open(url, 'share-facebook', 'width=626,height=436,noopener,noreferrer');
            return;
        }

        if (platform === 'x') {
            const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
            window.open(url, 'share-x', 'width=550,height=420,noopener,noreferrer');
            return;
        }

        // instagram: native share sheet on mobile, clipboard fallback on desktop
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({ title: 'SoundSpace Post', text: shareText, url: currentUrl });
            } else {
                await navigator.clipboard.writeText(currentUrl);
                setCopiedToast(true);
                setTimeout(() => setCopiedToast(false), 2000);
            }
        } catch {
            // user cancelled share or clipboard permission denied
        }
    }, [content, userName]);

    return {
        liked,
        likeCount,
        showShareMenu,
        showOptionsMenu,
        copiedToast,
        shareMenuRef,
        optionsMenuRef,
        toggleLiked,
        toggleShareMenu,
        toggleOptionsMenu,
        handleReportPost,
        handleShare,
    };
};
