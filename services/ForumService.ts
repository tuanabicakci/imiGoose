import { ForumPost, ForumComment, ForumCategory, MediaAttachment } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const now = new Date();
const MOCK_POSTS: ForumPost[] = [
    {
        id: 'post-001',
        authorId: 'user-001',
        authorName: 'Sarah Chen',
        title: 'Just received my ITA! 🎉',
        content: 'After 8 months in the Express Entry pool with a CRS of 489, I finally got my ITA today! So excited to start the PR application process. Any tips for document preparation?',
        category: 'Express Entry',
        journeyStep: 'Post-ITA',
        mediaAttachments: [
            { id: 'media-001', uri: 'https://picsum.photos/seed/ita-letter/800/600', type: 'image', width: 800, height: 600 },
        ],
        createdAt: new Date(now.getTime() - 3600000),
        updatedAt: new Date(now.getTime() - 3600000),
        likesCount: 24,
        commentsCount: 8,
        isLikedByUser: false,
    },
    {
        id: 'post-002',
        authorId: 'user-002',
        authorName: 'Michael Okonkwo',
        title: 'Ontario PNP - Human Capital Priorities Stream',
        content: 'Has anyone recently applied through the Ontario HCP stream? I\'m curious about the processing times and if there are any specific documents they request that aren\'t on the official list.',
        category: 'PNP',
        journeyStep: 'Pre-ITA',
        createdAt: new Date(now.getTime() - 7200000),
        updatedAt: new Date(now.getTime() - 7200000),
        likesCount: 15,
        commentsCount: 12,
        isLikedByUser: false,
    },
    {
        id: 'post-003',
        authorId: 'user-003',
        authorName: 'Priya Sharma',
        title: 'IELTS vs CELPIP - which test should I take?',
        content: 'I\'m preparing for my language test and unsure whether to go with IELTS or CELPIP. Would love to hear from people who have taken both. Here are my study resources so far.',
        category: 'General',
        mediaAttachments: [
            { id: 'media-002', uri: 'https://picsum.photos/seed/study-desk/800/600', type: 'image', width: 800, height: 600 },
            { id: 'media-003', uri: 'https://picsum.photos/seed/ielts-book/800/600', type: 'image', width: 800, height: 600 },
        ],
        createdAt: new Date(now.getTime() - 14400000),
        updatedAt: new Date(now.getTime() - 14400000),
        likesCount: 42,
        commentsCount: 28,
        isLikedByUser: true,
    },
    {
        id: 'post-004',
        authorId: 'user-004',
        authorName: 'Ahmed Hassan',
        title: 'Work permit extension timeline',
        content: 'My PGWP expires in 3 months and I\'m waiting for my PR application decision. Should I apply for a bridging open work permit now?',
        category: 'Work Permit',
        journeyStep: 'Application',
        createdAt: new Date(now.getTime() - 28800000),
        updatedAt: new Date(now.getTime() - 28800000),
        likesCount: 18,
        commentsCount: 6,
        isLikedByUser: false,
    },
    {
        id: 'post-005',
        authorId: 'user-005',
        authorName: 'Elena Rodriguez',
        title: 'Spousal sponsorship inland vs outland',
        content: 'My spouse is currently here on a visitor visa. Would it be better to apply for inland sponsorship or outland? What are the pros and cons?',
        category: 'Family Sponsorship',
        createdAt: new Date(now.getTime() - 43200000),
        updatedAt: new Date(now.getTime() - 43200000),
        likesCount: 31,
        commentsCount: 15,
        isLikedByUser: false,
    },
    {
        id: 'post-006',
        authorId: 'user-006',
        authorName: 'Li Wei',
        title: 'My journey from study permit to PR 🇨🇦',
        content: 'Wanted to share my 4-year journey from arriving in Canada as an international student to finally receiving my PR card last week. Here are some photos from the celebration!',
        category: 'General',
        mediaAttachments: [
            { id: 'media-004', uri: 'https://picsum.photos/seed/canada-flag/800/600', type: 'image', width: 800, height: 600 },
            { id: 'media-005', uri: 'https://picsum.photos/seed/celebration/800/600', type: 'image', width: 800, height: 600 },
            { id: 'media-006', uri: 'https://picsum.photos/seed/pr-card/800/600', type: 'image', width: 800, height: 600 },
        ],
        createdAt: new Date(now.getTime() - 86400000),
        updatedAt: new Date(now.getTime() - 86400000),
        likesCount: 156,
        commentsCount: 42,
        isLikedByUser: true,
    },
];

