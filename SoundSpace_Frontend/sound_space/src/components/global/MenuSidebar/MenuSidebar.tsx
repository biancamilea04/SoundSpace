import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, Search, Headphones, MessageSquare, Heart, ListMusic } from 'lucide-react';

import SidebarItemProps from "@/types/sidebar/sidebarItemProps";
import './MenuSidebar.css';
import song from "@/components/global/Song/Song";

const MenuSidebarItem = ({ icon: Icon, label, path, badge, isActive }: SidebarItemProps & { isActive?: boolean }) => (
    <Link href={path} prefetch={false} className={`sidebaritem-link ${isActive ? 'active' : ''}`}>
        <div className="icon-wrapper">
            <Icon className="icon" size={20} strokeWidth={2.5} />
            <span className="sidebaritem-span">{label}</span>
        </div>
        {badge && <div className="sidebaritem-badge">{badge}</div>}
    </Link>
);

const UserProfile = ({ isListening, song }: { isListening: boolean, song: string }) => {
    return (
        <div className="user-profile">
            <div className="avatar">
                <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" />
            </div>
            <div className="user-info">
                <span className="user-name">[test]</span>
                {isListening && song && (
                    <div className="user-song-wrapper">
                        <svg className="user-song-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                        <span className="user-song">{song}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

const MenuSidebar = () => {
    const currentUser = { isListening: true, song: "Blinding Lights - The Weeknd" };

    return (
        <div className="sidebar">

            <div className="sidebar-section">
                <h3 className="sidebar-header">MENU</h3>
                <div className="sidebar-items">
                    <MenuSidebarItem icon={Home} label="Feed" path="/feed" badge={""} isActive={true} />
                    <MenuSidebarItem icon={Search} label="Discover" path="/" badge={""} />
                    <MenuSidebarItem icon={MessageSquare} label="Messages" path="/messages" badge={3} />
                </div>
            </div>

            <div className="sidebar-footer">
                <UserProfile isListening={currentUser.isListening} song={currentUser.song} />
            </div>
        </div>
    );
};

export default MenuSidebar;