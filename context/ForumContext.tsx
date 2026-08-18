import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ForumPost, ForumComment, ForumCategory, MediaAttachment } from '../types';
import { ForumService } from '../services/ForumService';

interface ForumContextValue {
    posts: ForumPost[];
    selectedCategory: ForumCategory | null;
    currentPost: ForumPost | null;
    comments: ForumComment[];
    isLoading: boolean;
    isLoadingComments: boolean;
    errorMessage: string | null;
    commentText: string;
    setCommentText: (v: string) => void;
    loadPosts: () => Promise<void>;
    loadPost: (id: string) => Promise<void>;
    filterByCategory: (cat: ForumCategory | null) => Promise<void>;
    createPost: (
        title: string,
        content: string,
        category: ForumCategory,
        journeyStep: string | undefined,
        authorId: string,
        authorName: string,
        mediaAttachments?: MediaAttachment[]
    ) => Promise<boolean>;
    addComment: (authorId: string, authorName: string) => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
    toggleCommentLike: (commentId: string) => Promise<void>;
    clearError: () => void;
}

const ForumContext = createContext<ForumContextValue | null>(null);

export function ForumProvider({ children }: { children: React.ReactNode }) {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
    const [currentPost, setCurrentPost] = useState<ForumPost | null>(null);
    const [comments, setComments] = useState<ForumComment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const auth = useAuth();

    const loadPosts = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const fetched = await ForumService.fetchPosts(selectedCategory);
            setPosts(fetched);
        } catch {
            setErrorMessage('Failed to load posts. Please try again.');
        }
        setIsLoading(false);
    }, [selectedCategory]);

    const loadPost = useCallback(async (id: string) => {
        setIsLoading(true);
        setIsLoadingComments(true);
        setErrorMessage(null);
        try {
            const [post, postComments] = await Promise.all([
                ForumService.fetchPost(id),
                ForumService.fetchComments(id),
            ]);
            setCurrentPost(post);
            setComments(postComments);
        } catch {
            setErrorMessage('Failed to load post. Please try again.');
        }
        setIsLoading(false);
        setIsLoadingComments(false);
    }, []);

    const filterByCategory = useCallback(async (cat: ForumCategory | null) => {
        setSelectedCategory(cat);
        setIsLoading(true);
        try {
            const fetched = await ForumService.fetchPosts(cat);
            setPosts(fetched);
        } catch {
            setErrorMessage('Failed to load posts.');
        }
        setIsLoading(false);
    }, []);

    const createPost = useCallback(async (
        title: string,
        content: string,
        category: ForumCategory,
        journeyStep: string | undefined,
        authorId: string,
        authorName: string,
        mediaAttachments?: MediaAttachment[]
    ): Promise<boolean> => {
        setIsLoading(true);
        try {
            const newPost = await ForumService.createPost({
                authorId,
                authorName,
                title,
                content,
                category,
                journeyStep: journeyStep as any,
                mediaAttachments,
            });
            setPosts(prev => [newPost, ...prev]);
            setIsLoading(false);
            return true;
        } catch (e: any) {
            setErrorMessage(e?.message ?? 'Failed to create post. Please try again.');
            setIsLoading(false);
            return false;
        }
    }, []);

    const addComment = useCallback(async (authorId: string, authorName: string) => {
        if (!currentPost || !commentText.trim()) return;
        const postId = currentPost.id;
        try {
            const newComment = await ForumService.addComment({ postId, authorId, authorName, content: commentText });
            setCommentText('');
            setComments(prev => [newComment, ...prev]);
            setCurrentPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev);
        } catch (e: any) {
            setErrorMessage(e?.message ?? 'Failed to add comment. Please try again.');
        }
    }, [currentPost, commentText]);

    const toggleLike = useCallback(async (postId: string) => {
        try {
            const userId = auth.currentUser?.id ?? undefined;
            const updated = await ForumService.toggleLike(postId, userId);
            setPosts(prev => prev.map(p => p.id === postId ? updated : p));
            if (currentPost?.id === postId) setCurrentPost(updated);
        } catch { /* silent */ }
    }, [currentPost, auth]);

    const toggleCommentLike = useCallback(async (commentId: string) => {
        try {
            const updated = await ForumService.toggleCommentLike(commentId);
            setComments(prev => prev.map(c => c.id === commentId ? updated : c));
        } catch { /* silent */ }
    }, []);

    return (
        <ForumContext.Provider value={{
            posts, selectedCategory, currentPost, comments, isLoading, isLoadingComments,
            errorMessage, commentText, setCommentText,
            loadPosts, loadPost, filterByCategory, createPost, addComment, toggleLike, toggleCommentLike,
            clearError: () => setErrorMessage(null),
        }}>
            {children}
        </ForumContext.Provider>
    );
}

export function useForum(): ForumContextValue {
    const ctx = useContext(ForumContext);
    if (!ctx) throw new Error('useForum must be used within ForumProvider');
    return ctx;
}
