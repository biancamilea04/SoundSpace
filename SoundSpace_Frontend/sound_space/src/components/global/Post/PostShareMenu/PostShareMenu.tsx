import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import './PostShareMenu.css';

interface PostShareMenuProps {
    onShare: (platform: 'instagram' | 'facebook' | 'x') => void;
}

const PostShareMenu = ({ onShare }: PostShareMenuProps) => {
    return (
        <div className="post__share-menu" role="menu" aria-label="Share options">
            <button
                className="post__share-menu-item"
                onClick={() => onShare('instagram')}
                role="menuitem"
            >
                <Instagram size={16} />
                <span>Instagram</span>
            </button>
            <button
                className="post__share-menu-item"
                onClick={() => onShare('facebook')}
                role="menuitem"
            >
                <Facebook size={16} />
                <span>Facebook</span>
            </button>
            <button
                className="post__share-menu-item"
                onClick={() => onShare('x')}
                role="menuitem"
            >
                <Twitter size={16} />
                <span>X</span>
            </button>
        </div>
    );
};

export default PostShareMenu;
