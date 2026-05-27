"use client";

import { Check, Share2, LayoutDashboard, MessageCircle, FileText, Image as ImageIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./EventPageActionBar.css";

type TabId = "overview" | "chat" | "posts" | "photos";

interface EventPageActionBarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    isSticky: boolean;
    isAttending: boolean;
    onAttendToggle: () => void;
    isPending?: boolean;
}

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
    { id: "overview", label: "Overview", Icon: LayoutDashboard },
    { id: "chat", label: "Chat", Icon: MessageCircle },
    { id: "posts", label: "Posts", Icon: FileText },
    { id: "photos", label: "Photos", Icon: ImageIcon },
];

const EventPageActionBar = ({
    activeTab,
    onTabChange,
    isSticky,
    isAttending,
    onAttendToggle,
    isPending,
}: EventPageActionBarProps) => {
    return (
        <div className={`epab${isSticky ? " epab--sticky" : ""}`}>
            <div className="epab__tabs">
                {TABS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        className={`epab__tab${activeTab === id ? " epab__tab--active" : ""}`}
                        onClick={() => onTabChange(id)}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            <div className="epab__actions">
                <button className="epab__share" aria-label="Share event">
                    <Share2 size={16} />
                </button>

                <button
                    className={`epab__attend${isAttending ? " epab__attend--on" : " epab__attend--off"}`}
                    onClick={onAttendToggle}
                    disabled={isPending}
                >
                    {isAttending && <Check size={13} strokeWidth={3} />}
                    {isAttending ? "Attending" : "Attend Event"}
                </button>
            </div>
        </div>
    );
};

export default EventPageActionBar;
