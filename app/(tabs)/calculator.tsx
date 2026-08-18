import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    SafeAreaView, Switch, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import {
    calculateCRS, CRSInput, CRSBreakdown,
    EducationLevel, CLBLevel, WorkYears, CanadianWorkYears,
    EDU_LABELS, FOREIGN_WORK_LABELS, CANADIAN_WORK_LABELS, CLB_OPTIONS,
    scoreBand,
} from '../../services/CRSCalculatorService';

// ─── Default input ────────────────────────────────────────────────────────────

const FALLBACK_DRAWS = [
    { id: '341', date: 'March 5, 2026', type: 'Senior Managers (Version 1)', score: 429, invitations: '250' },
    { id: '340', date: 'March 4, 2026', type: 'French-Language proficiency', score: 397, invitations: '5,500' },
    { id: '339', date: 'March 3, 2026', type: 'Canadian Experience Class', score: 508, invitations: '4,000' },
    { id: '338', date: 'March 2, 2026', type: 'Provincial Nominee Program', score: 710, invitations: '264' },
    { id: '337', date: 'February 20, 2026', type: 'Healthcare occupations', score: 467, invitations: '4,000' },
    { id: '336', date: 'February 19, 2026', type: 'Physicians (Canada Exp.)', score: 169, invitations: '45' },
];

const DEFAULT_INPUT: CRSInput = {
    hasSpouse: false,
    age: 28,
    educationLevel: 'bachelors',
    canadianEducation: 'none',
    firstLangListening: 9,
    firstLangSpeaking: 9,
    firstLangReading: 9,
    firstLangWriting: 9,
    hasSecondLang: false,
    foreignWorkYears: 'one',
    canadianWorkYears: 'none',
    hasProvincialNomination: false,
    hasJobOffer: false,
    jobOfferNocTeer: null,
    hasSiblingInCanada: false,
    hasCanadianFrench: false,
    hasPostSecondaryInCanada: false,
};

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
    { id: 'personal', title: 'Personal Info', icon: 'person' as const },
    { id: 'education', title: 'Education', icon: 'school' as const },
    { id: 'language', title: 'Language', icon: 'language' as const },
    { id: 'work', title: 'Work Experience', icon: 'briefcase' as const },
    { id: 'additional', title: 'Additional', icon: 'star' as const },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
    return <Text style={s.sectionTitle}>{children}</Text>;
}

