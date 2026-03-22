import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, Search, Headphones, MessageSquare, Heart, ListMusic } from 'lucide-react';

import SidebarItemProps from "@/types/sidebar/sidebarItemProps";
import './Sidebar.css';

const SidebarItem = ({ icon: Icon, label, path, badge, isActive }: SidebarItemProps & { isActive?: boolean }) => (
    <Link href={path} prefetch={false} className={`sidebaritem-link ${isActive ? 'active' : ''}`}>
        <div className="icon-wrapper">
            <Icon className="icon" size={20} strokeWidth={2.5} />
            <span className="sidebaritem-span">{label}</span>
        </div>
        {badge && <div className="sidebaritem-badge">{badge}</div>}
    </Link>
);

const Sidebar = () => {
    return (
        <div className="sidebar">
            <Link href="/" className="home-nav__brand">
                <Image
                    src="/icons/SoundSpaceIcon.png"
                    alt="SoundSpace Logo"
                    width={36}
                    height={36}
                    className="home-nav__logo"
                />
                <span className="home-nav__title">SoundSpace</span>
            </Link>

            <div className="sidebar-section">
                <h3 className="sidebar-header">MENU</h3>
                <div className="sidebar-items">
                    <SidebarItem icon={Home} label="Feed" path="/" badge={""} isActive={true} />
                    <SidebarItem icon={Search} label="Discover" path="/" badge={""} />
                    <SidebarItem icon={Headphones} label="Listen Along" path="/" badge={""} />
                    <SidebarItem icon={MessageSquare} label="Messages" path="/" badge={3} />
                </div>
            </div>

            <div className="sidebar-section">
                <h3 className="sidebar-header">LIBRARY</h3>
                <div className="sidebar-items">
                    <SidebarItem icon={Heart} label="Liked Tracks" path="/" badge={""} />
                    <SidebarItem icon={ListMusic} label="Playlists" path="/" badge={""} />
                </div>
            </div>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">
                        <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" />
                    </div>
                    <div className="user-info">
                        <span className="user-name">[test]</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;