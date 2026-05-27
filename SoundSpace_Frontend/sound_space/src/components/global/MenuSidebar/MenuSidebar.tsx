"use client";

import React from "react";
import Link from "next/link";
import { Home, Search, MessageSquare, CalendarDays } from 'lucide-react';

import SidebarItemProps from "@/types/sidebar/sidebarItemProps";
import { useActiveSidebar } from "@/hooks/useActiveSidebar";
import { useUserProfile } from "@/hooks/UserProfile/useUserProfile";
import { useUnreadConversationCount } from "@/hooks/Conversations/useConversationsApi";
import { useMessageStore } from "@/stores/messageStore";
import ProfileMenu from "@/components/global/ProfileMenu/ProfileMenu";
import './MenuSidebar.css';

const MenuSidebarItem = ({ icon: Icon, label, path, badge, isActive }: SidebarItemProps & { isActive?: boolean }) => (
    <Link href={path} prefetch={false} className={`sidebaritem-link ${isActive ? 'active' : ''}`}>
        <div className="icon-wrapper">
            <Icon className="icon" size={20} strokeWidth={2.5} />
            <span className="sidebaritem-span">{label}</span>
        </div>
        {badge && <div className="sidebaritem-badge">{badge}</div>}
    </Link>
);

const MenuSidebar = () => {
    const { isActive } = useActiveSidebar();
    const { user } = useUserProfile();
    const { data: apiUnreadCount = 0 } = useUnreadConversationCount();
    const totalUnread = useMessageStore((s) => s.totalUnread);
    const conversationsLoaded = useMessageStore((s) => s.conversationsLoaded);
    const unreadCount = conversationsLoaded ? totalUnread : apiUnreadCount;
    const unreadBadge = unreadCount === 0 ? "" : unreadCount > 9 ? "9+" : unreadCount;

    const userName = user?.displayName || 'Profile';
    const avatarSrc = user?.profileImageUrl || '/icons/SoundSpaceIcon.png';
    const profileHref = user?.displayName
        ? `/profile/${encodeURIComponent(user.displayName)}`
        : '/profile';

    return (
        <div className="sidebar">
            <div className="sidebar-section">
                <h3 className="sidebar-header">MENU</h3>
                <div className="sidebar-items">
                    <MenuSidebarItem
                        icon={Home}
                        label="Feed"
                        path="/"
                        badge={""}
                        isActive={isActive("/")}
                    />
                    <MenuSidebarItem
                        icon={Search}
                        label="Discover"
                        path="/discovery"
                        badge={""}
                        isActive={isActive("/discovery")}
                    />
                    <MenuSidebarItem
                        icon={MessageSquare}
                        label="Messages"
                        path="/messages"
                        badge={unreadBadge}
                        isActive={isActive("/messages")}
                    />
                    <MenuSidebarItem
                        icon={CalendarDays}
                        label="Events"
                        path="/events"
                        badge={""}
                        isActive={isActive("/events")}
                    />
                </div>
            </div>

            <div className="sidebar-footer">
                <ProfileMenu
                    userName={userName}
                    avatarSrc={avatarSrc}
                    profileHref={profileHref}
                />
            </div>
        </div>
    );
};

export default MenuSidebar;