import React from "react";
import { Plus } from "lucide-react";
import { useNewChatModal } from "@/stores/newChatModalStore";
import "./SidebarHeader.css";

const SidebarHeader = () => {
    const { openModal } = useNewChatModal();

    return (
        <div className="sidebar-header">
            <h2 className="sidebar-header__title">Messages</h2>
            <button className="sidebar-header__new-chat-btn" aria-label="New chat" onClick={openModal}>
                <Plus size={18} />
                <span>New Chat</span>
            </button>
        </div>
    );
};

export default SidebarHeader;
