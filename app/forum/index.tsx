import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    FlatList, ActivityIndicator, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForum } from '../../context/ForumContext';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { IMIHeaderBar } from '../../components/IMIHeaderBar';
import { Ionicons } from '@expo/vector-icons';
import { ForumCategory, FORUM_CATEGORIES, ForumPost, forumCategoryIcon } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForumScreen() {
    const { posts, isLoading, selectedCategory, loadPosts, filterByCategory } = useForum();
    const router = useRouter();

    useEffect(() => { loadPosts(); }, []);

    return (
        <View style={styles.screen}>
            <IMIHeaderBar />
            {/* Category filter */}
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

            {isLoading ? (
                <ActivityIndicator color={Colors.imiPrimary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={p => p.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <PostCard post={item} onPress={() => router.push(`/forum/${item.id}` as any)} />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

function PostCard({ post, onPress }: { post: ForumPost; onPress: () => void }) {
    const hourAgo = Math.floor((Date.now() - post.createdAt.getTime()) / 3600000);
    const timeStr = hourAgo < 24 ? `${hourAgo}h ago` : `${Math.floor(hourAgo / 24)}d ago`;
    return (
        <TouchableOpacity style={styles.postCard} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.postHeader}>
                <View style={styles.authorAvatar}>
                    <Text style={styles.authorInitial}>{post.authorName[0]}</Text>
                </View>
                <View style={styles.postMeta}>
                    <Text style={styles.authorName}>{post.authorName}</Text>
                    <Text style={styles.postTime}>{timeStr}</Text>
                </View>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{post.category}</Text>
                </View>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
            <View style={styles.postFooter}>
                <View style={styles.postStat}>
                    <Ionicons name={post.isLikedByUser ? 'heart' : 'heart-outline'} size={14} color={post.isLikedByUser ? Colors.imiError : Colors.imiTextMuted} />
                    <Text style={styles.postStatText}>{post.likesCount}</Text>
                </View>
                <View style={styles.postStat}>
                    <Ionicons name="chatbubble-outline" size={14} color={Colors.imiTextMuted} />
                    <Text style={styles.postStatText}>{post.commentsCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    categoryRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 14, paddingVertical: 7,
        borderRadius: 20, borderWidth: 1, borderColor: Colors.imiPrimary,
        backgroundColor: Colors.white,
    },
    catChipActive: { backgroundColor: Colors.imiPrimary, borderColor: Colors.imiPrimary },
    catText: { fontSize: 13, color: Colors.imiPrimary, fontWeight: '500' },
    catTextActive: { color: Colors.white },
    list: { padding: 16, gap: 12 },
    postCard: {
        backgroundColor: Colors.white, borderRadius: 12, padding: 16, gap: 10,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    authorAvatar: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: `${Colors.imiPrimary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    authorInitial: { fontSize: 14, fontWeight: '700', color: Colors.imiPrimary },
    postMeta: { flex: 1 },
    authorName: { fontSize: 13, fontWeight: '600', color: Colors.imiTextPrimary },
    postTime: { fontSize: 11, color: Colors.imiTextMuted },
    categoryBadge: {
        backgroundColor: `${Colors.imiPrimary}12`,
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
    },
    categoryText: { fontSize: 11, color: Colors.imiPrimary, fontWeight: '600' },
    postTitle: { fontSize: 15, fontWeight: '700', color: Colors.imiTextPrimary, lineHeight: 20 },
    postContent: { fontSize: 13, color: Colors.imiTextSecondary, lineHeight: 18 },
    postFooter: { flexDirection: 'row', gap: 16 },
    postStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    postStatText: { fontSize: 13, color: Colors.imiTextMuted },
});
