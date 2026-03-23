import { useCallback, useEffect, useRef, useState } from 'react';

type SharePlatform = 'instagram' | 'facebook' | 'x';

interface UsePostInteractionsParams {
    userName: string;
    content: string;
}

interface UsePostInteractionsResult {
    liked: boolean;
    showShareMenu: boolean;
    showOptionsMenu: boolean;
    shareMenuRef: React.RefObject<HTMLDivElement | null>;
    optionsMenuRef: React.RefObject<HTMLDivElement | null>;
    toggleLiked: () => void;
    toggleShareMenu: () => void;
    toggleOptionsMenu: () => void;
    handleReportPost: () => void;
    handleShare: (platform: SharePlatform) => void;
}

const getShareUrl = (platform: SharePlatform, currentUrl: string, shareText: string): string => {
    if (platform === 'instagram') {
        return 'https://www.instagram.com/';
    }

    if (platform === 'facebook') {
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    }

    return `https://x.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
};

export const usePostInteractions = ({ userName, content }: UsePostInteractionsParams): UsePostInteractionsResult => {
    const [liked, setLiked] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
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

    const toggleLiked = useCallback(() => {
        setLiked((prev) => !prev);
    }, []);

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

    const handleShare = useCallback((platform: SharePlatform) => {
        if (typeof window === 'undefined') {
            return;
        }

        const currentUrl = window.location.href;
        const shareText = `${userName} shared on SoundSpace: ${content}`;
        const shareUrl = getShareUrl(platform, currentUrl, shareText);

        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        setShowShareMenu(false);
    }, [content, userName]);

    return {
        liked,
        showShareMenu,
        showOptionsMenu,
        shareMenuRef,
        optionsMenuRef,
        toggleLiked,
        toggleShareMenu,
        toggleOptionsMenu,
        handleReportPost,
        handleShare,
    };
};
