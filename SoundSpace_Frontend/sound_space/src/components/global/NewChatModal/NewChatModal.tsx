"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecentContacts, useCreateDirectChat } from "@/hooks/Conversations/useConversationsApi";
import { useSearchUsers } from "@/hooks/Users/useSearchUsers";
import { useNewChatModal } from "@/stores/newChatModalStore";
import { useMessageStore } from "@/stores/messageStore";
import { useDebounce } from "@/hooks/useDebounce";
import type { UserSearchResultDto } from "@/types/user";
import type { Conversation } from "@/types/message";
import "./NewChatModal.css";

export default function NewChatModal() {
    const router = useRouter();

    const { isOpen, closeModal } = useNewChatModal();

    const [searchInput, setSearchInput] = useState("");
    const debouncedQuery = useDebounce(searchInput, 400);
    const isSearching = debouncedQuery.trim().length >= 2;

    useEffect(() => {
        if (!isOpen) setSearchInput("");
    }, [isOpen]);

    const { data: recentContacts, isLoading: loadingRecent } = useRecentContacts();
    const { data: searchResults, isLoading: loadingSearch, isError: searchError } = useSearchUsers(debouncedQuery);

    const createChatMutation = useCreateDirectChat();
    const store = useMessageStore();

    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, closeModal]);

    const handleUserSelect = async (user: UserSearchResultDto) => {
        if (createChatMutation.isPending) return;

        try {
            const result = await createChatMutation.mutateAsync(user.id);

            const newConversation: Conversation = {
                id: result.conversationId,
                user: {
                    id: user.id,
                    name: user.displayName,
                    avatarUrl: user.profileImageUrl ?? "",
                    isOnline: false,
                },
                lastMessage: null,
                lastMessageTime: "",
                unreadCount: 0,
                messages: [],
            };
            store.addConversationIfMissing(newConversation);

            store.setActiveConversation(result.conversationId);

            router.push("/messages");

            closeModal();
        } catch (err) {
            console.error("[NewChatModal] Failed to open chat:", err);
        }
    };

    const showSearch = isSearching;
    const displayList: UserSearchResultDto[] = showSearch
        ? (searchResults ?? [])
        : (recentContacts ?? []);

    const isLoading = showSearch ? loadingSearch : loadingRecent;
    const sectionLabel = showSearch ? "Search results" : "Recent";

    if (!isOpen) return null;

    return (
        <div
            className="new-chat-modal__overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeModal();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Start a new chat"
        >
            <div className="new-chat-modal__panel" ref={panelRef}>

                {/* Header */}
                <div className="new-chat-modal__header">
                    <span className="new-chat-modal__title">New Message</span>
                    <button
                        className="new-chat-modal__close"
                        onClick={closeModal}
                        aria-label="Close"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                            stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="new-chat-modal__search-wrap">
                    <svg className="new-chat-modal__search-icon" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        autoFocus
                        type="text"
                        className="new-chat-modal__search-input"
                        placeholder="Search by name…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>

                {!isLoading && displayList.length > 0 && (
                    <span className="new-chat-modal__section-label">{sectionLabel}</span>
                )}

                <div className="new-chat-modal__list">
                    {isLoading && (
                        <div className="new-chat-modal__state">
                            <span className="new-chat-modal__spinner" />
                            {showSearch ? "Searching…" : "Loading contacts…"}
                        </div>
                    )}
                    {!isLoading && showSearch && searchError && (
                        <div className="new-chat-modal__state new-chat-modal__state--error">
                            Something went wrong. Try again.
                        </div>
                    )}
                    {!isLoading && !searchError && displayList.length === 0 && (
                        <div className="new-chat-modal__state">
                            {showSearch ? "No users found." : "No recent conversations yet."}
                        </div>
                    )}
                    {!isLoading && !searchError && displayList.map((user) => (
                        <button
                            key={user.id}
                            className="new-chat-modal__item"
                            onClick={() => void handleUserSelect(user)}
                            disabled={createChatMutation.isPending}
                        >
                            <div className="new-chat-modal__avatar">
                                {user.profileImageUrl
                                    ? <img src={user.profileImageUrl} alt={user.displayName}
                                        className="new-chat-modal__avatar-img" />
                                    : <span className="new-chat-modal__avatar-fallback">
                                        {user.displayName[0].toUpperCase()}
                                    </span>
                                }
                            </div>
                            <div className="new-chat-modal__info">
                                <span className="new-chat-modal__name">{user.displayName}</span>
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}