const MOCK_COMMENTS: ForumComment[] = [
    {
        id: 'c-001',
        postId: 'post-001',
        authorId: 'user-010',
        authorName: 'James Wilson',
        content: 'Congratulations! Make sure you get your police clearance certificates early - they can take a while depending on the country.',
        createdAt: new Date(now.getTime() - 1800000),
        likesCount: 5,
        isLikedByUser: false,
    },
    {
        id: 'c-002',
        postId: 'post-001',
        authorId: 'user-011',
        authorName: 'Ana Silva',
        content: 'That\'s amazing news! I\'m at 485 hoping to get mine soon too. Did you have any provincial nomination?',
        createdAt: new Date(now.getTime() - 2400000),
        likesCount: 3,
        isLikedByUser: false,
    },
    {
        id: 'c-003',
        postId: 'post-001',
        authorId: 'user-012',
        authorName: 'David Kim',
        content: 'Don\'t forget to book your medical exam ASAP. Upfront medicals can save you a lot of time in the process!',
        createdAt: new Date(now.getTime() - 3000000),
        likesCount: 8,
        isLikedByUser: false,
    },
    {
        id: 'c-004',
        postId: 'post-006',
        authorId: 'user-013',
        authorName: 'Fatima Al-Rashid',
        content: 'This is so inspiring! Congratulations on your PR! 🎉 How long did the PGWP to PR transition take?',
        createdAt: new Date(now.getTime() - 72000000),
        likesCount: 12,
        isLikedByUser: false,
    },
    {
        id: 'c-005',
        postId: 'post-003',
        authorId: 'user-014',
        authorName: 'Raj Patel',
        content: 'I took both and found CELPIP much more straightforward. The computer-based format felt more natural to me.',
        createdAt: new Date(now.getTime() - 10800000),
        likesCount: 7,
        isLikedByUser: true,
    },
];

const STORAGE_KEYS = {
    POSTS: 'imi_forum_posts',
    COMMENTS: 'imi_forum_comments',
};

// Date reviver for JSON parsing
function reviveDate(key: string, value: any) {
    if (value && typeof value === 'string' && (key === 'createdAt' || key === 'updatedAt')) {
        return new Date(value);
    }
    return value;
}

async function getPosts(): Promise<ForumPost[]> {
    try {
        const val = await AsyncStorage.getItem(STORAGE_KEYS.POSTS);
        if (val) {
            return JSON.parse(val, reviveDate);
        }
        // Initialize storage with mock posts
        await savePosts(MOCK_POSTS);
        return [...MOCK_POSTS];
    } catch (e) {
        console.warn('Failed to load posts from storage', e);
        return [...MOCK_POSTS];
    }
}

