"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { createDirectChat, getRecentContacts, getUnreadConversationCount, type DirectChatResult } from "@/services/messages/messageService";
import type { UserSearchResultDto } from "@/types/user";

export function useRecentContacts() {
    return useQuery<UserSearchResultDto[]>({
        queryKey: ["conversations", "recent-contacts"],
        queryFn: getRecentContacts,
        staleTime: 60_000,
        throwOnError: false,
    });
}

export function useCreateDirectChat() {
    return useMutation<DirectChatResult, Error, string>({
        mutationFn: (targetUserId: string) => createDirectChat(targetUserId),
    });
}

export function useUnreadConversationCount() {
    return useQuery<number>({
        queryKey: ["conversations", "unread-count"],
        queryFn: getUnreadConversationCount,
        staleTime: 30_000,
        refetchInterval: 60_000,
        refetchOnWindowFocus: true,
        throwOnError: false,
    });
}
