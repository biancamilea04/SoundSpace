"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CommentData, CommentNode } from '../../types/comment';
import type { SelectedPostPayload } from '../../components/global/Post/Post.types';
import { fetchCommentsByPostId, createComment, updateComment, deleteComment } from '../../services/comment/commentService';
import { toggleLike } from '../../services/post/likeService';
import { useUserProfile } from '../UserProfile/useUserProfile';

interface UseSinglePostPageResult {
    selectedPost: SelectedPostPayload;
    liked: boolean;
    likeCount: number;
    comments: CommentNode[];
    isLoadingComments: boolean;
    commentsError: string | null;
    replyToName: string | null;
    currentUserId: string | null;
    currentUserAvatar: string;
    handleToggleLike: () => void;
    handleStartReply: (commentId: string, userName: string) => void;
    handleCancelReply: () => void;
    handleAddComment: (text: string) => void;
    handleEditComment: (commentId: string, newText: string) => void;
    handleDeleteComment: (commentId: string) => void;
}

const fallbackPost: SelectedPostPayload = {
    postId: '',
    postKey: 'fallback-post',
    user: { name: 'Unknown', avatarUrl: '/icons/SoundSpaceIcon.png' },
    timeAgo: '',
    content: '',
    stats: { likes: 0, comments: 0, isLikedByCurrentUser: false },
    likeCount: 0,
    isLikedByCurrentUser: false,
};

const isSelectedPostPayload = (value: unknown): value is SelectedPostPayload => {
    if (!value || typeof value !== 'object') return false;
    const maybe = value as Partial<SelectedPostPayload>;
    return (
        typeof maybe.postId === 'string'
        && typeof maybe.postKey === 'string'
        && typeof maybe.user?.name === 'string'
        && typeof maybe.content === 'string'
        && typeof maybe.stats === 'object'
    );
};

const getStoredPost = (): SelectedPostPayload => {
    if (typeof window === 'undefined') return fallbackPost;

    const raw = window.sessionStorage.getItem('selectedPost');
    if (!raw) return fallbackPost;

    try {
        const parsed = JSON.parse(raw) as unknown;
        return isSelectedPostPayload(parsed) ? parsed : fallbackPost;
    } catch {
        window.sessionStorage.removeItem('selectedPost');
        return fallbackPost;
    }
};

const buildCommentTree = (flat: CommentData[]): CommentNode[] => {
    const nodeMap = new Map<string, CommentNode>();

    for (const item of flat) {
        nodeMap.set(item.id, {
            id: item.id,
            userId: item.userId,
            displayName: item.displayName,
            profileImageUrl: item.profileImageUrl,
            content: item.content,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            replies: [],
        });
    }

    const roots: CommentNode[] = [];

    for (const item of flat) {
        const node = nodeMap.get(item.id)!;
        if (!item.parentCommentId) {
            roots.push(node);
        } else {
            const parent = nodeMap.get(item.parentCommentId);
            if (parent) {
                parent.replies.push(node);
            } else {
                roots.push(node);
            }
        }
    }

    return roots;
};

const updateNodeInTree = (nodes: CommentNode[], commentId: string, newContent: string, updatedAt: string): CommentNode[] => {
    return nodes.map((node) => {
        if (node.id === commentId) {
            return { ...node, content: newContent, updatedAt };
        }
        if (node.replies.length > 0) {
            return { ...node, replies: updateNodeInTree(node.replies, commentId, newContent, updatedAt) };
        }
        return node;
    });
};

const removeNodeFromTree = (nodes: CommentNode[], commentId: string): CommentNode[] => {
    return nodes
        .filter((node) => node.id !== commentId)
        .map((node) => ({
            ...node,
            replies: removeNodeFromTree(node.replies, commentId),
        }));
};