async function savePosts(posts: ForumPost[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch (e) {
        console.warn('Failed to save posts to storage', e);
    }
}

async function getComments(): Promise<ForumComment[]> {
    try {
        const val = await AsyncStorage.getItem(STORAGE_KEYS.COMMENTS);
        if (val) {
            return JSON.parse(val, reviveDate);
        }
        // Initialize storage with mock comments
        await saveComments(MOCK_COMMENTS);
        return [...MOCK_COMMENTS];
    } catch (e) {
        console.warn('Failed to load comments from storage', e);
        return [...MOCK_COMMENTS];
    }
}

async function saveComments(comments: ForumComment[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    } catch (e) {
        console.warn('Failed to save comments to storage', e);
    }
}

export const ForumService = {
    async fetchPosts(category?: ForumCategory | null): Promise<ForumPost[]> {
        // Try Supabase first for shared/global persistence
        try {
            const { data, error } = await supabase
                .from('forum_posts')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                // If Supabase returns no rows, fall back to local storage so users still see posts
                if ((data as any[]).length === 0) {
                    const local = await getPosts();
                    if (local && local.length > 0) {
                        return category ? local.filter(p => p.category === category) : local;
                    }
                    // otherwise return the empty array
                    return [];
                }

                const mapped = (data as any[]).map(row => ({
                    id: row.id,
                    authorId: row.author_id,
                    authorName: row.author_name,
                    title: row.title,
                    content: row.content,
                    category: row.category,
                    journeyStep: row.journey_step,
                    mediaAttachments: row.media_attachments ?? undefined,
                    createdAt: new Date(row.created_at),
                    updatedAt: new Date(row.updated_at ?? row.created_at),
                    likesCount: row.likes_count ?? 0,
                    commentsCount: row.comments_count ?? 0,
                    isLikedByUser: false,
                } as ForumPost));
                return category ? mapped.filter(p => p.category === category) : mapped;
            }
        } catch (e) {
            console.warn('Supabase fetchPosts failed, falling back to local storage', e);
        }

        await delay(600);
        const posts = await getPosts();
        if (!category) return posts;
        return posts.filter(p => p.category === category);
    },

    async fetchPost(id: string): Promise<ForumPost> {
        try {
            const { data, error } = await supabase.from('forum_posts').select('*').eq('id', id).maybeSingle();
            if (!error && data) {
                const row: any = data;
                return {
                    id: row.id,
                    authorId: row.author_id,
                    authorName: row.author_name,
                    title: row.title,
                    content: row.content,
                    category: row.category,
                    journeyStep: row.journey_step,
                    mediaAttachments: row.media_attachments ?? undefined,
                    createdAt: new Date(row.created_at),
                    updatedAt: new Date(row.updated_at ?? row.created_at),
                    likesCount: row.likes_count ?? 0,
                    commentsCount: row.comments_count ?? 0,
                    isLikedByUser: false,
                } as ForumPost;
            }
        } catch (e) {
            console.warn('Supabase fetchPost failed, falling back to local storage', e);
        }

        await delay(400);
        const posts = await getPosts();
        const post = posts.find(p => p.id === id);
        if (!post) throw new Error('Post not found');
        return post;
    },

    async fetchComments(postId: string): Promise<ForumComment[]> {
        try {
            const { data, error } = await supabase
                .from('forum_comments')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: false });
            if (!error && data) {
                return (data as any[]).map(row => ({
                    id: row.id,
                    postId: row.post_id,
                    authorId: row.author_id,
                    authorName: row.author_name,
                    content: row.content,
                    createdAt: new Date(row.created_at),
                    likesCount: row.likes_count ?? 0,
                    isLikedByUser: false,
                } as ForumComment));
            }
        } catch (e) {
            console.warn('Supabase fetchComments failed, falling back to local storage', e);
        }

        await delay(400);
        const comments = await getComments();
        return comments.filter(c => c.postId === postId);
    },

    async createPost(post: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'isLikedByUser'>): Promise<ForumPost> {
        // Try to persist to Supabase (global)
        try {
            const payload = {
                author_id: post.authorId,
                author_name: post.authorName,
                title: post.title,
                content: post.content,
                category: post.category,
                journey_step: post.journeyStep ?? null,
                media_attachments: post.mediaAttachments ?? null,
                likes_count: 0,
                comments_count: 0,
            };
            const { data, error } = await supabase.from('forum_posts').insert(payload).select().maybeSingle();
            if (error) {
                console.error('Supabase createPost error:', error);
                throw new Error(error.message || JSON.stringify(error));
            }
            if (data) {
                const row: any = data;
                return {
                    id: row.id,
                    authorId: row.author_id,
                    authorName: row.author_name,
                    title: row.title,
                    content: row.content,
                    category: row.category,
                    journeyStep: row.journey_step,
                    mediaAttachments: row.media_attachments ?? undefined,
                    createdAt: new Date(row.created_at),
                    updatedAt: new Date(row.updated_at ?? row.created_at),
                    likesCount: row.likes_count ?? 0,
                    commentsCount: row.comments_count ?? 0,
                    isLikedByUser: false,
                } as ForumPost;
            }
        } catch (e) {
            console.error('Supabase createPost failed, falling back to local storage', e);
            throw e;
        }

        await delay(800);
        const newPost: ForumPost = {
            ...post,
            id: `post-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            likesCount: 0,
            commentsCount: 0,
            isLikedByUser: false,
        };
        const posts = await getPosts();
        const updatedPosts = [newPost, ...posts];
        await savePosts(updatedPosts);
        return newPost;
    },

    async addComment(comment: Omit<ForumComment, 'id' | 'createdAt' | 'likesCount' | 'isLikedByUser'>): Promise<ForumComment> {
        // Try Supabase first
        try {
            const payload = {
                post_id: comment.postId,
                author_id: comment.authorId,
                author_name: comment.authorName,
                content: comment.content,
                likes_count: 0,
            };
            const { data, error } = await supabase.from('forum_comments').insert(payload).select().maybeSingle();
            if (error) {
                console.error('Supabase addComment error:', error);
                throw new Error(error.message || JSON.stringify(error));
            }
            if (data) {
                const row: any = data;
                // increment comments_count on post
                await supabase.from('forum_posts').update({ comments_count: (row.comments_count ?? 0) + 1 }).eq('id', comment.postId);
                return {
                    id: row.id,
                    postId: row.post_id,
                    authorId: row.author_id,
                    authorName: row.author_name,
                    content: row.content,
                    createdAt: new Date(row.created_at),
                    likesCount: row.likes_count ?? 0,
                    isLikedByUser: false,
                } as ForumComment;
            }
        } catch (e) {
            console.error('Supabase addComment failed, falling back to local storage', e);
            throw e;
        }

        await delay(600);
        const newComment: ForumComment = {
            ...comment,
            id: `c-${Date.now()}`,
            createdAt: new Date(),
            likesCount: 0,
            isLikedByUser: false,
        };
        const comments = await getComments();
        const updatedComments = [newComment, ...comments];
        await saveComments(updatedComments);

        // increment comment count locally
        const posts = await getPosts();
        const updatedPosts = posts.map(p =>
            p.id === comment.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
        );
        await savePosts(updatedPosts);

        return newComment;
    },

    async toggleLike(postId: string, userId?: string): Promise<ForumPost> {
        // If userId provided, try to toggle per-user like in Supabase (forum_post_likes)
        if (userId) {
            try {
                // Check if like exists
                const { data: existing, error: existErr } = await supabase
                    .from('forum_post_likes')
                    .select('*')
                    .eq('post_id', postId)
                    .eq('user_id', userId)
                    .maybeSingle();
                if (!existErr) {
                    if (existing) {
                        // remove like
                        await supabase.from('forum_post_likes').delete().eq('id', (existing as any).id);
                    } else {
                        // insert like
                        await supabase.from('forum_post_likes').insert({ post_id: postId, user_id: userId });
                    }
                    // compute new count and update post
                    const { count: likeCount } = await supabase.from('forum_post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId) as any;
                    await supabase.from('forum_posts').update({ likes_count: likeCount ?? 0 }).eq('id', postId);
                    // return updated post
                    const { data: updated, error: updErr } = await supabase.from('forum_posts').select('*').eq('id', postId).maybeSingle();
                    if (!updErr && updated) {
                        const row: any = updated;
                        return {
                            id: row.id,
                            authorId: row.author_id,
                            authorName: row.author_name,
                            title: row.title,
                            content: row.content,
                            category: row.category,
                            journeyStep: row.journey_step,
                            mediaAttachments: row.media_attachments ?? undefined,
                            createdAt: new Date(row.created_at),
                            updatedAt: new Date(row.updated_at ?? row.created_at),
                            likesCount: row.likes_count ?? 0,
                            commentsCount: row.comments_count ?? 0,
                            isLikedByUser: !!existing === false, // toggled
                        } as ForumPost;
                    }
                }
            } catch (e) {
                console.warn('Supabase per-user toggleLike failed, falling back to local storage', e);
            }
        }

        // Fallback: local toggle
        await delay(300);
        const posts = await getPosts();
        const updatedPosts = posts.map(p => {
            if (p.id !== postId) return p;
            return {
                ...p,
                isLikedByUser: !p.isLikedByUser,
                likesCount: p.isLikedByUser ? p.likesCount - 1 : p.likesCount + 1,
            };
        });
        await savePosts(updatedPosts);
        return updatedPosts.find(p => p.id === postId)!;
    },

    async toggleCommentLike(commentId: string): Promise<ForumComment> {
        // Supabase attempt
        try {
            const { data: rows, error: fetchErr } = await supabase.from('forum_comments').select('id, likes_count').eq('id', commentId).maybeSingle();
            if (!fetchErr && rows) {
                const current = (rows as any).likes_count ?? 0;
                const updatedCount = current + 1;
                const { data: updated, error: updErr } = await supabase.from('forum_comments').update({ likes_count: updatedCount }).eq('id', commentId).select().maybeSingle();
                if (!updErr && updated) {
                    const row: any = updated;
                    return {
                        id: row.id,
                        postId: row.post_id,
                        authorId: row.author_id,
                        authorName: row.author_name,
                        content: row.content,
                        createdAt: new Date(row.created_at),
                        likesCount: row.likes_count ?? 0,
                        isLikedByUser: false,
                    } as ForumComment;
                }
            }
        } catch (e) {
            console.warn('Supabase toggleCommentLike failed, falling back to local storage', e);
        }

        await delay(300);
        const comments = await getComments();
        const updatedComments = comments.map(c => {
            if (c.id !== commentId) return c;
            return {
                ...c,
                isLikedByUser: !c.isLikedByUser,
                likesCount: c.isLikedByUser ? c.likesCount - 1 : c.likesCount + 1,
            };
        });
        await saveComments(updatedComments);
        return updatedComments.find(c => c.id === commentId)!;
    },
};
