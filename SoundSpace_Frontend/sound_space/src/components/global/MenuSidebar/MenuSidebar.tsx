"use client";

import React from "react";
import Link from "next/link";
import { Home, Search, MessageSquare } from 'lucide-react';

import SidebarItemProps from "@/types/sidebar/sidebarItemProps";
import { useActiveSidebar } from "@/hooks/useActiveSidebar";
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

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

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
                        badge={3}
                        isActive={isActive("/messages")}
                    />
                </div>
            </div>

            <div className="sidebar-footer">
                <ProfileMenu
                    userName="test"
                    currentSong="test"
                    avatarSrc="/icons/SoundSpaceIcon.png"
                    onLogout={handleLogout}
                />
            </div>
        </div>
    );
};

export default MenuSidebar;