import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    FlatList, ActivityIndicator, Image, Dimensions, RefreshControl,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForum } from '../../context/ForumContext';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { IMIHeaderBar } from '../../components/IMIHeaderBar';
import { Ionicons } from '@expo/vector-icons';
import { ForumCategory, FORUM_CATEGORIES, ForumPost, forumCategoryIcon } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_PREVIEW_SIZE = SCREEN_WIDTH - 64;

export default function CommunityScreen() {
    const { posts, isLoading, selectedCategory, loadPosts, filterByCategory, toggleLike } = useForum();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => { loadPosts(); }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadPosts();
        setIsRefreshing(false);
    }, [loadPosts]);

    return (
        <View style={styles.screen}>
            <IMIHeaderBar />
            {/* Title */}
            <View style={styles.titleRow}>
                <Text style={styles.screenTitle}>Community</Text>
                <Text style={styles.screenSubtitle}>Connect · Share · Support</Text>
            </View>
            {/* Category filter */}
            <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                <TouchableOpacity
                    style={[styles.catChip, !selectedCategory && styles.catChipActive]}
                    onPress={() => filterByCategory(null)}
                >
                    <Text style={[styles.catText, !selectedCategory && styles.catTextActive]}>All</Text>
                </TouchableOpacity>
                {FORUM_CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                        onPress={() => filterByCategory(cat)}
                    >
                        <Ionicons name={forumCategoryIcon(cat) as any} size={13} color={selectedCategory === cat ? Colors.white : Colors.imiPrimary} />
                        <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            </View>

            {isLoading && posts.length === 0 ? (
                <ActivityIndicator color={Colors.imiPrimary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={p => p.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.imiPrimary} />
                    }
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            onPress={() => router.push(`/forum/${item.id}` as any)}
                            onLike={() => toggleLike(item.id)}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB - Create Post */}
            <TouchableOpacity
                style={[styles.fab, { bottom: insets.bottom + 20 }]}
                onPress={() => router.push('/forum/create' as any)}
                activeOpacity={0.85}
            >
                <Ionicons name="add" size={28} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
}

function PostCard({ post, onPress, onLike }: { post: ForumPost; onPress: () => void; onLike: () => void }) {
    const hourAgo = Math.floor((Date.now() - post.createdAt.getTime()) / 3600000);
    const timeStr = hourAgo < 1 ? 'Just now' : hourAgo < 24 ? `${hourAgo}h ago` : `${Math.floor(hourAgo / 24)}d ago`;
    const hasMedia = post.mediaAttachments && post.mediaAttachments.length > 0;

    return (
        <TouchableOpacity style={styles.postCard} onPress={onPress} activeOpacity={0.9}>
            {/* Author row */}
            <View style={styles.postHeader}>
                <View style={styles.authorAvatar}>
                    <Text style={styles.authorInitial}>{post.authorName[0]}</Text>
                </View>
                <View style={styles.postMeta}>
                    <Text style={styles.authorName}>{post.authorName}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.postTime}>{timeStr}</Text>
                        {post.journeyStep && (
                            <>
                                <View style={styles.metaDot} />
                                <Text style={styles.postTime}>{post.journeyStep}</Text>
                            </>
                        )}
                    </View>
                </View>
                <View style={styles.categoryBadge}>
                    <Ionicons name={forumCategoryIcon(post.category) as any} size={10} color={Colors.imiPrimary} />
                    <Text style={styles.categoryText}>{post.category}</Text>
                </View>
            </View>

            {/* Content */}
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>

            {/* Media Previews */}
            {hasMedia && (
                <View style={styles.mediaContainer}>
                    {post.mediaAttachments!.length === 1 ? (
                        <Image
                            source={{ uri: post.mediaAttachments![0].uri }}
                            style={styles.mediaSingle}
                            resizeMode="cover"
                        />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
                            {post.mediaAttachments!.map((media, index) => (
                                <Image
                                    key={media.id}
                                    source={{ uri: media.uri }}
                                    style={[
                                        styles.mediaMultiple,
                                        index === post.mediaAttachments!.length - 1 && { marginRight: 0 },
                                    ]}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>
                    )}
                    {post.mediaAttachments!.length > 1 && (
                        <View style={styles.mediaCount}>
                            <Ionicons name="images" size={12} color={Colors.white} />
                            <Text style={styles.mediaCountText}>{post.mediaAttachments!.length}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Actions */}
            <View style={styles.postFooter}>
                <TouchableOpacity style={styles.postAction} onPress={onLike}>
                    <Ionicons
                        name={post.isLikedByUser ? 'heart' : 'heart-outline'}
                        size={18}
                        color={post.isLikedByUser ? Colors.imiError : Colors.imiTextMuted}
                    />
                    <Text style={[styles.postActionText, post.isLikedByUser && { color: Colors.imiError }]}>
                        {post.likesCount}
                    </Text>
                </TouchableOpacity>
                <View style={styles.postAction}>
                    <Ionicons name="chatbubble-outline" size={16} color={Colors.imiTextMuted} />
                    <Text style={styles.postActionText}>{post.commentsCount}</Text>
                </View>
                <View style={styles.postAction}>
                    <Ionicons name="share-outline" size={16} color={Colors.imiTextMuted} />
                    <Text style={styles.postActionText}>Share</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    titleRow: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
    screenTitle: { fontSize: 24, fontWeight: '800', color: Colors.imiTextPrimary },
    screenSubtitle: { fontSize: 13, color: Colors.imiTextMuted, marginTop: 2, letterSpacing: 0.3 },
    categoryContainer: { height: 56 },
    categoryRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: 'center' },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 24, borderWidth: 1.5, borderColor: `${Colors.imiPrimary}30`,
        backgroundColor: Colors.white,
    },
    catChipActive: { backgroundColor: Colors.imiPrimary, borderColor: Colors.imiPrimary },
    catText: { fontSize: 13, color: Colors.imiPrimary, fontWeight: '600' },
    catTextActive: { color: Colors.white },
    list: { padding: 16, gap: 14, paddingBottom: 100 },
    postCard: {
        backgroundColor: Colors.white, borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    authorAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: `${Colors.imiPrimary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    authorInitial: { fontSize: 16, fontWeight: '700', color: Colors.imiPrimary },
    postMeta: { flex: 1 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 },
    metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.imiTextMuted },
    authorName: { fontSize: 14, fontWeight: '600', color: Colors.imiTextPrimary },
    postTime: { fontSize: 12, color: Colors.imiTextMuted },
    categoryBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: `${Colors.imiPrimary}10`,
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    },
    categoryText: { fontSize: 11, color: Colors.imiPrimary, fontWeight: '600' },
    postTitle: { fontSize: 16, fontWeight: '700', color: Colors.imiTextPrimary, lineHeight: 22, marginBottom: 4 },
    postContent: { fontSize: 14, color: Colors.imiTextSecondary, lineHeight: 20, marginBottom: 8 },
    mediaContainer: { borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
    mediaSingle: {
        width: '100%', height: 200, borderRadius: 12,
    },
    mediaScroll: { borderRadius: 12 },
    mediaMultiple: {
        width: 200, height: 160, borderRadius: 10, marginRight: 8,
    },
    mediaCount: {
        position: 'absolute', top: 8, right: 8,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12,
        paddingHorizontal: 8, paddingVertical: 4,
    },
    mediaCountText: { fontSize: 12, color: Colors.white, fontWeight: '600' },
    divider: { height: 1, backgroundColor: Colors.imiBorder, marginBottom: 10 },
    postFooter: { flexDirection: 'row', gap: 24 },
    postAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    postActionText: { fontSize: 13, color: Colors.imiTextMuted, fontWeight: '500' },
    fab: {
        position: 'absolute', right: 20,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: Colors.imiPrimary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: Colors.imiPrimary, shadowOpacity: 0.4, shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
});
