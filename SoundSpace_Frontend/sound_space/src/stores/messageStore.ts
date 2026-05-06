import { create } from "zustand";
import type { Conversation, Message } from "@/types/message";

interface MessageState {
    conversations: Conversation[];
    activeConversationId: string;
    setConversations: (conversations: Conversation[]) => void;
    appendMessage: (conversationId: string, message: Message) => void;
    replaceWithTombstone: (messageId: string, conversationId: string) => void;
    setActiveConversation: (id: string) => void;
    markConversationRead: (conversationId: string) => void;
    incrementUnread: (conversationId: string) => void;
    setConversationMessages: (conversationId: string, messages: Message[]) => void;
    addConversationIfMissing: (conversation: Conversation) => void;
    markMessagesAsRead: (conversationId: string, messageIds: string[]) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    conversations: [],
    activeConversationId: "",

    setConversations: (conversations) => set({ conversations }),

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
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            ),
        })),

    incrementUnread: (conversationId) =>
        set((state) => ({
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
}));
