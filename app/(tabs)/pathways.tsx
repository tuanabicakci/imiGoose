import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    ActivityIndicator, Linking, Alert, Modal,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { IMIHeaderBar } from '../../components/IMIHeaderBar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPathway, PathwayStep, PathwayStage } from '../../lib/pathways/pathway_lib';
import { PathwayService } from '../../services/PathwayService';
import { ImmigrationStream } from '../../types';
import { ImmigrationStreamPicker } from '../../components/ImmigrationStreamPicker';

export default function PathwaysScreen() {
    const { currentUser, updateImmigrationStream } = useAuth();
    const insets = useSafeAreaInsets();

    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [togglingStep, setTogglingStep] = useState<string | null>(null);
    const [showStreamPicker, setShowStreamPicker] = useState(false);

    const stream = currentUser?.immigrationStream ?? null;
    const pathway = stream ? getPathway(stream) : null;
    const pathwayKey = pathway?.id ?? null;

    const totalSteps = pathway?.stages.reduce((sum, s) => sum + s.steps.length, 0) ?? 0;
    const completedCount = pathway?.stages.reduce(
        (sum, s) => sum + s.steps.filter(step => completedSteps.has(step.id)).length,
        0
    ) ?? 0;
    const progress = totalSteps > 0 ? completedCount / totalSteps : 0;

    const loadProgress = useCallback(async () => {
        if (!currentUser || !pathwayKey) { setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const loaded = await PathwayService.loadProgress(currentUser.id, pathwayKey);
            setCompletedSteps(loaded);
        } catch {
            // silently fall back to empty state
        }
        setIsLoading(false);
    }, [currentUser?.id, pathwayKey]);

    useEffect(() => { loadProgress(); }, [loadProgress]);

    const handleToggleStep = async (stepId: string) => {
        if (!currentUser || !pathwayKey || togglingStep) return;
        const wasCompleted = completedSteps.has(stepId);
        const next = new Set(completedSteps);
        wasCompleted ? next.delete(stepId) : next.add(stepId);
        setCompletedSteps(next);
        setTogglingStep(stepId);
        try {
            await PathwayService.setStepCompleted(currentUser.id, pathwayKey, stepId, !wasCompleted);
        } catch {
            setCompletedSteps(completedSteps);
            Alert.alert('Error', 'Could not save progress. Please try again.');
        }
        setTogglingStep(null);
    };

    const handleOpenUrl = (url: string) => {
        Linking.openURL(url).catch(() =>
            Alert.alert('Could not open link', 'Please check your internet connection.')
        );
    };

    const handleStreamChange = async (newStream: ImmigrationStream) => {
        setShowStreamPicker(false);
        setCompletedSteps(new Set());
        await updateImmigrationStream(newStream);
    };

    return (
        <View style={styles.screen}>
            <IMIHeaderBar />

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Title row */}
                <View style={styles.titleRow}>
                    <View>
                        <Text style={styles.screenTitle}>Your Roadmap</Text>
                        <Text style={styles.screenSubtitle}>Track your immigration journey</Text>
                    </View>
                </View>

                {/* Stream selector */}
                <TouchableOpacity style={styles.streamCard} onPress={() => setShowStreamPicker(true)} activeOpacity={0.85}>
                    <View style={styles.streamCardLeft}>
                        <View style={styles.streamIconBox}>
                            <Ionicons name="map" size={20} color={Colors.imiPrimary} />
                        </View>
                        <View style={styles.streamCardText}>
                            <Text style={styles.streamLabel}>Immigration Stream</Text>
                            <Text style={styles.streamName} numberOfLines={1}>
                                {stream ?? 'Select a stream'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.changeBtn}>
                        <Text style={styles.changeBtnText}>Change</Text>
                    </View>
                </TouchableOpacity>

                {!pathway && !isLoading && (
                    <View style={styles.emptyState}>
                        <Ionicons name="map-outline" size={56} color={Colors.imiTextMuted} />
                        <Text style={styles.emptyTitle}>No Pathway Selected</Text>
                        <Text style={styles.emptyDesc}>
                            Tap "Select a stream" above to choose your immigration pathway and generate your personalized roadmap.
                        </Text>
                    </View>
                )}

                {isLoading && pathway && (
                    <ActivityIndicator color={Colors.imiPrimary} style={{ marginTop: 32 }} />
                )}

                {pathway && !isLoading && (
                    <>
                        {/* Progress summary */}
                        <View style={styles.progressCard}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressTitle}>Overall Progress</Text>
                                <Text style={styles.progressCount}>{completedCount}/{totalSteps} steps</Text>
                            </View>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                            </View>
                            <Text style={styles.progressPct}>{Math.round(progress * 100)}% complete</Text>
                        </View>

                        {/* Stages */}
                        {pathway.stages.map((stage, si) => (
                            <StageSection
                                key={stage.id}
                                stage={stage}
                                stageIndex={si + 1}
                                completedSteps={completedSteps}
                                togglingStep={togglingStep}
                                onToggle={handleToggleStep}
                                onOpenUrl={handleOpenUrl}
                            />
                        ))}
                    </>
                )}
            </ScrollView>

            <Modal
                visible={showStreamPicker}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowStreamPicker(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Choose Your Pathway</Text>
                        <TouchableOpacity onPress={() => setShowStreamPicker(false)} style={styles.modalCloseBtn}>
                            <Ionicons name="close" size={22} color={Colors.imiTextPrimary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <ImmigrationStreamPicker
                            selected={stream ?? undefined}
                            onSelect={handleStreamChange}
                        />
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

function StageSection({
    stage, stageIndex, completedSteps, togglingStep, onToggle, onOpenUrl,
}: {
    stage: PathwayStage;
    stageIndex: number;
    completedSteps: Set<string>;
    togglingStep: string | null;
    onToggle: (id: string) => void;
    onOpenUrl: (url: string) => void;
}) {
    const stageCompleted = stage.steps.filter(s => completedSteps.has(s.id)).length;
    const stageTotal = stage.steps.length;
    const allDone = stageCompleted === stageTotal;

    return (
        <View style={styles.stageContainer}>
            <View style={styles.stageHeader}>
                <View style={[styles.stageNumber, allDone && styles.stageNumberDone]}>
                    {allDone
                        ? <Ionicons name="checkmark" size={14} color={Colors.white} />
                        : <Text style={styles.stageNumberText}>{stageIndex}</Text>
                    }
                </View>
                <View style={styles.stageTitleBox}>
                    <Text style={styles.stageTitle}>{stage.title}</Text>
                    <Text style={styles.stageProgress}>{stageCompleted}/{stageTotal}</Text>
                </View>
            </View>

            <View style={styles.stageSteps}>
                {stage.steps.map((step, i) => (
                    <StepRow
                        key={step.id}
                        step={step}
                        isCompleted={completedSteps.has(step.id)}
                        isToggling={togglingStep === step.id}
                        isLast={i === stage.steps.length - 1}
                        onToggle={() => onToggle(step.id)}
                        onOpenUrl={onOpenUrl}
                    />
                ))}
            </View>
        </View>
    );
}

function StepRow({
    step, isCompleted, isToggling, isLast, onToggle, onOpenUrl,
}: {
    step: PathwayStep;
    isCompleted: boolean;
    isToggling: boolean;
    isLast: boolean;
    onToggle: () => void;
    onOpenUrl: (url: string) => void;
}) {
    return (
        <View style={[styles.stepRow, !isLast && styles.stepRowBorder]}>
            <TouchableOpacity
                style={styles.stepCheckbox}
                onPress={onToggle}
                disabled={isToggling}
                activeOpacity={0.7}
            >
                {isToggling ? (
                    <ActivityIndicator size="small" color={Colors.imiPrimary} />
                ) : (
                    <Ionicons
                        name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                        size={24}
                        color={isCompleted ? Colors.imiPrimary : Colors.imiTextMuted}
                    />
                )}
            </TouchableOpacity>
            <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, isCompleted && styles.stepTitleDone]}>
                    {step.title}
                </Text>
                <Text style={styles.stepDesc}>{step.description}</Text>
                {step.formUrl && (
                    <TouchableOpacity
                        style={styles.formBtn}
                        onPress={() => onOpenUrl(step.formUrl!)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="open-outline" size={13} color={Colors.imiPrimary} />
                        <Text style={styles.formBtnText}>{step.formLabel ?? 'Open Link'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    content: { padding: 20, gap: 16 },

    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    screenTitle: { fontSize: 24, fontWeight: '800', color: Colors.imiTextPrimary },
    screenSubtitle: { fontSize: 13, color: Colors.imiTextMuted, marginTop: 2 },

    streamCard: {
        backgroundColor: Colors.white, borderRadius: 14, padding: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderColor: Colors.imiBorder,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    streamCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    streamIconBox: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: `${Colors.imiPrimary}12`,
        alignItems: 'center', justifyContent: 'center',
    },
    streamCardText: { flex: 1 },
    streamLabel: { fontSize: 11, color: Colors.imiTextMuted, fontWeight: '500', marginBottom: 2 },
    streamName: { fontSize: 15, fontWeight: '700', color: Colors.imiTextPrimary },
    changeBtn: {
        backgroundColor: `${Colors.imiPrimary}15`, borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 6,
    },
    changeBtnText: { fontSize: 13, fontWeight: '700', color: Colors.imiPrimary },

    emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.imiTextPrimary },
    emptyDesc: { fontSize: 14, color: Colors.imiTextSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },

    progressCard: {
        backgroundColor: Colors.white, borderRadius: 14, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
        gap: 8,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressTitle: { fontSize: 14, fontWeight: '700', color: Colors.imiTextPrimary },
    progressCount: { fontSize: 13, fontWeight: '600', color: Colors.imiPrimary },
    progressTrack: {
        height: 8, borderRadius: 4, backgroundColor: `${Colors.imiPrimary}18`, overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.imiPrimary },
    progressPct: { fontSize: 12, color: Colors.imiTextMuted },

    stageContainer: {
        backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    stageHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.imiBorder,
    },
    stageNumber: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: `${Colors.imiPrimary}18`,
        alignItems: 'center', justifyContent: 'center',
    },
    stageNumberDone: { backgroundColor: Colors.imiPrimary },
    stageNumberText: { fontSize: 13, fontWeight: '700', color: Colors.imiPrimary },
    stageTitleBox: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    stageTitle: { fontSize: 15, fontWeight: '700', color: Colors.imiTextPrimary, flex: 1 },
    stageProgress: { fontSize: 12, color: Colors.imiTextMuted, marginLeft: 8 },

    stageSteps: { paddingHorizontal: 14 },
    stepRow: { flexDirection: 'row', gap: 12, paddingVertical: 14 },
    stepRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.imiBorder },
    stepCheckbox: { paddingTop: 1, width: 28, alignItems: 'center' },
    stepContent: { flex: 1, gap: 4 },
    stepTitle: { fontSize: 14, fontWeight: '600', color: Colors.imiTextPrimary, lineHeight: 20 },
    stepTitleDone: { color: Colors.imiTextMuted, textDecorationLine: 'line-through' },
    stepDesc: { fontSize: 13, color: Colors.imiTextSecondary, lineHeight: 18 },
    formBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        alignSelf: 'flex-start', marginTop: 4,
        backgroundColor: `${Colors.imiPrimary}12`,
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    },
    formBtnText: { fontSize: 12, fontWeight: '600', color: Colors.imiPrimary },

    modalContainer: { flex: 1, backgroundColor: Colors.imiBackground },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        backgroundColor: Colors.white,
        borderBottomWidth: 1, borderBottomColor: Colors.imiBorder,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.imiTextPrimary },
    modalCloseBtn: { padding: 4 },
    modalContent: { padding: 20, paddingBottom: 40 },
});
