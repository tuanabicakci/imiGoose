import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, Image, KeyboardAvoidingView, Platform,
    Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForum } from '../../context/ForumContext';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ForumCategory, FORUM_CATEGORIES, forumCategoryIcon, MediaAttachment } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CreatePostScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { createPost } = useForum();
    const { currentUser } = useAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<ForumCategory | null>(null);
    const [media, setMedia] = useState<MediaAttachment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const canSubmit = title.trim().length > 0 && content.trim().length > 0 && category !== null;

    const handlePickMedia = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photos to attach media.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 5 - media.length,
        });

        if (!result.canceled && result.assets) {
            const newMedia: MediaAttachment[] = result.assets.map((asset, i) => ({
                id: `local-${Date.now()}-${i}`,
                uri: asset.uri,
                type: (asset.type === 'video' ? 'video' : 'image') as 'image' | 'video',
                width: asset.width,
                height: asset.height,
            }));
            setMedia(prev => [...prev, ...newMedia].slice(0, 5));
        }
    };

    const handleRemoveMedia = (id: string) => {
        setMedia(prev => prev.filter(m => m.id !== id));
    };

    const handleSubmit = async () => {
        if (!canSubmit || !currentUser || !category) return;
        setIsSubmitting(true);
        const success = await createPost(
            title.trim(),
            content.trim(),
            category,
            undefined,
            currentUser.id,
            `${currentUser.firstName} ${currentUser.lastName}`,
            media.length > 0 ? media : undefined
        );
        setIsSubmitting(false);
        if (success) {
            router.back();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="close" size={24} color={Colors.imiTextPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Post</Text>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    style={[styles.postBtn, (!canSubmit || isSubmitting) && styles.postBtnDisabled]}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                        <Text style={styles.postBtnText}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Category Selector */}
                <TouchableOpacity
                    style={styles.categorySelector}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                    {category ? (
                        <View style={styles.selectedCategory}>
                            <Ionicons name={forumCategoryIcon(category) as any} size={14} color={Colors.imiPrimary} />
                            <Text style={styles.selectedCategoryText}>{category}</Text>
                        </View>
                    ) : (
                        <Text style={styles.categorySelectorPlaceholder}>Select a category</Text>
                    )}
                    <Ionicons name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.imiTextMuted} />
                </TouchableOpacity>

                {showCategoryPicker && (
                    <View style={styles.categoryGrid}>
                        {FORUM_CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryOption, category === cat && styles.categoryOptionActive]}
                                onPress={() => {
                                    setCategory(cat);
                                    setShowCategoryPicker(false);
                                }}
                            >
                                <Ionicons
                                    name={forumCategoryIcon(cat) as any}
                                    size={14}
                                    color={category === cat ? Colors.white : Colors.imiPrimary}
                                />
                                <Text style={[styles.categoryOptionText, category === cat && styles.categoryOptionTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Title */}
                <TextInput
                    style={styles.titleInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Give your post a title..."
                    placeholderTextColor={Colors.imiTextMuted}
                    maxLength={120}
                    multiline
                />

                {/* Body */}
                <TextInput
                    style={styles.bodyInput}
                    value={content}
                    onChangeText={setContent}
                    placeholder="Share your thoughts, questions, or experiences..."
                    placeholderTextColor={Colors.imiTextMuted}
                    multiline
                    textAlignVertical="top"
                />

                {/* Media Preview */}
                {media.length > 0 && (
                    <View style={styles.mediaPreviewRow}>
                        {media.map(item => (
                            <View key={item.id} style={styles.mediaPreviewItem}>
                                <Image source={{ uri: item.uri }} style={styles.mediaPreviewImage} />
                                <TouchableOpacity
                                    style={styles.mediaRemoveBtn}
                                    onPress={() => handleRemoveMedia(item.id)}
                                >
                                    <Ionicons name="close-circle" size={22} color={Colors.imiError} />
                                </TouchableOpacity>
                                {item.type === 'video' && (
                                    <View style={styles.videoOverlay}>
                                        <Ionicons name="play-circle" size={28} color={Colors.white} />
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Bottom toolbar */}
            <View style={[styles.toolbar, { paddingBottom: insets.bottom + 8 }]}>
                <TouchableOpacity
                    style={styles.toolbarBtn}
                    onPress={handlePickMedia}
                    disabled={media.length >= 5}
                >
                    <Ionicons
                        name="image-outline"
                        size={22}
                        color={media.length >= 5 ? Colors.imiTextMuted : Colors.imiPrimary}
                    />
                    <Text style={[styles.toolbarBtnText, media.length >= 5 && { color: Colors.imiTextMuted }]}>
                        Photo/Video
                    </Text>
                </TouchableOpacity>
                <Text style={styles.mediaHint}>
                    {media.length > 0 ? `${media.length}/5 attached` : 'Up to 5 files'}
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingBottom: 12,
        backgroundColor: Colors.white,
        borderBottomWidth: 1, borderBottomColor: Colors.imiBorder,
    },
    headerBtn: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.imiTextPrimary },
    postBtn: {
        backgroundColor: Colors.imiPrimary, borderRadius: 20,
        paddingHorizontal: 20, paddingVertical: 8,
        minWidth: 70, alignItems: 'center',
    },
    postBtnDisabled: { opacity: 0.4 },
    postBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
    content: { padding: 20, gap: 12, paddingBottom: 24 },
    categorySelector: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
        borderWidth: 1, borderColor: Colors.imiBorder,
    },
    categorySelectorPlaceholder: { fontSize: 14, color: Colors.imiTextMuted },
    selectedCategory: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    selectedCategoryText: { fontSize: 14, fontWeight: '600', color: Colors.imiPrimary },
    categoryGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 8,
        backgroundColor: Colors.white, borderRadius: 12, padding: 12,
        borderWidth: 1, borderColor: Colors.imiBorder,
    },
    categoryOption: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1.5, borderColor: `${Colors.imiPrimary}25`,
        backgroundColor: Colors.white,
    },
    categoryOptionActive: { backgroundColor: Colors.imiPrimary, borderColor: Colors.imiPrimary },
    categoryOptionText: { fontSize: 13, color: Colors.imiPrimary, fontWeight: '500' },
    categoryOptionTextActive: { color: Colors.white },
    titleInput: {
        fontSize: 20, fontWeight: '700', color: Colors.imiTextPrimary,
        backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
        borderWidth: 1, borderColor: Colors.imiBorder,
        minHeight: 56,
    },
    bodyInput: {
        fontSize: 15, color: Colors.imiTextPrimary, lineHeight: 22,
        backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
        borderWidth: 1, borderColor: Colors.imiBorder,
        minHeight: 160,
    },
    mediaPreviewRow: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    },
    mediaPreviewItem: {
        width: (SCREEN_WIDTH - 70) / 3,
        height: (SCREEN_WIDTH - 70) / 3,
        borderRadius: 10, overflow: 'hidden',
    },
    mediaPreviewImage: { width: '100%', height: '100%' },
    mediaRemoveBtn: {
        position: 'absolute', top: 4, right: 4,
        backgroundColor: Colors.white, borderRadius: 11,
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    toolbar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 12,
        backgroundColor: Colors.white,
        borderTopWidth: 1, borderTopColor: Colors.imiBorder,
    },
    toolbarBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    toolbarBtnText: { fontSize: 14, fontWeight: '600', color: Colors.imiPrimary },
    mediaHint: { fontSize: 12, color: Colors.imiTextMuted },
});
