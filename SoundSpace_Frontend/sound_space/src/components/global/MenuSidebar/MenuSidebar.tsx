import React from "react";
import Link from "next/link";
import { Home, Search, MessageSquare } from 'lucide-react';

import SidebarItemProps from "@/types/sidebar/sidebarItemProps";
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
        </div>
    );
};

export default MenuSidebar;