import { useEffect, useRef, useState } from 'react';

type SharePlatform = 'instagram' | 'facebook' | 'x';

interface UsePostInteractionsParams {
    userName: string;
    content: string;
}

export const usePostInteractions = ({ userName, content }: UsePostInteractionsParams) => {
    const [liked, setLiked] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setShowShareMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleShare = (platform: SharePlatform) => {
        const currentUrl = window.location.href;
        const shareText = `${userName} shared on SoundSpace: ${content}`;

        const shareLinks = {
            instagram: 'https://www.instagram.com/',
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
            x: `https://x.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
        };

        window.open(shareLinks[platform], '_blank', 'noopener,noreferrer');
        setShowShareMenu(false);
    };

    const toggleLiked = () => {
        setLiked((prev) => !prev);
    };

    const toggleShareMenu = () => {
        setShowShareMenu((prev) => !prev);
    };

    return {
        liked,
        showShareMenu,
        shareMenuRef,
        toggleLiked,
        toggleShareMenu,
        handleShare,
    };
};
