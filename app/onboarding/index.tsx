import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    TouchableOpacity,
    TextInput,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';
import { ImmigrationStreamPicker } from '../../components/ImmigrationStreamPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import {
    CRSProfile,
    EMPTY_CRS_PROFILE,
    EDUCATION_LEVELS,
    EducationLevel,
    ImmigrationStream,
} from '../../types';
import {
    calculateCRS,
    CRSInput,
    CLBLevel,
    CLB_OPTIONS,
    scoreBand,
} from '../../services/CRSCalculatorService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ─── Extra onboarding state (CRS-specific fields not in CRSProfile) ────────────

interface OnboardingExtra {
    age: number;
    // CLB levels for first language (from test scores via chip)
    clbListening: CLBLevel;
    clbSpeaking: CLBLevel;
    clbReading: CLBLevel;
    clbWriting: CLBLevel;
    // Second language
    hasSecondLang: boolean;
    clb2Listening: CLBLevel;
    clb2Speaking: CLBLevel;
    clb2Reading: CLBLevel;
    clb2Writing: CLBLevel;
    // Spouse language
    spouseClbListening: CLBLevel;
    spouseClbSpeaking: CLBLevel;
    spouseClbReading: CLBLevel;
    spouseClbWriting: CLBLevel;
    spouseCanadianWorkYears: 'none' | 'lessThanOne' | 'one' | 'two' | 'threeOrMore';
    // Additional
    hasJobOffer: boolean;
    jobOfferTeer: '00' | '1-3' | null;
    hasCanadianFrench: boolean;
    canadianEducation: 'none' | 'oneOrTwo' | 'threeOrMore';
    foreignWorkYears: 'none' | 'lessThanOne' | 'one' | 'two' | 'three' | 'fourOrFive' | 'sixOrMore';
    canadianWorkYears: 'none' | 'lessThanOne' | 'one' | 'two' | 'threeOrMore';
}

const DEFAULT_EXTRA: OnboardingExtra = {
    age: 28,
    clbListening: 9, clbSpeaking: 9, clbReading: 9, clbWriting: 9,
    hasSecondLang: false,
    clb2Listening: 4, clb2Speaking: 4, clb2Reading: 4, clb2Writing: 4,
    spouseClbListening: 4, spouseClbSpeaking: 4, spouseClbReading: 4, spouseClbWriting: 4,
    spouseCanadianWorkYears: 'none',
    hasJobOffer: false,
    jobOfferTeer: null,
    hasCanadianFrench: false,
    canadianEducation: 'none',
    foreignWorkYears: 'none',
    canadianWorkYears: 'none',
};

// Build a CRSInput from the profile + extra for live calculation
function buildCRSInput(profile: CRSProfile, extra: OnboardingExtra): CRSInput {
    // Map old EducationLevel strings to CRSCalculatorService EducationLevel keys
    const eduMap: Record<string, CRSInput['educationLevel']> = {
        'Less than secondary school': 'lessThanSecondary',
        'Secondary diploma (high school)': 'secondary',
        'One-year program credential': 'oneYear',
        'Two-year program credential': 'twoYear',
        "Bachelor's degree (3+ years)": 'bachelors',
        'Two or more credentials': 'twoOrMoreDegrees',
        "Master's degree": 'masters',
        'Doctoral degree (PhD)': 'phd',
    };
    const eduLevel = eduMap[profile.educationLevel] ?? 'bachelors';
    const spouseEduLevel = profile.spouseEducation ? (eduMap[profile.spouseEducation] ?? 'secondary') : 'secondary';

    return {
        hasSpouse: profile.hasSpouse && profile.spouseIsAccompanying && !profile.spouseIsCitizenOrPR,
        age: extra.age,
        educationLevel: eduLevel,
        canadianEducation: extra.canadianEducation,
        firstLangListening: extra.clbListening,
        firstLangSpeaking: extra.clbSpeaking,
        firstLangReading: extra.clbReading,
        firstLangWriting: extra.clbWriting,
        hasSecondLang: extra.hasSecondLang,
        secondLangListening: extra.clb2Listening,
        secondLangSpeaking: extra.clb2Speaking,
        secondLangReading: extra.clb2Reading,
        secondLangWriting: extra.clb2Writing,
        foreignWorkYears: extra.foreignWorkYears,
        canadianWorkYears: extra.canadianWorkYears,
        spouseEducation: spouseEduLevel,
        spouseLangListening: extra.spouseClbListening,
        spouseLangSpeaking: extra.spouseClbSpeaking,
        spouseLangReading: extra.spouseClbReading,
        spouseLangWriting: extra.spouseClbWriting,
        spouseCanadianWork: extra.spouseCanadianWorkYears,
        hasProvincialNomination: profile.hasProvincialNomination,
        hasJobOffer: extra.hasJobOffer,
        jobOfferNocTeer: extra.jobOfferTeer,
        hasSiblingInCanada: profile.hasSiblingInCanada,
        hasCanadianFrench: extra.hasCanadianFrench,
        hasPostSecondaryInCanada: extra.canadianEducation !== 'none',
    };
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
    { title: 'Personal Info', description: 'Tell us about yourself', icon: 'person' as const },
    { title: 'Marital Status', description: 'Your family situation', icon: 'heart' as const },
    { title: 'Education', description: 'Your highest credential', icon: 'school' as const },
    { title: 'Language', description: 'Your CLB levels', icon: 'language' as const },
    { title: 'Work Experience', description: 'Your work history', icon: 'briefcase' as const },
    { title: 'Additional Factors', description: 'Special circumstances', icon: 'star' as const },
    { title: 'Province', description: 'Where you want to settle', icon: 'map' as const },
    { title: 'Immigration Stream', description: 'Your pathway to Canada', icon: 'airplane' as const },
    { title: 'Your CRS Score', description: 'Your estimated score', icon: 'trophy' as const },
];

