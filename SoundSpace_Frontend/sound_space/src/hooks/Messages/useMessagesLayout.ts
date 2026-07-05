"use client";

import { useEffect, useState } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { usePresenceStore } from "@/stores/presenceStore";
import {
    fetchConversations,
    getCurrentUserId,
} from "@/services/messages/messageService";
import type { Conversation } from "@/types/message";

interface UseMessagesLayoutResult {
    conversations: Conversation[];
    filteredConversations: Conversation[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export const useMessagesLayout = (): UseMessagesLayoutResult => {
    const storeConversations = useMessageStore((s) => s.conversations);
    const conversationsLoaded = useMessageStore((s) => s.conversationsLoaded);
    const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (conversationsLoaded) return;
        let cancelled = false;
        (async () => {
            try {
                const uid = await getCurrentUserId();
                if (cancelled) return;
                const convs = await fetchConversations(uid);
                if (cancelled) return;
                useMessageStore.getState().setConversations(convs);
            } catch {
                // silently fail; conversations stay empty
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [conversationsLoaded]);

    const conversations: Conversation[] = storeConversations.map((c) => ({
        ...c,
        user: { ...c.user, isOnline: onlineUserIds.has(c.user.id) },
    }));

    const filteredConversations = conversations.filter((c) =>
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return { conversations, filteredConversations, searchQuery, setSearchQuery };
};
