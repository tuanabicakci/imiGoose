import React, { useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
    Image, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForum } from '../../context/ForumContext';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ForumPostDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { currentPost, comments, isLoading, isLoadingComments, commentText, setCommentText, loadPost, addComment, toggleLike, toggleCommentLike } = useForum();
    const { currentUser } = useAuth();

    useEffect(() => { if (id) loadPost(id as string); }, [id]);

    const handleAddComment = () => {
        if (!currentUser) return;
        addComment(currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`);
    };

    if (isLoading || !currentPost) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={Colors.imiPrimary} size="large" />
            </View>
        );
    }

    const hourAgo = Math.floor((Date.now() - currentPost.createdAt.getTime()) / 3600000);
    const timeStr = hourAgo < 1 ? 'Just now' : hourAgo < 24 ? `${hourAgo}h ago` : `${Math.floor(hourAgo / 24)}d ago`;
    const hasMedia = currentPost.mediaAttachments && currentPost.mediaAttachments.length > 0;

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Nav Bar */}
            <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.imiTextPrimary} />
                </TouchableOpacity>
                <Text style={styles.navTitle} numberOfLines={1}>Post</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Post */}
                <View style={styles.postCard}>
                    {/* Author */}
                    <View style={styles.postHeader}>
                        <View style={styles.authorAvatar}>
                            <Text style={styles.authorInitial}>{currentPost.authorName[0]}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.authorName}>{currentPost.authorName}</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.postTime}>{timeStr}</Text>
                                {currentPost.journeyStep && (
                                    <>
                                        <View style={styles.metaDot} />
                                        <Text style={styles.postTime}>{currentPost.journeyStep}</Text>
                                    </>
                                )}
                            </View>
                        </View>
                        <View style={styles.catBadge}>
                            <Text style={styles.catText}>{currentPost.category}</Text>
                        </View>
                    </View>

                    {/* Content */}
                    <Text style={styles.postTitle}>{currentPost.title}</Text>
                    <Text style={styles.postContent}>{currentPost.content}</Text>

                    {/* Media Gallery */}
                    {hasMedia && (
                        <View style={styles.mediaGallery}>
                            {currentPost.mediaAttachments!.map((media, index) => (
                                <Image
                                    key={media.id}
                                    source={{ uri: media.uri }}
                                    style={[
                                        currentPost.mediaAttachments!.length === 1
                                            ? styles.mediaSingleFull
                                            : styles.mediaGridItem,
                                    ]}
                                    resizeMode="cover"
                                />
                            ))}
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.divider} />
                    <View style={styles.postActions}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => toggleLike(currentPost.id)}
                        >
                            <Ionicons
                                name={currentPost.isLikedByUser ? 'heart' : 'heart-outline'}
                                size={20}
                                color={currentPost.isLikedByUser ? Colors.imiError : Colors.imiTextMuted}
                            />
                            <Text style={[styles.actionText, currentPost.isLikedByUser && { color: Colors.imiError }]}>
                                {currentPost.likesCount} {currentPost.likesCount === 1 ? 'like' : 'likes'}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.actionBtn}>
                            <Ionicons name="chatbubble-outline" size={18} color={Colors.imiTextMuted} />
                            <Text style={styles.actionText}>
                                {currentPost.commentsCount} {currentPost.commentsCount === 1 ? 'comment' : 'comments'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Comments Section */}
                <View style={styles.commentsSectionHeader}>
                    <Text style={styles.commentsTitle}>Comments</Text>
                    <View style={styles.commentCountBadge}>
                        <Text style={styles.commentCountText}>{comments.length}</Text>
                    </View>
                </View>

                {isLoadingComments ? (
                    <ActivityIndicator color={Colors.imiPrimary} style={{ marginTop: 20 }} />
                ) : comments.length === 0 ? (
                    <View style={styles.emptyComments}>
                        <Ionicons name="chatbubble-ellipses-outline" size={40} color={Colors.imiTextMuted} />
                        <Text style={styles.noComments}>No comments yet</Text>
                        <Text style={styles.noCommentsSub}>Be the first to share your thoughts!</Text>
                    </View>
                ) : (
                    comments.map(comment => {
                        const cHour = Math.floor((Date.now() - comment.createdAt.getTime()) / 3600000);
                        const cTime = cHour < 1 ? 'Just now' : cHour < 24 ? `${cHour}h ago` : `${Math.floor(cHour / 24)}d ago`;
                        return (
                            <View key={comment.id} style={styles.commentCard}>
                                <View style={styles.commentHeader}>
                                    <View style={styles.commentAvatar}>
                                        <Text style={styles.commentInitial}>{comment.authorName[0]}</Text>
                                    </View>
                                    <View style={styles.commentMeta}>
                                        <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                                        <Text style={styles.commentTime}>{cTime}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => toggleCommentLike(comment.id)} style={styles.commentLike}>
                                        <Ionicons
                                            name={comment.isLikedByUser ? 'heart' : 'heart-outline'}
                                            size={14}
                                            color={comment.isLikedByUser ? Colors.imiError : Colors.imiTextMuted}
                                        />
                                        <Text style={[styles.commentLikeText, comment.isLikedByUser && { color: Colors.imiError }]}>
                                            {comment.likesCount}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.commentContent}>{comment.content}</Text>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Comment input */}
            <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.commentInput}
                        value={commentText}
                        onChangeText={setCommentText}
                        placeholder="Write a comment..."
                        placeholderTextColor={Colors.imiTextMuted}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
                        onPress={handleAddComment}
                        disabled={!commentText.trim()}
                    >
                        <Ionicons name="send" size={18} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.imiBackground },
    navBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 16, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: Colors.imiBorder,
    },
    backBtn: { width: 40 },
    navTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.imiTextPrimary, textAlign: 'center' },
    content: { padding: 16, gap: 12, paddingBottom: 24 },
    postCard: {
        backgroundColor: Colors.white, borderRadius: 16, padding: 18,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    authorAvatar: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: `${Colors.imiPrimary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    authorInitial: { fontSize: 17, fontWeight: '700', color: Colors.imiPrimary },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 },
    metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.imiTextMuted },
    authorName: { fontSize: 15, fontWeight: '600', color: Colors.imiTextPrimary },
    postTime: { fontSize: 12, color: Colors.imiTextMuted },
    catBadge: {
        backgroundColor: `${Colors.imiPrimary}12`, borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    catText: { fontSize: 11, color: Colors.imiPrimary, fontWeight: '600' },
    postTitle: { fontSize: 18, fontWeight: '700', color: Colors.imiTextPrimary, lineHeight: 24, marginBottom: 6 },
    postContent: { fontSize: 15, color: Colors.imiTextSecondary, lineHeight: 22, marginBottom: 12 },
    // Media Gallery
    mediaGallery: {
        borderRadius: 12, overflow: 'hidden', gap: 4, marginBottom: 12,
    },
    mediaSingleFull: {
        width: '100%', height: 240, borderRadius: 12,
    },
    mediaGridItem: {
        width: '100%', height: 180, borderRadius: 10,
    },
    divider: { height: 1, backgroundColor: Colors.imiBorder, marginBottom: 10 },
    postActions: { flexDirection: 'row', gap: 24 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionText: { fontSize: 14, color: Colors.imiTextMuted, fontWeight: '500' },
    // Comments
    commentsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    commentsTitle: { fontSize: 17, fontWeight: '700', color: Colors.imiTextPrimary },
    commentCountBadge: {
        backgroundColor: `${Colors.imiPrimary}15`, borderRadius: 12,
        paddingHorizontal: 8, paddingVertical: 2,
    },
    commentCountText: { fontSize: 12, fontWeight: '700', color: Colors.imiPrimary },
    emptyComments: {
        alignItems: 'center', paddingVertical: 32, gap: 6,
    },
    noComments: { fontSize: 15, fontWeight: '600', color: Colors.imiTextSecondary },
    noCommentsSub: { fontSize: 13, color: Colors.imiTextMuted },
    commentCard: {
        backgroundColor: Colors.white, borderRadius: 14, padding: 14, gap: 8,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    commentAvatar: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: `${Colors.imiSecondary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    commentInitial: { fontSize: 13, fontWeight: '700', color: Colors.imiSecondary },
    commentMeta: { flex: 1 },
    commentAuthor: { fontSize: 13, fontWeight: '600', color: Colors.imiTextPrimary },
    commentTime: { fontSize: 11, color: Colors.imiTextMuted },
    commentLike: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    commentLikeText: { fontSize: 12, color: Colors.imiTextMuted },
    commentContent: { fontSize: 14, color: Colors.imiTextSecondary, lineHeight: 20, paddingLeft: 40 },
    // Input bar
    inputBar: {
        backgroundColor: Colors.white,
        paddingHorizontal: 12, paddingTop: 10,
        borderTopWidth: 1, borderTopColor: Colors.imiBorder,
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    },
    commentInput: {
        flex: 1, fontSize: 15, color: Colors.imiTextPrimary,
        backgroundColor: Colors.imiBackground,
        borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
        maxHeight: 100,
    },
    sendBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.imiPrimary,
        alignItems: 'center', justifyContent: 'center',
    },
    sendBtnDisabled: { backgroundColor: Colors.imiTextMuted },
});
