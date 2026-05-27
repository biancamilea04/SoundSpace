import { create } from "zustand";
import type { Conversation, Message } from "@/types/message";

export interface MessageState {
    conversations: Conversation[];
    activeConversationId: string;
    totalUnread: number;
    conversationsLoaded: boolean;
    setConversations: (conversations: Conversation[]) => void;
    appendMessage: (conversationId: string, message: Message) => void;
    replaceWithTombstone: (messageId: string, conversationId: string) => void;
    setActiveConversation: (id: string) => void;
    markConversationRead: (conversationId: string) => void;
    incrementUnread: (conversationId: string) => void;
    setConversationMessages: (conversationId: string, messages: Message[]) => void;
    addConversationIfMissing: (conversation: Conversation) => void;
    markMessagesAsRead: (conversationId: string, messageIds: string[]) => void;
    replacePendingConversation: (tempId: string, realId: string) => void;
    updateUserLastSeen: (userId: string, lastSeen: string) => void;
    updateMessageText: (messageId: string, conversationId: string, newText: string, editedAt: string) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    conversations: [],
    activeConversationId: "",
    totalUnread: 0,
    conversationsLoaded: false,

    setConversations: (conversations) =>
        set({
            conversations,
            conversationsLoaded: true,
            totalUnread: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
        }),

    appendMessage: (conversationId, message) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id !== conversationId
                    ? c
                    : {
                          ...c,
                          messages: [...c.messages, message],
                          lastMessage: message.text,
                          lastMessageTime: message.timestamp,
                      }
            ),
        })),

    replaceWithTombstone: (messageId, conversationId) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id !== conversationId
                    ? c
                    : {
                          ...c,
                          messages: c.messages.map((m) =>
                              m.id !== messageId
                                  ? m
                                  : { ...m, text: null, isDeleted: true }
                          ),
                      }
            ),
        })),

    setActiveConversation: (id) => set({ activeConversationId: id }),

    markConversationRead: (conversationId) =>
        set((state) => {
            const conv = state.conversations.find((c) => c.id === conversationId);
            const delta = conv?.unreadCount ?? 0;
            return {
                totalUnread: Math.max(0, state.totalUnread - delta),
                conversations: state.conversations.map((c) =>
                    c.id === conversationId ? { ...c, unreadCount: 0 } : c
                ),
            };
        }),

    incrementUnread: (conversationId) =>
        set((state) => ({
            totalUnread: state.totalUnread + 1,
            conversations: state.conversations.map((c) =>
                c.id === conversationId
                    ? { ...c, unreadCount: c.unreadCount + 1 }
                    : c
            ),
        })),

    setConversationMessages: (conversationId, messages) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === conversationId ? { ...c, messages } : c
            ),
        })),

    addConversationIfMissing: (conversation) =>
        set((state) => {
            if (state.conversations.some((c) => c.id === conversation.id)) return state;
            return { conversations: [conversation, ...state.conversations] };
        }),

    markMessagesAsRead: (conversationId, messageIds) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id !== conversationId
                    ? c
                    : {
                          ...c,
                          messages: c.messages.map((m) =>
                              messageIds.includes(m.id) ? { ...m, isRead: true } : m
                          ),
                      }
            ),
        })),

    replacePendingConversation: (tempId, realId) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id !== tempId ? c : { ...c, id: realId, isPending: false, targetUserId: undefined }
            ),
            activeConversationId:
                state.activeConversationId === tempId ? realId : state.activeConversationId,
        })),

    updateUserLastSeen: (userId, lastSeen) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.user.id !== userId ? c : { ...c, user: { ...c.user, lastSeen } }
            ),
        })),

    updateMessageText: (messageId, conversationId, newText, editedAt) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id !== conversationId
                    ? c
                    : {
                          ...c,
                          messages: c.messages.map((m) =>
                              m.id !== messageId
                                  ? m
                                  : { ...m, text: newText, editedAt }
                          ),
                      }
            ),
        })),
}));