export const useSinglePostPage = (): UseSinglePostPageResult => {
    const [selectedPost] = useState<SelectedPostPayload>(getStoredPost);
    const [liked, setLiked] = useState(() => selectedPost.isLikedByCurrentUser ?? false);
    const [likeCount, setLikeCount] = useState<number>(() => selectedPost.likeCount ?? selectedPost.stats.likes);
    const [comments, setComments] = useState<CommentNode[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [commentsError, setCommentsError] = useState<string | null>(null);
    const [replyTo, setReplyTo] = useState<{ commentId: string; userName: string } | null>(null);
    const hasFetched = useRef(false);

    const { user } = useUserProfile();
    const currentUserId = user?.id ?? null;
    const currentUserAvatar = user?.profileImageUrl ?? '/icons/SoundSpaceIcon.png';

    useEffect(() => {
        if (hasFetched.current || !selectedPost.postId) {
            setIsLoadingComments(false);
            return;
        }

        hasFetched.current = true;

        fetchCommentsByPostId(selectedPost.postId)
            .then((flat) => {
                setComments(buildCommentTree(flat));
            })
            .catch(() => {
                setCommentsError('Failed to load comments');
            })
            .finally(() => {
                setIsLoadingComments(false);
            });
    }, [selectedPost.postId]);

    const handleToggleLike = useCallback(async () => {
        if (!selectedPost.postId) return;

        const prevLiked = liked;
        const prevCount = likeCount;

        setLiked(!prevLiked);
        setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

        try {
            const result = await toggleLike(selectedPost.postId);
            setLiked(result.isLikedByCurrentUser);
            setLikeCount(result.likeCount);
        } catch {
            setLiked(prevLiked);
            setLikeCount(prevCount);
        }
    }, [selectedPost.postId, liked, likeCount]);

    const handleStartReply = useCallback((commentId: string, userName: string) => {
        setReplyTo({ commentId, userName });
    }, []);

    const handleCancelReply = useCallback(() => {
        setReplyTo(null);
    }, []);

    const handleAddComment = useCallback(async (text: string) => {
        if (!selectedPost.postId) return;

        try {
            const created = await createComment({
                content: text,
                postId: selectedPost.postId,
                parentCommentId: replyTo?.commentId,
            });

            setComments((prev) => {
                if (!created.parentCommentId) {
                    const node: CommentNode = {
                        id: created.id,
                        userId: created.userId,
                        displayName: created.displayName,
                        profileImageUrl: created.profileImageUrl,
                        content: created.content,
                        createdAt: created.createdAt,
                        updatedAt: created.updatedAt,
                        replies: [],
                    };
                    return [node, ...prev];
                }

                const addReply = (nodes: CommentNode[]): CommentNode[] =>
                    nodes.map((node) => {
                        if (node.id === created.parentCommentId) {
                            const reply: CommentNode = {
                                id: created.id,
                                userId: created.userId,
                                displayName: created.displayName,
                                profileImageUrl: created.profileImageUrl,
                                content: created.content,
                                createdAt: created.createdAt,
                                updatedAt: created.updatedAt,
                                replies: [],
                            };
                            return { ...node, replies: [...node.replies, reply] };
                        }
                        return { ...node, replies: addReply(node.replies) };
                    });

                return addReply(prev);
            });

            setReplyTo(null);
        } catch {
        }
    }, [selectedPost.postId, replyTo]);

    const handleEditComment = useCallback(async (commentId: string, newText: string) => {
        try {
            const updated = await updateComment(commentId, { content: newText });
            setComments((prev) =>
                updateNodeInTree(prev, commentId, updated.content, updated.updatedAt ?? new Date().toISOString())
            );
        } catch {
        }
    }, []);

    const handleDeleteComment = useCallback(async (commentId: string) => {
        try {
            await deleteComment(commentId);
            setComments((prev) => removeNodeFromTree(prev, commentId));
        } catch {
        }
    }, []);

    return {
        selectedPost,
        liked,
        likeCount,
        comments,
        isLoadingComments,
        commentsError,
        replyToName: replyTo?.userName ?? null,
        currentUserId,
        currentUserAvatar,
        handleToggleLike,
        handleStartReply,
        handleCancelReply,
        handleAddComment,
        handleEditComment,
        handleDeleteComment,
    };
};
