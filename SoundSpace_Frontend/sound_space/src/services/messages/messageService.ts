import type { Conversation } from "@/types/message";

const CURRENT_USER_ID = "me";
const DEFAULT_AVATAR = "/icons/SoundSpaceIcon.png";

const mockConversations: Conversation[] = [
    {
        id: "1",
        user: {
            id: "u1",
            name: "test",
            avatarUrl: DEFAULT_AVATAR,
            isOnline: true,
            listeningTo: { songTitle: "test", artist: "test" },
        },
        lastMessage: "test",
        lastMessageTime: "2 min ago",
        unreadCount: 2,
        messages: [
            { id: "m1", senderId: "u1", text: "test", timestamp: "10:30 AM", isRead: true },
            { id: "m2", senderId: CURRENT_USER_ID, text: "test", timestamp: "10:32 AM", isRead: true },
            { id: "m3", senderId: "u1", text: "test", timestamp: "10:33 AM", isRead: true },
            { id: "m4", senderId: CURRENT_USER_ID, text: "test", timestamp: "10:35 AM", isRead: true },
            { id: "m5", senderId: "u1", text: "test", timestamp: "10:40 AM", isRead: false },
        ],
    },
    {
        id: "2",
        user: {
            id: "u2",
            name: "test",
            avatarUrl: DEFAULT_AVATAR,
            isOnline: true,
            listeningTo: { songTitle: "test", artist: "test" },
        },
        lastMessage: "test",
        lastMessageTime: "1 hour ago",
        unreadCount: 0,
        messages: [
            { id: "m6", senderId: CURRENT_USER_ID, text: "test", timestamp: "8:00 PM", isRead: true },
            { id: "m7", senderId: "u2", text: "test", timestamp: "8:05 PM", isRead: true },
            { id: "m8", senderId: "u2", text: "test", timestamp: "8:06 PM", isRead: true },
        ],
    },
    {
        id: "3",
        user: {
            id: "u3",
            name: "test",
            avatarUrl: DEFAULT_AVATAR,
            isOnline: false,
            lastSeen: "2 hours ago",
        },
        lastMessage: "test",
        lastMessageTime: "3 hours ago",
        unreadCount: 1,
        messages: [
            { id: "m9", senderId: "u3", text: "test", timestamp: "2:00 PM", isRead: true },
            { id: "m10", senderId: CURRENT_USER_ID, text: "test", timestamp: "2:15 PM", isRead: true },
            { id: "m11", senderId: "u3", text: "test", timestamp: "2:30 PM", isRead: false },
        ],
    },
    {
        id: "4",
        user: {
            id: "u4",
            name: "test",
            avatarUrl: DEFAULT_AVATAR,
            isOnline: false,
            lastSeen: "30 mins ago",
        },
        lastMessage: "test",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        messages: [
            { id: "m12", senderId: CURRENT_USER_ID, text: "test", timestamp: "Yesterday", isRead: true },
            { id: "m13", senderId: "u4", text: "test", timestamp: "Yesterday", isRead: true },
        ],
    },
];

export const getCurrentUserId = (): string => CURRENT_USER_ID;

export const fetchConversations = async (): Promise<Conversation[]> => {
    // TODO: Replace with actual API call
    return mockConversations;
};