function OptionRow<T extends string | number | null>({
    label, options, value, onChange,
}: { label: string; options: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) {
    return (
        <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
                {options.map(opt => (
                    <TouchableOpacity
                        key={String(opt.value)}
                        style={[s.chip, value === opt.value && s.chipActive]}
                        onPress={() => onChange(opt.value)}
                        activeOpacity={0.75}
                    >
                        <Text style={[s.chipText, value === opt.value && s.chipTextActive]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

function ToggleRow({ label, sublabel, value, onChange }: {
    label: string; sublabel?: string; value: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <View style={s.toggleRow}>
            <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>{label}</Text>
                {sublabel && <Text style={s.toggleSublabel}>{sublabel}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ true: Colors.imiPrimary, false: Colors.imiBorder }}
                thumbColor={Colors.white}
            />
        </View>
    );
}

function AgeSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Age</Text>
            <View style={s.ageRow}>
                <TouchableOpacity style={s.ageBtn} onPress={() => onChange(Math.max(17, value - 1))}>
                    <Ionicons name="remove" size={20} color={Colors.imiPrimary} />
                </TouchableOpacity>
                <Text style={s.ageValue}>{value}</Text>
                <TouchableOpacity style={s.ageBtn} onPress={() => onChange(Math.min(60, value + 1))}>
                    <Ionicons name="add" size={20} color={Colors.imiPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Step Screens ─────────────────────────────────────────────────────────────

function StepPersonal({ input, onChange }: { input: CRSInput; onChange: (p: Partial<CRSInput>) => void }) {
    const ageGroups: { label: string; value: number }[] = [
        { label: '18', value: 18 }, { label: '20', value: 20 }, { label: '25', value: 25 },
        { label: '28', value: 28 }, { label: '30', value: 30 }, { label: '33', value: 33 },
        { label: '35', value: 35 }, { label: '38', value: 38 }, { label: '40', value: 40 },
        { label: '43', value: 43 }, { label: '45', value: 45 }, { label: '50+', value: 50 },
    ];
    return (
        <View style={s.stepContent}>
            <SectionTitle>Tell us about yourself</SectionTitle>
            <AgeSelector value={input.age} onChange={v => onChange({ age: v })} />
            <OptionRow
                label="Age (quick pick)"
                options={ageGroups}
                value={input.age}
                onChange={v => onChange({ age: v })}
            />
            <ToggleRow
                label="Accompanying Spouse / Partner"
                sublabel="Common-law partner counts too"
                value={input.hasSpouse}
                onChange={v => onChange({ hasSpouse: v })}
            />
        </View>
    );
}

function StepEducation({ input, onChange }: { input: CRSInput; onChange: (p: Partial<CRSInput>) => void }) {
    const eduOptions = Object.entries(EDU_LABELS).map(([value, label]) => ({ label, value: value as EducationLevel }));
    const canEduOptions: { label: string; value: CRSInput['canadianEducation'] }[] = [
        { label: 'None', value: 'none' },
        { label: '1–2 yr credential', value: 'oneOrTwo' },
        { label: '3+ yr credential', value: 'threeOrMore' },
    ];

    return (
        <View style={s.stepContent}>
            <SectionTitle>Education background</SectionTitle>
            <OptionRow
                label="Highest level of education"
                options={eduOptions}
                value={input.educationLevel}
                onChange={v => onChange({ educationLevel: v })}
            />
            <OptionRow
                label="Canadian post-secondary education"
                options={canEduOptions}
                value={input.canadianEducation}
                onChange={v => onChange({ canadianEducation: v })}
            />
            {input.hasSpouse && (
                <OptionRow
                    label="Spouse's highest education"
                    options={eduOptions}
                    value={input.spouseEducation ?? 'lessThanSecondary'}
                    onChange={v => onChange({ spouseEducation: v })}
                />
            )}
        </View>
    );
}

function StepLanguage({ input, onChange }: { input: CRSInput; onChange: (p: Partial<CRSInput>) => void }) {
    const skills: { key: keyof CRSInput; label: string }[] = [
        { key: 'firstLangListening', label: 'Listening' },
        { key: 'firstLangSpeaking', label: 'Speaking' },
        { key: 'firstLangReading', label: 'Reading' },
        { key: 'firstLangWriting', label: 'Writing' },
    ];
    const spouseSkills: { key: keyof CRSInput; label: string }[] = [
        { key: 'spouseLangListening', label: 'Listening' },
        { key: 'spouseLangSpeaking', label: 'Speaking' },
        { key: 'spouseLangReading', label: 'Reading' },
        { key: 'spouseLangWriting', label: 'Writing' },
    ];
    const secondSkills: { key: keyof CRSInput; label: string }[] = [
        { key: 'secondLangListening', label: 'Listening' },
        { key: 'secondLangSpeaking', label: 'Speaking' },
        { key: 'secondLangReading', label: 'Reading' },
        { key: 'secondLangWriting', label: 'Writing' },
    ];

    return (
        <View style={s.stepContent}>
            <SectionTitle>First official language (English or French)</SectionTitle>
            <Text style={s.fieldHint}>
                Use CLB levels. IELTS scores: L 8.5→CLB9, 7.5→CLB8, 6→CLB7, 5.5→CLB6. Reading: 8→CLB9, 7→CLB8, 6→CLB7.
            </Text>
            {skills.map(sk => (
                <OptionRow
                    key={sk.key}
                    label={sk.label}
                    options={CLB_OPTIONS}
                    value={(input[sk.key] as CLBLevel) ?? 4}
                    onChange={v => onChange({ [sk.key]: v })}
                />
            ))}

            <ToggleRow
                label="Tested in a second official language?"
                value={input.hasSecondLang}
                onChange={v => onChange({ hasSecondLang: v })}
            />
            {input.hasSecondLang && (
                <>
                    <SectionTitle>Second language CLB levels</SectionTitle>
                    {secondSkills.map(sk => (
                        <OptionRow
                            key={sk.key}
                            label={sk.label}
                            options={CLB_OPTIONS}
                            value={(input[sk.key] as CLBLevel | undefined) ?? 4}
                            onChange={v => onChange({ [sk.key]: v })}
                        />
                    ))}
                </>
            )}

            {input.hasSpouse && (
                <>
                    <SectionTitle>Spouse's language test (CLB levels)</SectionTitle>
                    {spouseSkills.map(sk => (
                        <OptionRow
                            key={sk.key}
                            label={sk.label}
                            options={CLB_OPTIONS}
                            value={(input[sk.key] as CLBLevel | undefined) ?? 4}
                            onChange={v => onChange({ [sk.key]: v })}
                        />
                    ))}
                </>
            )}
        </View>
    );
}

function StepWork({ input, onChange }: { input: CRSInput; onChange: (p: Partial<CRSInput>) => void }) {
    const foreignOpts = Object.entries(FOREIGN_WORK_LABELS).map(([v, l]) => ({ label: l, value: v as WorkYears }));
    const canOpts = Object.entries(CANADIAN_WORK_LABELS).map(([v, l]) => ({ label: l, value: v as CanadianWorkYears }));

    return (
        <View style={s.stepContent}>
            <SectionTitle>Work experience</SectionTitle>
            <OptionRow
                label="Foreign skilled work experience (NOC TEER 0-3)"
                options={foreignOpts}
                value={input.foreignWorkYears}
                onChange={v => onChange({ foreignWorkYears: v })}
            />
            <OptionRow
                label="Canadian skilled work experience"
                options={canOpts}
                value={input.canadianWorkYears}
                onChange={v => onChange({ canadianWorkYears: v })}
            />
            {input.hasSpouse && (
                <OptionRow
                    label="Spouse's Canadian work experience"
                    options={canOpts}
                    value={input.spouseCanadianWork ?? 'none'}
                    onChange={v => onChange({ spouseCanadianWork: v })}
                />
            )}
        </View>
    );
}

function StepAdditional({ input, onChange }: { input: CRSInput; onChange: (p: Partial<CRSInput>) => void }) {
    const nocTeerOpts: { label: string; value: CRSInput['jobOfferNocTeer'] }[] = [
        { label: 'No tier', value: null },
        { label: 'TEER 00 (+200)', value: '00' },
        { label: 'TEER 1–3 (+50)', value: '1-3' },
    ];

    return (
        <View style={s.stepContent}>
            <SectionTitle>Boost your score</SectionTitle>
            <ToggleRow
                label="Provincial / Territorial Nomination (PNP)"
                sublabel="Adds 600 pts — effectively guarantees an ITA"
                value={input.hasProvincialNomination}
                onChange={v => onChange({ hasProvincialNomination: v })}
            />
            <ToggleRow
                label="Valid job offer in Canada"
                value={input.hasJobOffer}
                onChange={v => onChange({ hasJobOffer: v, jobOfferNocTeer: v ? '1-3' : null })}
            />
            {input.hasJobOffer && (
                <OptionRow
                    label="Job offer NOC TEER"
                    options={nocTeerOpts}
                    value={input.jobOfferNocTeer}
                    onChange={v => onChange({ jobOfferNocTeer: v })}
                />
            )}
            <ToggleRow
                label="Sibling in Canada (citizen or PR)"
                value={input.hasSiblingInCanada}
                onChange={v => onChange({ hasSiblingInCanada: v })}
            />
            <ToggleRow
                label="Strong French skills"
                sublabel="CLB 7+ French as second language (+50)"
                value={input.hasCanadianFrench}
                onChange={v => onChange({ hasCanadianFrench: v })}
            />
        </View>
    );
}

// ─── Score Breakdown Card ─────────────────────────────────────────────────────

function BreakdownRow({ label, pts, max, accent }: { label: string; pts: number; max?: number; accent?: boolean }) {
    return (
        <View style={bd.row}>
            <Text style={[bd.label, accent && bd.labelAccent]}>{label}</Text>
            <View style={bd.right}>
                {max !== undefined && (
                    <View style={bd.barBg}>
                        <View style={[bd.barFill, { width: `${Math.min((pts / max) * 100, 100)}%` as any }]} />
                    </View>
                )}
                <Text style={[bd.pts, accent && bd.ptsAccent]}>{pts}</Text>
            </View>
        </View>
    );
}

function ScoreBreakdown({ breakdown, hasSpouse, hideHeader = false }: { breakdown: CRSBreakdown; hasSpouse: boolean; hideHeader?: boolean }) {
    const band = scoreBand(breakdown.total);
    return (
        <View style={bd.container}>
            {/* Big score */}
            {!hideHeader && (
                <View style={[bd.scoreCircle, { borderColor: band.color }]}>
                    <Text style={[bd.scoreNum, { color: band.color }]}>{breakdown.total}</Text>
                    <Text style={[bd.scoreBand, { color: band.color }]}>{band.label}</Text>
                </View>
            )}

            {/* Group A */}
            <Text style={bd.groupTitle}>A · Core Human Capital (max ~{hasSpouse ? 460 : 500})</Text>
            <BreakdownRow label="Age" pts={breakdown.coreAge} max={hasSpouse ? 100 : 110} />
            <BreakdownRow label="Education" pts={breakdown.coreEducation} max={hasSpouse ? 119 : 140} />
            <BreakdownRow label="First language" pts={breakdown.coreFirstLang} max={hasSpouse ? 116 : 136} />
            {breakdown.coreSecondLang > 0 && <BreakdownRow label="Second language" pts={breakdown.coreSecondLang} max={22} />}
            <BreakdownRow label="Canadian work experience" pts={breakdown.coreCanadianWork} max={hasSpouse ? 56 : 64} />
            <BreakdownRow label="Core total" pts={breakdown.coreTotal} accent />

            {/* Group B */}
            {hasSpouse && (
                <>
                    <Text style={bd.groupTitle}>B · Spouse Factors (max 40)</Text>
                    <BreakdownRow label="Education" pts={breakdown.spouseEducation} max={10} />
                    <BreakdownRow label="Language" pts={breakdown.spouseLang} max={20} />
                    <BreakdownRow label="Canadian work" pts={breakdown.spouseCanadianWork} max={8} />
                    <BreakdownRow label="Spouse total" pts={breakdown.spouseTotal} accent />
                </>
            )}

            {/* Group C */}
            <Text style={bd.groupTitle}>C · Skill Transferability (max 100)</Text>
            <BreakdownRow label="Transfers" pts={breakdown.transferability} max={100} />

            {/* Group D */}
            <Text style={bd.groupTitle}>D · Additional Points</Text>
            <BreakdownRow label="Additional" pts={breakdown.additional} max={600} />

            <View style={bd.totalRow}>
                <Text style={bd.totalLabel}>CRS Total</Text>
                <Text style={[bd.totalPts, { color: band.color }]}>{breakdown.total}</Text>
            </View>

            <Text style={bd.disclaimer}>
                * Calculated using official IRCC tables. Actual CRS may vary slightly. Always verify on Canada.ca.
            </Text>
        </View>
    );
}

// ─── Score Dashboard ──────────────────────────────────────────────────────────

interface IRCCDraw {
    drawNumber: string;
    drawDateFull: string;
    drawName: string;
    drawSize: string;
    drawCRS: string;
}

function ScoreDashboard({ score, onRecalculate }: { score: number; onRecalculate: () => void }) {
    const band = scoreBand(score);
    const [draws, setDraws] = useState(FALLBACK_DRAWS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        fetch('https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json', {
            headers: { 'Cache-Control': 'no-cache' }
        })
            .then(res => res.json())
            .then(data => {
                if (isMounted && data.draws && Array.isArray(data.draws)) {
                    // Grab newest 6 draws and map to our format
                    const recent: IRCCDraw[] = data.draws.slice(0, 6);
                    setDraws(recent.map(d => ({
                        id: d.drawNumber,
                        date: d.drawDateFull,
                        type: d.drawName,
                        score: parseInt(d.drawCRS) || 0,
                        invitations: d.drawSize,
                    })));
                }
            })
            .catch(err => console.warn('Failed to fetch IRCC draws, falling back to static:', err))
            .finally(() => { if (isMounted) setLoading(false); });

        return () => { isMounted = false; };
    }, []);

    return (
        <View style={s.stepContent}>
            <TouchableOpacity style={s.recalculateBtn} onPress={onRecalculate} activeOpacity={0.8}>
                <Ionicons name="refresh" size={18} color={Colors.white} />
                <Text style={s.recalculateText}>Recalculate your score</Text>
            </TouchableOpacity>

            <View style={bd.container}>
                <View style={[bd.scoreCircle, { borderColor: band.color, marginTop: 12 }]}>
                    <Text style={[bd.scoreNum, { color: band.color }]}>{score}</Text>
                    <Text style={[bd.scoreBand, { color: band.color }]}>{band.label}</Text>
                    <Text style={s.scoreOutOf}>out of 1,200</Text>
                </View>
            </View>

            <SectionTitle>Recent Express Entry Rounds</SectionTitle>
            <View style={s.tableContainer}>
                {/* Table Header */}
                <View style={[s.tableRow, s.tableHeader]}>
                    <Text style={[s.tableCellText, s.tableHeaderText, { flex: 0.8 }]}>#</Text>
                    <Text style={[s.tableCellText, s.tableHeaderText, { flex: 2 }]}>Date</Text>
                    <Text style={[s.tableCellText, s.tableHeaderText, { flex: 3 }]}>Immigration program</Text>
                    <Text style={[s.tableCellText, s.tableHeaderText, { flex: 1.2, textAlign: 'right' }]}>ITAs</Text>
                    <Text style={[s.tableCellText, s.tableHeaderText, { flex: 1.2, textAlign: 'right' }]}>CRS</Text>
                </View>

                {/* Table Body */}
                {loading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator color={Colors.imiPrimary} />
                    </View>
                ) : (
                    draws.map((draw, index) => (
                        <View key={draw.id} style={[s.tableRow, index % 2 !== 0 && s.tableRowAlt]}>
                            <Text style={[s.tableCellText, { flex: 0.8, color: Colors.imiTextMuted }]}>#{draw.id}</Text>
                            <Text style={[s.tableCellText, { flex: 2 }]} numberOfLines={1}>{draw.date}</Text>
                            <Text style={[s.tableCellText, { flex: 3 }]} numberOfLines={2}>{draw.type}</Text>
                            <Text style={[s.tableCellText, { flex: 1.2, textAlign: 'right' }]}>{draw.invitations}</Text>
                            <Text style={[s.tableCellText, { flex: 1.2, textAlign: 'right', fontWeight: '700' }]}>{draw.score}</Text>
                        </View>
                    ))
                )}
            </View>
        </View>
    );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CalculatorScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const [step, setStep] = useState(0);
    const [input, setInput] = useState<CRSInput>(DEFAULT_INPUT);
    const [showResult, setShowResult] = useState(false);
    const [showDashboard, setShowDashboard] = useState(!!currentUser?.crsScore);

    const updateInput = useCallback((patch: Partial<CRSInput>) => {
        setInput(prev => ({ ...prev, ...patch }));
    }, []);

    const breakdown = calculateCRS(input);

    // Persist the calculated score so the home screen can show it
    useEffect(() => {
        if (showResult) {
            AsyncStorage.setItem('crs_calculated_score', String(breakdown.total)).catch(() => { });
        }
    }, [showResult, breakdown.total]);

    const goNext = () => {
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else setShowResult(true);
    };
    const goPrev = () => {
        if (showResult) { setShowResult(false); return; }
        if (step > 0) setStep(s => s - 1);
    };

    return (
        <SafeAreaView style={s.screen}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backHeaderBtn}>
                    <Ionicons name="chevron-back" size={22} color={Colors.imiPrimary} />
                    <Text style={s.backHeaderText}>Home</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>CRS Calculator</Text>
                <View style={s.liveScore}>
                    <Text style={s.liveScoreLabel}>Score</Text>
                    <Text style={[s.liveScoreNum, { color: scoreBand(showDashboard && currentUser?.crsScore ? currentUser.crsScore : breakdown.total).color }]}>
                        {showDashboard && currentUser?.crsScore ? currentUser.crsScore : breakdown.total}
                    </Text>
                </View>
            </View>

            {/* Progress stepper */}
            {!showResult && !showDashboard && (
                <View style={s.stepper}>
                    {STEPS.map((st, i) => (
                        <TouchableOpacity
                            key={st.id}
                            style={s.stepDotWrap}
                            onPress={() => setStep(i)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                s.stepDot,
                                i < step && s.stepDotDone,
                                i === step && s.stepDotActive,
                            ]}>
                                {i < step
                                    ? <Ionicons name="checkmark" size={12} color={Colors.white} />
                                    : <Ionicons name={st.icon} size={12} color={i === step ? Colors.white : Colors.imiTextMuted} />
                                }
                            </View>
                            <Text style={[s.stepLabel, i === step && s.stepLabelActive]} numberOfLines={1}>
                                {st.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Content */}
            <ScrollView
                contentContainerStyle={s.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {showDashboard && !showResult && currentUser?.crsScore ? (
                    <ScoreDashboard score={currentUser.crsScore} onRecalculate={() => { setShowDashboard(false); setStep(0); }} />
                ) : showResult ? (
                    <View style={{ gap: 24 }}>
                        <ScoreDashboard score={breakdown.total} onRecalculate={() => { setShowResult(false); setStep(0); }} />
                        <View style={{ gap: 12 }}>
                            <SectionTitle>Your score breakdown</SectionTitle>
                            <ScoreBreakdown breakdown={breakdown} hasSpouse={input.hasSpouse} hideHeader />
                        </View>
                    </View>
                ) : (
                    <>
                        {step === 0 && <StepPersonal input={input} onChange={updateInput} />}
                        {step === 1 && <StepEducation input={input} onChange={updateInput} />}
                        {step === 2 && <StepLanguage input={input} onChange={updateInput} />}
                        {step === 3 && <StepWork input={input} onChange={updateInput} />}
                        {step === 4 && <StepAdditional input={input} onChange={updateInput} />}
                    </>
                )}
            </ScrollView>

            {/* Nav footer */}
            {!showDashboard && !showResult && (
                <View style={s.footer}>
                    {step > 0 ? (
                        <TouchableOpacity style={s.backBtn} onPress={goPrev}>
                            <Ionicons name="chevron-back" size={18} color={Colors.imiPrimary} />
                            <Text style={s.backText}>Back</Text>
                        </TouchableOpacity>
                    ) : <View style={{ flex: 1 }} />}

                    <TouchableOpacity style={s.nextBtn} onPress={goNext}>
                        <Text style={s.nextText}>
                            {step === STEPS.length - 1 ? 'Submit' : 'Next'}
                        </Text>
                        {step !== STEPS.length - 1 && <Ionicons name="chevron-forward" size={18} color={Colors.white} />}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    },
    backHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 64 },
    backHeaderText: { fontSize: 15, color: Colors.imiPrimary, fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.imiTextPrimary },
    liveScore: { alignItems: 'flex-end' },
    liveScoreLabel: { fontSize: 11, color: Colors.imiTextMuted },
    liveScoreNum: { fontSize: 24, fontWeight: '800' },

    // Stepper
    stepper: {
        flexDirection: 'row', paddingHorizontal: 16,
        paddingBottom: 12, gap: 4, justifyContent: 'space-between',
    },
    stepDotWrap: { alignItems: 'center', flex: 1 },
    stepDot: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Colors.imiBorder,
        alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    },
    stepDotDone: { backgroundColor: Colors.imiPrimary },
    stepDotActive: { backgroundColor: Colors.imiPrimary },
    stepLabel: { fontSize: 9, color: Colors.imiTextMuted, textAlign: 'center' },
    stepLabelActive: { color: Colors.imiPrimary, fontWeight: '600' },

    // Scroll
    scroll: { paddingHorizontal: 16, paddingBottom: 120 },
    stepContent: { gap: 20 },

    // Section / field
    sectionTitle: {
        fontSize: 16, fontWeight: '700', color: Colors.imiTextPrimary,
        marginBottom: -8, marginTop: 4,
    },
    fieldGroup: { gap: 8 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.imiTextSecondary },
    fieldHint: { fontSize: 11, color: Colors.imiTextMuted, lineHeight: 16, marginTop: -6 },

    // Chip picker
    chipRow: { gap: 8, paddingVertical: 2 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: Colors.white,
        borderWidth: 1.5, borderColor: Colors.imiBorder,
    },
    chipActive: { backgroundColor: Colors.imiPrimary, borderColor: Colors.imiPrimary },
    chipText: { fontSize: 12, fontWeight: '600', color: Colors.imiTextSecondary },
    chipTextActive: { color: Colors.white },

    // Age picker
    ageRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    ageBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: `${Colors.imiPrimary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    ageValue: { fontSize: 28, fontWeight: '800', color: Colors.imiTextPrimary, minWidth: 48, textAlign: 'center' },

    // Toggle
    toggleRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: Colors.white, borderRadius: 14, padding: 14,
        borderWidth: 1, borderColor: Colors.imiBorder,
    },
    toggleSublabel: { fontSize: 11, color: Colors.imiTextMuted, marginTop: 2 },

    // Footer nav
    footer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, paddingBottom: 28,
        backgroundColor: Colors.white,
        borderTopWidth: 1, borderTopColor: Colors.imiBorder,
        gap: 12,
    },
    backBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingVertical: 14, paddingHorizontal: 16,
        borderRadius: 14, borderWidth: 1.5, borderColor: Colors.imiPrimary,
    },
    backText: { fontSize: 15, fontWeight: '600', color: Colors.imiPrimary },
    nextBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: Colors.imiPrimary, borderRadius: 14, paddingVertical: 14,
    },
    nextText: { fontSize: 15, fontWeight: '700', color: Colors.white },

    // Dashboard
    recalculateBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: Colors.imiPrimary, borderRadius: 14, paddingVertical: 14,
        marginBottom: 8,
    },
    recalculateText: { fontSize: 15, fontWeight: '700', color: Colors.white },
    scoreOutOf: { fontSize: 13, color: Colors.imiTextMuted, marginTop: 2, fontWeight: '500', textAlign: 'center' },
    // Dashboard Table
    tableContainer: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.imiBorder,
        overflow: 'hidden',
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.imiBorder,
        alignItems: 'center',
    },
    tableRowAlt: {
        backgroundColor: '#FAFAFB',
    },
    tableHeader: {
        backgroundColor: `${Colors.imiPrimary}10`,
        borderBottomWidth: 2,
    },
    tableCellText: {
        fontSize: 11,
        color: Colors.imiTextPrimary,
    },
    tableHeaderText: {
        fontWeight: '700',
        color: Colors.imiPrimary,
        textTransform: 'uppercase',
    },
});

const bd = StyleSheet.create({
    container: {
        backgroundColor: Colors.white, borderRadius: 20, padding: 20,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
        gap: 10,
    },
    scoreCircle: {
        alignSelf: 'center', width: 150, height: 150, borderRadius: 75,
        borderWidth: 5, alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
        backgroundColor: Colors.imiBackground,
    },
    scoreNum: { fontSize: 52, fontWeight: '900' },
    scoreBand: { fontSize: 14, fontWeight: '700', marginTop: -4 },
    groupTitle: {
        fontSize: 12, fontWeight: '700', color: Colors.imiTextMuted,
        textTransform: 'uppercase', letterSpacing: 0.8,
        marginTop: 12, marginBottom: -4,
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    label: { fontSize: 14, color: Colors.imiTextPrimary, flex: 1 },
    labelAccent: { fontWeight: '700' },
    right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    barBg: { width: 80, height: 6, borderRadius: 3, backgroundColor: Colors.imiBorder },
    barFill: { height: 6, borderRadius: 3, backgroundColor: Colors.imiPrimary },
    pts: { fontSize: 14, fontWeight: '600', color: Colors.imiTextSecondary, minWidth: 32, textAlign: 'right' },
    ptsAccent: { color: Colors.imiPrimary, fontWeight: '800', fontSize: 16 },
    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 8, paddingTop: 14,
        borderTopWidth: 2, borderTopColor: Colors.imiBorder,
    },
    totalLabel: { fontSize: 18, fontWeight: '700', color: Colors.imiTextPrimary },
    totalPts: { fontSize: 36, fontWeight: '900' },
    disclaimer: { fontSize: 11, color: Colors.imiTextMuted, lineHeight: 16, marginTop: 4 },
});