const CANADIAN_PROVINCES = [
    'Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba',
    'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland', 'PEI',
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { completeOnboarding, signOut } = useAuth();
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState<CRSProfile>({ ...EMPTY_CRS_PROFILE, id: `profile-${Date.now()}` });
    const [extra, setExtra] = useState<OnboardingExtra>(DEFAULT_EXTRA);

    const progress = (step + 1) / STEPS.length;
    const canGoBack = step > 0;
    const isLastStep = step === STEPS.length - 1;

    const update = useCallback(<K extends keyof CRSProfile>(key: K, value: CRSProfile[K]) => {
        setProfile(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateExtra = useCallback(<K extends keyof OnboardingExtra>(key: K, value: OnboardingExtra[K]) => {
        setExtra(prev => ({ ...prev, [key]: value }));
    }, []);

    const crsInput = buildCRSInput(profile, extra);
    const crsBreakdown = calculateCRS(crsInput);
    const band = scoreBand(crsBreakdown.total);

    const handleComplete = async () => {
        if (!profile.firstName || !profile.lastName) {
            Alert.alert('Missing Info', 'Please fill in your name to continue.');
            return;
        }
        // 1. Persist CRS score locally for instant home-screen display
        await AsyncStorage.setItem('crs_calculated_score', String(crsBreakdown.total)).catch(() => { });

        // 2. Save CRSProfile to profiles table + mark onboarding complete
        await completeOnboarding(profile);

        // 3. Write all CRS extra fields + calculated score into Supabase user_metadata
        await supabase.auth.updateUser({
            data: {
                crsScore: crsBreakdown.total,
                age: extra.age,
                clbListening: extra.clbListening,
                clbSpeaking: extra.clbSpeaking,
                clbReading: extra.clbReading,
                clbWriting: extra.clbWriting,
                hasSecondLang: extra.hasSecondLang,
                clb2Listening: extra.clb2Listening,
                clb2Speaking: extra.clb2Speaking,
                clb2Reading: extra.clb2Reading,
                clb2Writing: extra.clb2Writing,
                spouseClbListening: extra.spouseClbListening,
                spouseClbSpeaking: extra.spouseClbSpeaking,
                spouseClbReading: extra.spouseClbReading,
                spouseClbWriting: extra.spouseClbWriting,
                spouseCanadianWorkYears: extra.spouseCanadianWorkYears,
                foreignWorkYears: extra.foreignWorkYears,
                canadianWorkYears: extra.canadianWorkYears,
                canadianEducation: extra.canadianEducation,
                hasJobOffer: extra.hasJobOffer,
                jobOfferTeer: extra.jobOfferTeer,
                hasCanadianFrench: extra.hasCanadianFrench,
            },
        }).catch(e => console.warn('Could not save CRS metadata:', e));

        router.replace('/(tabs)');
    };

    const handleExit = () => {
        Alert.alert('Exit Onboarding?', 'Your progress will not be saved.', [
            { text: 'Stay', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: signOut },
        ]);
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleExit}>
                    <Text style={styles.exitBtn}>Exit</Text>
                </TouchableOpacity>
                <Text style={styles.stepLabel}>Step {step + 1} of {STEPS.length}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Step dots */}
            <View style={styles.dotsRow}>
                {STEPS.map((_, i) => (
                    <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
                ))}
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            {/* Step title */}
            <View style={styles.stepTitleRow}>
                <Ionicons name={STEPS[step].icon} size={24} color={Colors.imiPrimary} />
                <Text style={styles.stepTitle}>{STEPS[step].title}</Text>
            </View>
            <Text style={styles.stepDesc}>{STEPS[step].description}</Text>

            {/* Step content */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <StepContent
                    step={step}
                    profile={profile}
                    extra={extra}
                    update={update}
                    updateExtra={updateExtra}
                    onSkipStream={() => setStep(s => s + 1)}
                    crsBreakdown={crsBreakdown}
                    band={band}
                />
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <View style={styles.footerBtns}>
                    {canGoBack && (
                        <SecondaryButton
                            title="Back"
                            onPress={() => setStep(s => s - 1)}
                            icon="chevron-back"
                            style={styles.backBtn}
                        />
                    )}
                    <PrimaryButton
                        title={isLastStep ? 'Complete' : 'Continue'}
                        onPress={isLastStep ? handleComplete : () => setStep(s => s + 1)}
                        icon={isLastStep ? 'checkmark' : 'chevron-forward'}
                        style={styles.continueBtn}
                    />
                </View>
            </View>
        </View>
    );
}

// ─── Step Content Router ──────────────────────────────────────────────────────

function StepContent({
    step, profile, extra, update, updateExtra, onSkipStream, crsBreakdown, band,
}: {
    step: number;
    profile: CRSProfile;
    extra: OnboardingExtra;
    update: <K extends keyof CRSProfile>(k: K, v: CRSProfile[K]) => void;
    updateExtra: <K extends keyof OnboardingExtra>(k: K, v: OnboardingExtra[K]) => void;
    onSkipStream: () => void;
    crsBreakdown: ReturnType<typeof calculateCRS>;
    band: ReturnType<typeof scoreBand>;
}) {
    switch (step) {
        case 0: return <PersonalInfoStep profile={profile} extra={extra} update={update} updateExtra={updateExtra} />;
        case 1: return <MaritalStatusStep profile={profile} extra={extra} update={update} updateExtra={updateExtra} />;
        case 2: return <EducationStep profile={profile} extra={extra} update={update} updateExtra={updateExtra} />;
        case 3: return <LanguageStep profile={profile} extra={extra} update={update} updateExtra={updateExtra} />;
        case 4: return <WorkExperienceStep profile={profile} extra={extra} update={update} updateExtra={updateExtra} />;
        case 5: return <AdditionalFactorsStep profile={profile} extra={extra} update={update} updateExtra={updateExtra} />;
        case 6: return <ProvinceStep profile={profile} extra={extra} update={update} updateExtra={updateExtra} />;
        case 7: return <ImmigrationStreamStep profile={profile} extra={extra} update={update} updateExtra={updateExtra} onSkip={onSkipStream} />;
        case 8: return <CRSResultStep profile={profile} crsBreakdown={crsBreakdown} band={band} />;
        default: return null;
    }
}

type StepProps = {
    profile: CRSProfile;
    extra: OnboardingExtra;
    update: <K extends keyof CRSProfile>(k: K, v: CRSProfile[K]) => void;
    updateExtra: <K extends keyof OnboardingExtra>(k: K, v: OnboardingExtra[K]) => void;
};

// ─── Step 0: Personal Info ────────────────────────────────────────────────────

function PersonalInfoStep({ profile, extra, update, updateExtra }: StepProps) {
    return (
        <View style={stepStyles.container}>
            <OnboardingField label="First Name" value={profile.firstName} onChangeText={v => update('firstName', v)} placeholder="John" />
            <OnboardingField label="Last Name" value={profile.lastName} onChangeText={v => update('lastName', v)} placeholder="Doe" />
            <OnboardingField label="Country of Citizenship" value={profile.countryOfCitizenship} onChangeText={v => update('countryOfCitizenship', v)} placeholder="e.g. India" />
            <OnboardingField label="Country of Residence" value={profile.countryOfResidence} onChangeText={v => update('countryOfResidence', v)} placeholder="e.g. India" />

            {/* Age — needed for CRS */}
            <View style={stepStyles.fieldWrapper}>
                <Text style={stepStyles.label}>Age</Text>
                <View style={stepStyles.ageRow}>
                    <TouchableOpacity style={stepStyles.ageBtn} onPress={() => updateExtra('age', Math.max(17, extra.age - 1))}>
                        <Ionicons name="remove" size={20} color={Colors.imiPrimary} />
                    </TouchableOpacity>
                    <Text style={stepStyles.ageValue}>{extra.age}</Text>
                    <TouchableOpacity style={stepStyles.ageBtn} onPress={() => updateExtra('age', Math.min(60, extra.age + 1))}>
                        <Ionicons name="add" size={20} color={Colors.imiPrimary} />
                    </TouchableOpacity>
                </View>
                <Text style={stepStyles.hint}>Your age on the date you submit your Express Entry profile</Text>
            </View>
        </View>
    );
}

// ─── Step 1: Marital Status ───────────────────────────────────────────────────

function MaritalStatusStep({ profile, update }: StepProps) {
    return (
        <View style={stepStyles.container}>
            <OnboardingToggle label="Do you have a spouse or common-law partner?" value={profile.hasSpouse} onChange={v => update('hasSpouse', v)} />
            {profile.hasSpouse && (
                <>
                    <OnboardingToggle label="Will your spouse accompany you to Canada?" value={profile.spouseIsAccompanying} onChange={v => update('spouseIsAccompanying', v)} />
                    <OnboardingToggle label="Is your spouse a Canadian citizen or PR?" value={profile.spouseIsCitizenOrPR} onChange={v => update('spouseIsCitizenOrPR', v)} />
                </>
            )}
        </View>
    );
}

// ─── Step 2: Education ────────────────────────────────────────────────────────

const CANADIAN_EDU_OPTIONS: { label: string; value: OnboardingExtra['canadianEducation'] }[] = [
    { label: 'None in Canada', value: 'none' },
    { label: '1–2 yr credential', value: 'oneOrTwo' },
    { label: '3+ yr degree', value: 'threeOrMore' },
];

function EducationStep({ profile, extra, update, updateExtra }: StepProps) {
    return (
        <View style={stepStyles.container}>
            <Text style={stepStyles.label}>Highest Level of Education</Text>
            {EDUCATION_LEVELS.map(level => (
                <TouchableOpacity
                    key={level}
                    style={[stepStyles.option, profile.educationLevel === level && stepStyles.optionSelected]}
                    onPress={() => update('educationLevel', level as EducationLevel)}
                >
                    <Text style={[stepStyles.optionText, profile.educationLevel === level && stepStyles.optionTextSelected]}>
                        {level}
                    </Text>
                    {profile.educationLevel === level && (
                        <Ionicons name="checkmark-circle" size={20} color={Colors.imiPrimary} />
                    )}
                </TouchableOpacity>
            ))}

            <OnboardingToggle label="Do you have an Educational Credential Assessment (ECA)?" value={profile.hasECA} onChange={v => update('hasECA', v)} />

            <Text style={[stepStyles.label, { marginTop: 4 }]}>Canadian post-secondary study</Text>
            <View style={stepStyles.chipRow}>
                {CANADIAN_EDU_OPTIONS.map(opt => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[stepStyles.chip, extra.canadianEducation === opt.value && stepStyles.chipSelected]}
                        onPress={() => updateExtra('canadianEducation', opt.value)}
                    >
                        <Text style={[stepStyles.chipText, extra.canadianEducation === opt.value && stepStyles.chipTextSelected]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

// ─── Step 3: Language ─────────────────────────────────────────────────────────

const FIRST_LANG_SKILLS: { key: keyof OnboardingExtra; label: string }[] = [
    { key: 'clbListening', label: 'Listening' },
    { key: 'clbSpeaking', label: 'Speaking' },
    { key: 'clbReading', label: 'Reading' },
    { key: 'clbWriting', label: 'Writing' },
];
const SECOND_LANG_SKILLS: { key: keyof OnboardingExtra; label: string }[] = [
    { key: 'clb2Listening', label: 'Listening' },
    { key: 'clb2Speaking', label: 'Speaking' },
    { key: 'clb2Reading', label: 'Reading' },
    { key: 'clb2Writing', label: 'Writing' },
];
const SPOUSE_LANG_SKILLS: { key: keyof OnboardingExtra; label: string }[] = [
    { key: 'spouseClbListening', label: 'Listening' },
    { key: 'spouseClbSpeaking', label: 'Speaking' },
    { key: 'spouseClbReading', label: 'Reading' },
    { key: 'spouseClbWriting', label: 'Writing' },
];

function CLBPicker({ label, value, onSelect }: { label: string; value: CLBLevel; onSelect: (v: CLBLevel) => void }) {
    return (
        <View style={stepStyles.fieldWrapper}>
            <Text style={stepStyles.label}>{label}</Text>
            <View style={stepStyles.chipRow}>
                {CLB_OPTIONS.map(opt => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[stepStyles.chip, value === opt.value && stepStyles.chipSelected]}
                        onPress={() => onSelect(opt.value)}
                    >
                        <Text style={[stepStyles.chipText, value === opt.value && stepStyles.chipTextSelected]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

function LanguageStep({ profile, extra, updateExtra }: StepProps) {
    return (
        <View style={stepStyles.container}>
            <Text style={stepStyles.label}>First official language (English or French)</Text>
            <Text style={stepStyles.hint}>
                IELTS → CLB: Listening 8.5=CLB9, 7.5=CLB8, 6=CLB7, 5=CLB6{'\n'}
                Reading: 8=CLB9, 7=CLB8, 6=CLB7, 5=CLB6{'\n'}
                Speaking/Writing: 7.5=CLB9, 6.5=CLB8, 5.5=CLB7, 5=CLB6
            </Text>

            {FIRST_LANG_SKILLS.map(sk => (
                <CLBPicker
                    key={sk.key}
                    label={sk.label}
                    value={extra[sk.key] as CLBLevel}
                    onSelect={v => updateExtra(sk.key, v as OnboardingExtra[typeof sk.key])}
                />
            ))}

            <OnboardingToggle
                label="Tested in a second official language?"
                value={extra.hasSecondLang}
                onChange={v => updateExtra('hasSecondLang', v)}
            />

            {extra.hasSecondLang && (
                <>
                    <Text style={[stepStyles.label, { marginTop: 4 }]}>Second language CLB levels</Text>
                    {SECOND_LANG_SKILLS.map(sk => (
                        <CLBPicker
                            key={sk.key}
                            label={sk.label}
                            value={extra[sk.key] as CLBLevel}
                            onSelect={v => updateExtra(sk.key, v as OnboardingExtra[typeof sk.key])}
                        />
                    ))}
                </>
            )}

            {profile.hasSpouse && profile.spouseIsAccompanying && !profile.spouseIsCitizenOrPR && (
                <>
                    <Text style={[stepStyles.label, { marginTop: 4 }]}>Spouse's language CLB levels</Text>
                    {SPOUSE_LANG_SKILLS.map(sk => (
                        <CLBPicker
                            key={sk.key}
                            label={sk.label}
                            value={extra[sk.key] as CLBLevel}
                            onSelect={v => updateExtra(sk.key, v as OnboardingExtra[typeof sk.key])}
                        />
                    ))}
                </>
            )}
        </View>
    );
}

// ─── Step 4: Work Experience ──────────────────────────────────────────────────

const FOREIGN_WORK_OPTS: { label: string; value: OnboardingExtra['foreignWorkYears'] }[] = [
    { label: 'None', value: 'none' },
    { label: '< 1 yr', value: 'lessThanOne' },
    { label: '1 yr', value: 'one' },
    { label: '2 yrs', value: 'two' },
    { label: '3 yrs', value: 'three' },
    { label: '4–5 yrs', value: 'fourOrFive' },
    { label: '6+ yrs', value: 'sixOrMore' },
];
const CANADIAN_WORK_OPTS: { label: string; value: OnboardingExtra['canadianWorkYears'] }[] = [
    { label: 'None', value: 'none' },
    { label: '< 1 yr', value: 'lessThanOne' },
    { label: '1 yr', value: 'one' },
    { label: '2 yrs', value: 'two' },
    { label: '3+ yrs', value: 'threeOrMore' },
];

function WorkExperienceStep({ profile, extra, update, updateExtra }: StepProps) {
    const we = profile.workExperience;
    return (
        <View style={stepStyles.container}>
            <Text style={stepStyles.label}>Foreign skilled work experience (NOC TEER 0–3)</Text>
            <View style={stepStyles.chipRow}>
                {FOREIGN_WORK_OPTS.map(opt => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[stepStyles.chip, extra.foreignWorkYears === opt.value && stepStyles.chipSelected]}
                        onPress={() => updateExtra('foreignWorkYears', opt.value)}
                    >
                        <Text style={[stepStyles.chipText, extra.foreignWorkYears === opt.value && stepStyles.chipTextSelected]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[stepStyles.label, { marginTop: 4 }]}>Canadian skilled work experience</Text>
            <View style={stepStyles.chipRow}>
                {CANADIAN_WORK_OPTS.map(opt => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[stepStyles.chip, extra.canadianWorkYears === opt.value && stepStyles.chipSelected]}
                        onPress={() => updateExtra('canadianWorkYears', opt.value)}
                    >
                        <Text style={[stepStyles.chipText, extra.canadianWorkYears === opt.value && stepStyles.chipTextSelected]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {profile.hasSpouse && profile.spouseIsAccompanying && !profile.spouseIsCitizenOrPR && (
                <>
                    <Text style={[stepStyles.label, { marginTop: 4 }]}>Spouse's Canadian work experience</Text>
                    <View style={stepStyles.chipRow}>
                        {CANADIAN_WORK_OPTS.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                style={[stepStyles.chip, extra.spouseCanadianWorkYears === opt.value && stepStyles.chipSelected]}
                                onPress={() => updateExtra('spouseCanadianWorkYears', opt.value)}
                            >
                                <Text style={[stepStyles.chipText, extra.spouseCanadianWorkYears === opt.value && stepStyles.chipTextSelected]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            <OnboardingField label="NOC Code (if known)" value={we.nocCode || ''} onChangeText={v => update('workExperience', { ...we, nocCode: v })} placeholder="e.g. 21101" keyboardType="number-pad" />
            <OnboardingField label="Job Title" value={we.jobTitle || ''} onChangeText={v => update('workExperience', { ...we, jobTitle: v })} placeholder="e.g. Software Engineer" />
        </View>
    );
}

// ─── Step 5: Additional Factors ───────────────────────────────────────────────

const JOB_OFFER_OPTS: { label: string; value: OnboardingExtra['jobOfferTeer'] }[] = [
    { label: 'TEER 00 (+200 pts)', value: '00' },
    { label: 'TEER 1–3 (+50 pts)', value: '1-3' },
];

function AdditionalFactorsStep({ profile, extra, update, updateExtra }: StepProps) {
    return (
        <View style={stepStyles.container}>
            <OnboardingToggle label="Do you have a provincial or territorial nomination?" value={profile.hasProvincialNomination} onChange={v => update('hasProvincialNomination', v)} />
            <OnboardingToggle label="Do you have a valid job offer in Canada?" value={extra.hasJobOffer} onChange={v => updateExtra('hasJobOffer', v)} />
            {extra.hasJobOffer && (
                <>
                    <Text style={stepStyles.label}>Job offer NOC TEER level</Text>
                    <View style={stepStyles.chipRow}>
                        {JOB_OFFER_OPTS.map(opt => (
                            <TouchableOpacity
                                key={String(opt.value)}
                                style={[stepStyles.chip, extra.jobOfferTeer === opt.value && stepStyles.chipSelected]}
                                onPress={() => updateExtra('jobOfferTeer', opt.value)}
                            >
                                <Text style={[stepStyles.chipText, extra.jobOfferTeer === opt.value && stepStyles.chipTextSelected]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}
            <OnboardingToggle label="Do you have a sibling in Canada (citizen or PR)?" value={profile.hasSiblingInCanada} onChange={v => update('hasSiblingInCanada', v)} />
            <OnboardingToggle label="Strong French skills? (CLB 7+ in French as second language)" value={extra.hasCanadianFrench} onChange={v => updateExtra('hasCanadianFrench', v)} />
            <OnboardingToggle label="Do you have a Canadian trades certificate?" value={profile.hasTradesCertificate} onChange={v => update('hasTradesCertificate', v)} />
        </View>
    );
}

// ─── Step 6: Province ─────────────────────────────────────────────────────────

function ProvinceStep({ profile, update }: StepProps) {
    const toggle = (province: string) => {
        const current = profile.preferredProvinces;
        const updated = current.includes(province)
            ? current.filter(p => p !== province)
            : [...current, province];
        update('preferredProvinces', updated);
    };
    return (
        <View style={stepStyles.container}>
            <Text style={stepStyles.label}>Select Preferred Provinces (optional)</Text>
            {CANADIAN_PROVINCES.map(province => (
                <TouchableOpacity
                    key={province}
                    style={[stepStyles.option, profile.preferredProvinces.includes(province) && stepStyles.optionSelected]}
                    onPress={() => toggle(province)}
                >
                    <Text style={[stepStyles.optionText, profile.preferredProvinces.includes(province) && stepStyles.optionTextSelected]}>
                        {province}
                    </Text>
                    {profile.preferredProvinces.includes(province) && (
                        <Ionicons name="checkmark-circle" size={20} color={Colors.imiPrimary} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─── Step 7: Immigration Stream ───────────────────────────────────────────────

function ImmigrationStreamStep({ profile, update, onSkip }: StepProps & { onSkip: () => void }) {
    return (
        <View style={stepStyles.container}>
            <Text style={stepStyles.label}>Which immigration pathway best describes you?</Text>
            <ImmigrationStreamPicker
                selected={profile.immigrationStream}
                onSelect={stream => update('immigrationStream', stream as ImmigrationStream)}
                onSkip={onSkip}
            />
        </View>
    );
}

// ─── Step 8: CRS Result ───────────────────────────────────────────────────────

function CRSResultStep({
    profile,
    crsBreakdown,
    band,
}: {
    profile: CRSProfile;
    crsBreakdown: ReturnType<typeof calculateCRS>;
    band: ReturnType<typeof scoreBand>;
}) {
    const rows: [string, string][] = [
        ['Age & Personal', `${crsBreakdown.coreAge} pts`],
        ['Education', `${crsBreakdown.coreEducation} pts`],
        ['Language', `${crsBreakdown.coreFirstLang + crsBreakdown.coreSecondLang} pts`],
        ['Canadian Work', `${crsBreakdown.coreCanadianWork} pts`],
        ...(crsBreakdown.spouseTotal > 0 ? [['Spouse Factors', `${crsBreakdown.spouseTotal} pts`] as [string, string]] : []),
        ['Skill Transferability', `${crsBreakdown.transferability} pts`],
        ['Additional (PNP, etc.)', `${crsBreakdown.additional} pts`],
        ['Immigration Pathway', profile.immigrationStream ?? 'Not selected'],
    ];

    return (
        <View style={stepStyles.container}>
            {/* Big score badge */}
            <View style={[stepStyles.scoreBadge, { borderColor: band.color }]}>
                <Text style={[stepStyles.scoreNum, { color: band.color }]}>{crsBreakdown.total}</Text>
                <Text style={[stepStyles.scoreBandLabel, { color: band.color }]}>{band.label}</Text>
                <Text style={stepStyles.scoreOutOf}>out of 1,200</Text>
            </View>

            <Text style={stepStyles.reviewTitle}>Score Breakdown</Text>
            {rows.map(([label, value]) => (
                <View key={label} style={stepStyles.reviewRow}>
                    <Text style={stepStyles.reviewLabel}>{label}</Text>
                    <Text style={stepStyles.reviewValue}>{value}</Text>
                </View>
            ))}

            <View style={stepStyles.disclaimerBox}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.imiTextMuted} />
                <Text style={stepStyles.disclaimerText}>
                    Estimated using official IRCC tables. Actual score may vary. Tap Complete and use the CRS Calculator on the home screen to refine.
                </Text>
            </View>
        </View>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OnboardingField({
    label, value, onChangeText, placeholder, keyboardType,
}: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'email-address';
}) {
    return (
        <View style={stepStyles.fieldWrapper}>
            <Text style={stepStyles.label}>{label}</Text>
            <TextInput
                style={stepStyles.textInput}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.imiTextMuted}
                keyboardType={keyboardType || 'default'}
            />
        </View>
    );
}

function OnboardingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <View style={stepStyles.toggleRow}>
            <Text style={[stepStyles.label, { flex: 1 }]}>{label}</Text>
            <Switch value={value} onValueChange={onChange} trackColor={{ true: Colors.imiPrimary }} />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: Colors.white,
    },
    exitBtn: { fontSize: 16, color: Colors.imiTextMuted, fontWeight: '500' },
    stepLabel: { fontSize: 13, color: Colors.imiTextMuted, fontWeight: '500' },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        backgroundColor: Colors.white,
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.imiBorder },
    dotActive: { backgroundColor: Colors.imiPrimary },
    progressTrack: { height: 4, backgroundColor: Colors.imiBorder, marginHorizontal: 20, borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: Colors.imiPrimary, borderRadius: 2 },
    stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 16 },
    stepTitle: { fontSize: 22, fontWeight: '700', color: Colors.imiTextPrimary },
    stepDesc: { fontSize: 14, color: Colors.imiTextMuted, paddingHorizontal: 20, marginTop: 2 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
    footer: { backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.imiBorder, paddingHorizontal: 20, paddingTop: 16 },
    footerBtns: { flexDirection: 'row', gap: 12 },
    backBtn: { flex: 1 },
    continueBtn: { flex: 2 },
});

const stepStyles = StyleSheet.create({
    container: { gap: 16 },
    label: { fontSize: 14, fontWeight: '500', color: Colors.imiTextPrimary },
    hint: { fontSize: 12, color: Colors.imiTextMuted, lineHeight: 18, marginTop: -8 },
    fieldWrapper: { gap: 6 },
    textInput: {
        backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1,
        borderColor: Colors.imiBorder, height: 48, paddingHorizontal: 14,
        fontSize: 16, color: Colors.imiTextPrimary,
    },
    toggleRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: Colors.white, borderRadius: 12, padding: 16,
        borderWidth: 1, borderColor: Colors.imiBorder,
    },
    option: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: Colors.white, borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: Colors.imiBorder,
    },
    optionSelected: { borderColor: Colors.imiPrimary, backgroundColor: `${Colors.imiPrimary}08` },
    optionText: { fontSize: 14, color: Colors.imiTextPrimary, flex: 1 },
    optionTextSelected: { color: Colors.imiPrimary, fontWeight: '600' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: Colors.imiBorder, backgroundColor: Colors.white,
    },
    chipSelected: { borderColor: Colors.imiPrimary, backgroundColor: `${Colors.imiPrimary}10` },
    chipText: { fontSize: 13, color: Colors.imiTextSecondary },
    chipTextSelected: { color: Colors.imiPrimary, fontWeight: '600' },
    // Age stepper
    ageRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    ageBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: `${Colors.imiPrimary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    ageValue: { fontSize: 28, fontWeight: '800', color: Colors.imiTextPrimary, minWidth: 48, textAlign: 'center' },
    // CRS result
    scoreBadge: {
        alignSelf: 'center', width: 160, height: 160, borderRadius: 80,
        borderWidth: 5, alignItems: 'center', justifyContent: 'center',
        backgroundColor: Colors.white,
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
        marginBottom: 8,
    },
    scoreNum: { fontSize: 56, fontWeight: '900', lineHeight: 62 },
    scoreBandLabel: { fontSize: 15, fontWeight: '700' },
    scoreOutOf: { fontSize: 12, color: Colors.imiTextMuted, marginTop: 2 },
    reviewTitle: { fontSize: 16, fontWeight: '700', color: Colors.imiTextPrimary, marginBottom: -4 },
    reviewRow: {
        flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: Colors.imiBorder,
    },
    reviewLabel: { fontSize: 14, color: Colors.imiTextSecondary },
    reviewValue: { fontSize: 14, fontWeight: '500', color: Colors.imiTextPrimary, maxWidth: '55%', textAlign: 'right' },
    disclaimerBox: {
        flexDirection: 'row', gap: 8, alignItems: 'flex-start',
        backgroundColor: `${Colors.imiPrimary}08`, borderRadius: 10, padding: 12,
    },
    disclaimerText: { fontSize: 12, color: Colors.imiTextMuted, flex: 1, lineHeight: 17 },
    // Misc
    streamCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white,
        borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: Colors.imiBorder,
    },
    streamCardSelected: { borderColor: Colors.imiPrimary, backgroundColor: `${Colors.imiPrimary}08` },
    streamIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${Colors.imiPrimary}15`, alignItems: 'center', justifyContent: 'center' },
    streamIconBgSelected: { backgroundColor: Colors.imiPrimary },
    streamName: { fontSize: 14, fontWeight: '600', color: Colors.imiTextPrimary },
    streamNameSelected: { color: Colors.imiPrimary },
    streamDesc: { fontSize: 12, color: Colors.imiTextMuted, marginTop: 2 },
    skipLink: { alignItems: 'center', paddingVertical: 8, marginTop: 4 },
    skipLinkText: { fontSize: 14, color: Colors.imiPrimary, fontWeight: '500' },
});
