import React from 'react';

import Link from "next/link";
import Image from "next/image";
import './FriendSidebar.css';

const DEFAULT_AVATAR = '/icons/SoundSpaceIcon.png';

interface FriendSidebarItemProps {
    name: string;
    song?: string;
    isListening: boolean;
    isOnline: boolean;
    lastOnline: string;
}

const FriendSidebarItem = ({ name, song, isListening, isOnline, lastOnline }: FriendSidebarItemProps) => {
    return (
        <div className="sidebar__friends">
            <Link href="/">
                <div className={`sidebar__friend-item ${isOnline ? 'online' : 'offline'}`}>
                    <div className="sidebar__friend-avatar">
                        <Image
                            src={DEFAULT_AVATAR}
                            alt={`${name} avatar`}
                            width={48}
                            height={48}
                            className={`sidebar__friend-avatar-img ${isOnline ? '' : 'offline'}`}
                        />
                        <span
                            className={`sidebar__friend-status ${isOnline ? 'online' : 'offline'}`}
                            title={isOnline ? 'Online' : `Last online: ${lastOnline}`}
                        />
                    </div>
                    <div className="sidebar__friend-info">
                        <span className={`sidebar__friend-name ${isOnline ? '' : 'offline'}`}>{name}</span>
                        {isListening && song && (
                            <div className="sidebar__friend-song-wrapper">
                                <svg className="sidebar__friend-song-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                                <span className="sidebar__friend-song">{song}</span>
                            </div>
                        )}
                        {!isOnline && lastOnline && (
                             <span className="sidebar__friend-last-online">{lastOnline}</span>
                        )}
                    </div>
                    {isListening && (
                        <div className="sidebar__friend-headphones">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                            </svg>
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
}

const FriendSidebar = () => {
    const friends = [
        { name: "test", song: "test", isListening: true, isOnline: true, lastOnline: "5 mins ago" },
        { name: "test", song: "", isListening: false, isOnline: false, lastOnline: "2 hours ago" },
        { name: "test", song: "test", isListening: true, isOnline: true, lastOnline: "1 min ago" },
        { name: "test", song: "", isListening: false, isOnline: false, lastOnline: "30 mins ago" },
    ];

    return (
        <div className="friend-sidebar">
            <h3 className="friend-sidebar__header">Friends</h3>
            <div className="friend-sidebar__list">
                {friends.map((friend) => (
                    <FriendSidebarItem key={`${friend.name}-${friend.lastOnline}`} {...friend} />
                ))}
            </div>
        </div>
    );
}

export default FriendSidebar;