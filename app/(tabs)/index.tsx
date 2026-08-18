import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, RefreshControl,
    TouchableOpacity, ActivityIndicator, Linking, Modal,
    SafeAreaView, Pressable, TextInput,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { IMIHeaderBar } from '../../components/IMIHeaderBar';
import { ImmigrationStreamPicker } from '../../components/ImmigrationStreamPicker';
import { NewsService } from '../../services/NewsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import {
    NewsItem,
    ImmigrationStream,
    IMMIGRATION_STREAMS
} from '../../types';
import { getPathway } from '../../lib/pathways/pathway_lib';
import { PathwayService } from '../../services/PathwayService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
    const { currentUser, crsProfile, updateImmigrationStream, updateNocCode } = useAuth();
    const router = useRouter();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [showPathwayPicker, setShowPathwayPicker] = useState(false);
    const [showNocModal, setShowNocModal] = useState(false);
    const [savedCrsScore, setSavedCrsScore] = useState<number | null>(null);
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

    useFocusEffect(useCallback(() => {
        AsyncStorage.getItem('crs_calculated_score').then(val => {
            if (val) setSavedCrsScore(Number(val));
        }).catch(() => { });

        const stream = currentUser?.immigrationStream;
        const pathway = stream ? getPathway(stream) : null;
        if (currentUser && pathway) {
            PathwayService.loadProgress(currentUser.id, pathway.id)
                .then(setCompletedSteps)
                .catch(() => { });
        }
    }, [currentUser?.id, currentUser?.immigrationStream]));

    const loadNews = useCallback(async () => {
        const items = await NewsService.fetchNews();
        setNews(items);
        setLastUpdated(new Date());
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await NewsService.refresh().then(items => {
            setNews(items);
            setLastUpdated(new Date());
        });
        setIsRefreshing(false);
    };

    useEffect(() => { loadNews(); }, []);

    const user = currentUser;
    const firstName = user?.firstName ?? 'friend';
    const hasStream = !!crsProfile?.immigrationStream;

    const pathway = hasStream ? getPathway(crsProfile!.immigrationStream!) : null;
    const totalSteps = pathway?.stages.reduce((s, st) => s + st.steps.length, 0) ?? 0;
    const completedCount = pathway?.stages.reduce(
        (s, st) => s + st.steps.filter(step => completedSteps.has(step.id)).length, 0
    ) ?? 0;
    const progressRatio = totalSteps > 0 ? completedCount / totalSteps : 0;
    const nextStep = pathway?.stages.flatMap(st => st.steps).find(step => !completedSteps.has(step.id));

    const handleSelectStream = async (stream: ImmigrationStream) => {
        await updateImmigrationStream(stream);
        setShowPathwayPicker(false);
    };

    return (
        <View style={styles.screen}>
            <IMIHeaderBar notificationCount={2} />
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.imiPrimary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome */}
                <View style={styles.welcomeRow}>
                    <Text style={styles.welcomeText}>
                        Welcome <Text style={styles.welcomeName}>{firstName},</Text>
                    </Text>
                    <Text style={styles.welcomeSub}>Your Journey</Text>
                </View>

                {/* Pathway Progress Card or Select Pathway CTA */}
                {hasStream ? (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push('/(tabs)/pathways' as any)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardTitleRow}>
                            <Text style={styles.cardTitle}>Your Roadmap</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={styles.streamBadge}>
                                    <Ionicons
                                        name={IMMIGRATION_STREAMS[crsProfile!.immigrationStream!].icon as any}
                                        size={12}
                                        color={Colors.imiPrimary}
                                    />
                                    <Text style={styles.streamBadgeText}>{pathway?.id}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={Colors.imiTextMuted} />
                            </View>
                        </View>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${Math.round(progressRatio * 100)}%` as any }]} />
                        </View>
                        <View style={styles.progressRow}>
                            <Text style={styles.progressText}>{completedCount} of {totalSteps} steps complete</Text>
                            <Text style={styles.progressPct}>{Math.round(progressRatio * 100)}%</Text>
                        </View>
                        {nextStep && (
                            <View style={styles.nextStepRow}>
                                <Ionicons name="arrow-forward-circle-outline" size={15} color={Colors.imiPrimary} />
                                <Text style={styles.nextStepText} numberOfLines={1}>Next: {nextStep.title}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.selectPathwayCard}
                        onPress={() => setShowPathwayPicker(true)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.selectPathwayIcon}>
                            <Ionicons name="map" size={28} color={Colors.imiPrimary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.selectPathwayTitle}>Your Journey Awaits</Text>
                            <Text style={styles.selectPathwaySub}>Select a pathway to start your journey</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.imiPrimary} />
                    </TouchableOpacity>
                )}

                {/* Forum Entry Card */}
                <TouchableOpacity style={styles.forumCard} onPress={() => router.push('/(tabs)/community' as any)}>
                    <View>
                        <Text style={styles.forumTitle}>Community Forum</Text>
                        <Text style={styles.forumSub}>Connect with fellow immigrants →</Text>
                    </View>
                    <Ionicons name="chatbubbles" size={36} color={Colors.white} />
                </TouchableOpacity>

                {/* CRS + NOC cards */}
                <View style={styles.statsRow}>
                    <TouchableOpacity
                        style={[styles.statsCard, styles.statsCardPrimary]}
                        onPress={() => router.push('/calculator' as any)}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.statsLabel}>CRS Score</Text>
                        <Text style={styles.statsValue}>
                            {savedCrsScore ?? user?.crsScore ?? '—'}
                        </Text>
                        <Text style={styles.statsHint}>
                            {savedCrsScore ? `of 1,200 pts · tap to recalculate` : 'Tap to calculate ›'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statsCard, styles.statsCardSecondary]}
                        onPress={() => setShowNocModal(true)}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.statsLabel}>NOC Code</Text>
                        <Text style={styles.statsValue}>{user?.nocCode ?? '—'}</Text>
                        <Text style={styles.statsHint} numberOfLines={1}>
                            {user?.occupation ?? 'Tap to set ›'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* News Feed */}
                <View style={styles.feedHeader}>
                    <Text style={styles.feedTitle}>Your Feed</Text>
                    <TouchableOpacity onPress={handleRefresh}>
                        <Ionicons name="refresh" size={18} color={Colors.imiPrimary} />
                    </TouchableOpacity>
                </View>

                {news.length === 0 ? (
                    <ActivityIndicator color={Colors.imiPrimary} style={{ marginTop: 20 }} />
                ) : (
                    news.map(item => <NewsCard key={item.id} item={item} />)
                )}
            </ScrollView>

            {/* NOC Code Modal */}
            <NocModal
                visible={showNocModal}
                onClose={() => setShowNocModal(false)}
                currentNocCode={user?.nocCode}
                currentOccupation={user?.occupation}
                onSave={async (code, occupation) => {
                    await updateNocCode(code, occupation);
                    setShowNocModal(false);
                }}
            />

            {/* Pathway Picker Modal */}
            <PathwayPickerModal
                visible={showPathwayPicker}
                onClose={() => setShowPathwayPicker(false)}
                onSelect={handleSelectStream}
            />
        </View>
    );
}

// ─── NOC Modal ───

const TEER_INFO: Record<number, { label: string; desc: string; eligible: string; color: string }> = {
    0: {
        label: 'TEER 0',
        desc: 'Management occupations',
        eligible: 'Eligible for Express Entry (FSW, CEC, FST)',
        color: '#10B981',
    },
    1: {
        label: 'TEER 1',
        desc: 'Requires university degree',
        eligible: 'Eligible for Express Entry (FSW, CEC)',
        color: '#3B82F6',
    },
    2: {
        label: 'TEER 2',
        desc: 'Requires college diploma or apprenticeship (2+ years)',
        eligible: 'Eligible for Express Entry (CEC, FST)',
        color: '#6366F1',
    },
    3: {
        label: 'TEER 3',
        desc: 'Requires college diploma or apprenticeship (under 2 years)',
        eligible: 'Eligible for Express Entry (CEC, FST)',
        color: '#F59E0B',
    },
    4: {
        label: 'TEER 4',
        desc: 'Requires secondary school or occupation-specific training',
        eligible: 'Limited Express Entry eligibility — consider PNP',
        color: '#F97316',
    },
    5: {
        label: 'TEER 5',
        desc: 'Short-term work demonstration or no formal requirements',
        eligible: 'Not eligible for most federal immigration streams',
        color: '#EF4444',
    },
};

function deriveTeer(code: string): number | null {
    const clean = code.trim();
    if (clean.length === 5 && /^\d{5}$/.test(clean)) {
        return parseInt(clean[1], 10);
    }
    return null;
}

function NocModal({
    visible, onClose, currentNocCode, currentOccupation, onSave,
}: {
    visible: boolean;
    onClose: () => void;
    currentNocCode?: string;
    currentOccupation?: string;
    onSave: (nocCode: string, occupation: string) => Promise<void>;
}) {
    const [nocCode, setNocCode] = useState(currentNocCode ?? '');
    const [occupation, setOccupation] = useState(currentOccupation ?? '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (visible) {
            setNocCode(currentNocCode ?? '');
            setOccupation(currentOccupation ?? '');
        }
    }, [visible, currentNocCode, currentOccupation]);

    const teer = deriveTeer(nocCode);
    const teerInfo = teer !== null ? TEER_INFO[teer] : null;
    const canSave = nocCode.trim().length > 0 && occupation.trim().length > 0;

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        await onSave(nocCode.trim(), occupation.trim());
        setIsSaving(false);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={nocModalStyles.container}>
                <View style={nocModalStyles.header}>
                    <Text style={nocModalStyles.title}>NOC Code</Text>
                    <Pressable onPress={onClose} style={nocModalStyles.closeBtn}>
                        <Ionicons name="close" size={22} color={Colors.imiTextSecondary} />
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={nocModalStyles.content} keyboardShouldPersistTaps="handled">
                    <Text style={nocModalStyles.explainer}>
                        Your National Occupational Classification (NOC) code identifies your occupation and determines which Canadian immigration streams you qualify for.
                    </Text>

                    <TouchableOpacity
                        style={nocModalStyles.lookupBtn}
                        onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/find-national-occupation-code.html')}
                    >
                        <Ionicons name="search" size={15} color={Colors.imiPrimary} />
                        <Text style={nocModalStyles.lookupBtnText}>Look up my NOC code on IRCC ↗</Text>
                    </TouchableOpacity>

                    <Text style={nocModalStyles.inputLabel}>NOC 2021 Code (5 digits)</Text>
                    <TextInput
                        style={nocModalStyles.input}
                        value={nocCode}
                        onChangeText={v => setNocCode(v.replace(/\D/g, '').slice(0, 5))}
                        placeholder="e.g. 21232"
                        placeholderTextColor={Colors.imiTextMuted}
                        keyboardType="number-pad"
                        maxLength={5}
                    />

                    {teerInfo && (
                        <View style={[nocModalStyles.teerCard, { borderLeftColor: teerInfo.color }]}>
                            <View style={nocModalStyles.teerHeader}>
                                <View style={[nocModalStyles.teerBadge, { backgroundColor: `${teerInfo.color}18` }]}>
                                    <Text style={[nocModalStyles.teerBadgeText, { color: teerInfo.color }]}>{teerInfo.label}</Text>
                                </View>
                                <Text style={nocModalStyles.teerDesc}>{teerInfo.desc}</Text>
                            </View>
                            <View style={nocModalStyles.teerEligRow}>
                                <Ionicons name="checkmark-circle" size={14} color={teerInfo.color} />
                                <Text style={[nocModalStyles.teerEligText, { color: teerInfo.color }]}>{teerInfo.eligible}</Text>
                            </View>
                        </View>
                    )}

                    <Text style={nocModalStyles.inputLabel}>Occupation Title</Text>
                    <TextInput
                        style={nocModalStyles.input}
                        value={occupation}
                        onChangeText={setOccupation}
                        placeholder="e.g. Software Engineer"
                        placeholderTextColor={Colors.imiTextMuted}
                        autoCapitalize="words"
                    />
                </ScrollView>

                <View style={nocModalStyles.footer}>
                    <TouchableOpacity
                        style={[nocModalStyles.saveBtn, !canSave && nocModalStyles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={!canSave || isSaving}
                    >
                        {isSaving
                            ? <ActivityIndicator color={Colors.white} />
                            : <Text style={nocModalStyles.saveBtnText}>Save</Text>
                        }
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

// ─── Pathway Picker Modal ───

function PathwayPickerModal({
    visible,
    onClose,
    onSelect,
}: {
    visible: boolean;
    onClose: () => void;
    onSelect: (stream: ImmigrationStream) => void;
}) {
    const [selected, setSelected] = useState<ImmigrationStream | null>(null);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={modalStyles.container}>
                <View style={modalStyles.header}>
                    <Text style={modalStyles.title}>Choose Your Immigration Pathway</Text>
                    <Pressable onPress={onClose} style={modalStyles.closeBtn}>
                        <Ionicons name="close" size={22} color={Colors.imiTextSecondary} />
                    </Pressable>
                </View>
                <Text style={modalStyles.subtitle}>This helps us personalise your journey and documents checklist.</Text>
                <ScrollView contentContainerStyle={modalStyles.list}>
                    <ImmigrationStreamPicker
                        selected={selected ?? undefined}
                        onSelect={setSelected}
                    />
                </ScrollView>
                <View style={modalStyles.footer}>
                    <TouchableOpacity
                        style={[modalStyles.confirmBtn, !selected && modalStyles.confirmBtnDisabled]}
                        onPress={() => selected && onSelect(selected)}
                        disabled={!selected}
                    >
                        <Text style={modalStyles.confirmBtnText}>Confirm Pathway</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

function NewsCard({ item }: { item: NewsItem }) {
    const timeDiff = Math.floor((Date.now() - item.publishedAt.getTime()) / (1000 * 60 * 60));
    const timeAgo = timeDiff < 24 ? `${timeDiff}h ago` : `${Math.floor(timeDiff / 24)}d ago`;
    return (
        <TouchableOpacity style={styles.newsCard} onPress={() => Linking.openURL(item.url)} activeOpacity={0.85}>
            <View style={styles.newsBadge}>
                <Text style={styles.newsBadgeText}>{item.category}</Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
            <View style={styles.newsMeta}>
                <Text style={styles.newsSource}>{item.source}</Text>
                <Text style={styles.newsTime}>{timeAgo}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    content: { padding: 16, paddingBottom: 100, gap: 16 },
    welcomeRow: { gap: 2 },
    welcomeText: { fontSize: 22, fontWeight: '500', color: Colors.imiTextPrimary },
    welcomeName: { fontWeight: '700', color: Colors.imiPrimary },
    welcomeSub: { fontSize: 17, fontWeight: '600', color: Colors.imiTextPrimary },
    card: {
        backgroundColor: Colors.white, borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.imiTextSecondary },
    streamBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: `${Colors.imiPrimary}12`, borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    streamBadgeText: { fontSize: 11, color: Colors.imiPrimary, fontWeight: '600' },
    selectPathwayCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderWidth: 1.5,
        borderColor: `${Colors.imiPrimary}30`,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    selectPathwayIcon: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: `${Colors.imiPrimary}12`,
        alignItems: 'center', justifyContent: 'center',
    },
    selectPathwayTitle: { fontSize: 15, fontWeight: '700', color: Colors.imiTextPrimary },
    selectPathwaySub: { fontSize: 13, color: Colors.imiTextMuted, marginTop: 2 },
    progressTrack: {
        height: 7, borderRadius: 4, backgroundColor: `${Colors.imiPrimary}18`,
        overflow: 'hidden', marginBottom: 6,
    },
    progressFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.imiPrimary },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressText: { fontSize: 12, color: Colors.imiTextSecondary },
    progressPct: { fontSize: 12, fontWeight: '700', color: Colors.imiPrimary },
    nextStepRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
        backgroundColor: `${Colors.imiPrimary}08`, borderRadius: 8, padding: 8,
    },
    nextStepText: { fontSize: 12, color: Colors.imiPrimary, fontWeight: '500', flex: 1 },
    forumCard: {
        backgroundColor: Colors.imiPrimary,
        borderRadius: 16, padding: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    forumTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
    forumSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: 12 },
    statsCard: {
        flex: 1, borderRadius: 12, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    statsCardPrimary: { backgroundColor: Colors.imiPrimary },
    statsCardSecondary: { backgroundColor: Colors.imiSecondary },
    statsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
    statsValue: { fontSize: 28, fontWeight: '700', color: Colors.white },
    statsHint: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    feedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    feedTitle: { fontSize: 18, fontWeight: '700', color: Colors.imiTextPrimary },
    newsCard: {
        backgroundColor: Colors.white, borderRadius: 12, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, gap: 8,
    },
    newsBadge: {
        alignSelf: 'flex-start',
        backgroundColor: `${Colors.imiPrimary}15`,
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
    },
    newsBadgeText: { fontSize: 11, color: Colors.imiPrimary, fontWeight: '600' },
    newsTitle: { fontSize: 15, fontWeight: '600', color: Colors.imiTextPrimary, lineHeight: 20 },
    newsSummary: { fontSize: 13, color: Colors.imiTextSecondary, lineHeight: 18 },
    newsMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    newsSource: { fontSize: 12, color: Colors.imiTextMuted, fontWeight: '500' },
    newsTime: { fontSize: 12, color: Colors.imiTextMuted },
});

const nocModalStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.imiBackground },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
        backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.imiBorder,
    },
    title: { fontSize: 20, fontWeight: '700', color: Colors.imiTextPrimary },
    closeBtn: { padding: 4 },
    content: { padding: 20, gap: 12 },
    explainer: { fontSize: 14, color: Colors.imiTextSecondary, lineHeight: 20 },
    lookupBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        alignSelf: 'flex-start',
        backgroundColor: `${Colors.imiPrimary}12`,
        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    },
    lookupBtnText: { fontSize: 13, fontWeight: '600', color: Colors.imiPrimary },
    inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.imiTextSecondary, marginBottom: -4 },
    input: {
        backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.imiBorder,
        paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 16, color: Colors.imiTextPrimary,
    },
    teerCard: {
        backgroundColor: Colors.white, borderRadius: 12, padding: 14,
        borderLeftWidth: 4, gap: 8,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    teerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    teerBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
    teerBadgeText: { fontSize: 12, fontWeight: '700' },
    teerDesc: { fontSize: 13, color: Colors.imiTextSecondary, flex: 1 },
    teerEligRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    teerEligText: { fontSize: 12, fontWeight: '500', flex: 1 },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.imiBorder },
    saveBtn: {
        backgroundColor: Colors.imiPrimary, borderRadius: 14,
        paddingVertical: 16, alignItems: 'center',
    },
    saveBtnDisabled: { opacity: 0.45 },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});

const modalStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.imiBackground },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
    },
    title: { fontSize: 20, fontWeight: '700', color: Colors.imiTextPrimary, flex: 1 },
    closeBtn: { padding: 4 },
    subtitle: { fontSize: 13, color: Colors.imiTextMuted, paddingHorizontal: 20, marginBottom: 16 },
    list: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
    streamCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: Colors.white, borderRadius: 14, padding: 16,
        borderWidth: 1.5, borderColor: Colors.imiBorder,
    },
    streamCardSelected: { borderColor: Colors.imiPrimary, backgroundColor: `${Colors.imiPrimary}08` },
    iconBg: {
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: `${Colors.imiPrimary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    iconBgSelected: { backgroundColor: Colors.imiPrimary },
    streamName: { fontSize: 15, fontWeight: '600', color: Colors.imiTextPrimary },
    streamNameSelected: { color: Colors.imiPrimary },
    streamDesc: { fontSize: 12, color: Colors.imiTextMuted, marginTop: 3 },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.imiBorder },
    confirmBtn: {
        backgroundColor: Colors.imiPrimary, borderRadius: 14,
        paddingVertical: 16, alignItems: 'center',
    },
    confirmBtnDisabled: { opacity: 0.45 },
    confirmBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});

