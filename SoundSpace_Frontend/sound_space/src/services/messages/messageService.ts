import type { Conversation } from "@/types/message";

const CURRENT_USER_ID = "me";

const mockConversations: Conversation[] = [
    {
        id: "1",
        user: {
            id: "u1",
            name: "Alice",
            avatarUrl: "https://i.pravatar.cc/150?u=Alice",
            isOnline: true,
            listeningTo: { songTitle: "Shape of You", artist: "Ed Sheeran" },
        },
        lastMessage: "Have you heard the new album?",
        lastMessageTime: "2 min ago",
        unreadCount: 2,
        messages: [
            { id: "m1", senderId: "u1", text: "Hey! What are you listening to?", timestamp: "10:30 AM", isRead: true },
            { id: "m2", senderId: CURRENT_USER_ID, text: "Just discovered this amazing playlist on Spotify!", timestamp: "10:32 AM", isRead: true },
            { id: "m3", senderId: "u1", text: "Oh nice! Share it with me", timestamp: "10:33 AM", isRead: true },
            { id: "m4", senderId: CURRENT_USER_ID, text: "Sure, I'll send the link right now 🎶", timestamp: "10:35 AM", isRead: true },
            { id: "m5", senderId: "u1", text: "Have you heard the new album?", timestamp: "10:40 AM", isRead: false },
        ],
    },
    {
        id: "2",
        user: {
            id: "u2",
            name: "Charlie",
            avatarUrl: "https://i.pravatar.cc/150?u=Charlie",
            isOnline: true,
            listeningTo: { songTitle: "Blinding Lights", artist: "The Weeknd" },
        },
        lastMessage: "That concert was incredible!",
        lastMessageTime: "1 hour ago",
        unreadCount: 0,
        messages: [
            { id: "m6", senderId: CURRENT_USER_ID, text: "Did you go to the concert last night?", timestamp: "8:00 PM", isRead: true },
            { id: "m7", senderId: "u2", text: "Yes!! It was unreal 🤯", timestamp: "8:05 PM", isRead: true },
            { id: "m8", senderId: "u2", text: "That concert was incredible!", timestamp: "8:06 PM", isRead: true },
        ],
    },
    {
        id: "3",
        user: {
            id: "u3",
            name: "Bob",
            avatarUrl: "https://i.pravatar.cc/150?u=Bob",
            isOnline: false,
            lastSeen: "2 hours ago",
        },
        lastMessage: "Let me know what you think!",
        lastMessageTime: "3 hours ago",
        unreadCount: 1,
        messages: [
            { id: "m9", senderId: "u3", text: "I made a new beat, check it out", timestamp: "2:00 PM", isRead: true },
            { id: "m10", senderId: CURRENT_USER_ID, text: "Send it over!", timestamp: "2:15 PM", isRead: true },
            { id: "m11", senderId: "u3", text: "Let me know what you think!", timestamp: "2:30 PM", isRead: false },
        ],
    },
    {
        id: "4",
        user: {
            id: "u4",
            name: "Diana",
            avatarUrl: "https://i.pravatar.cc/150?u=Diana",
            isOnline: false,
            lastSeen: "30 mins ago",
        },
        lastMessage: "Thanks for the playlist recommendation!",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        messages: [
            { id: "m12", senderId: CURRENT_USER_ID, text: "Hey, you should check out this lo-fi playlist", timestamp: "Yesterday", isRead: true },
            { id: "m13", senderId: "u4", text: "Thanks for the playlist recommendation!", timestamp: "Yesterday", isRead: true },
        ],
    },
];

export const getCurrentUserId = (): string => CURRENT_USER_ID;

export const fetchConversations = async (): Promise<Conversation[]> => {
    // TODO: Replace with actual API call
    return mockConversations;
};
