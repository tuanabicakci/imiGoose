// All TypeScript types ported from Swift models

// ─────────────── Immigration Stream ───────────────

export type ImmigrationStream =
    | 'Federal Skilled Worker'
    | 'Federal Skilled Trades'
    | 'Canadian Experience Class'
    | 'Provincial Nominee Program'
    | 'Atlantic Immigration Program'
    | 'Family Sponsorship'
    | 'Startup Visa';

export const IMMIGRATION_STREAMS={
    'Federal Skilled Worker':{
        name: "Federal Skilled Worker",
        icon: "briefcase",
        description: "For skilled workers with foreign work experience",
        
    },
    'Federal Skilled Trades':{
        name: "Federal Skilled Trades",
        icon: "briefcase",
        description: "For skilled workers with foreign work experience",
    },
    'Canadian Experience Class':{
        name: "Canadian Experience Class",
        icon: "briefcase",
        description: "For skilled workers with foreign work experience",
    },
    'Provincial Nominee Program':{
        name: "Provincial Nominee Program",
        icon: "briefcase",
        description: "For skilled workers with foreign work experience",
    },
    'Atlantic Immigration Program':{
        name: "Atlantic Immigration Program",
        icon: "briefcase",
        description: "For skilled workers with foreign work experience",
    },
    'Family Sponsorship':{
        name: "Family Sponsorship",
        icon: "briefcase",
        description: "For skilled workers with foreign work experience",
    },
    'Startup Visa':{
        name: "Startup Visa",
        icon: "briefcase",
        description: "For skilled workers with foreign work experience",
    },
}

// ─────────────── User ───────────────

export type JourneyStep = 'Application' | 'Pre-ITA' | 'Post-ITA' | 'Landing' | 'PR Card';

export const JOURNEY_STEPS: JourneyStep[] = ['Application', 'Pre-ITA', 'Post-ITA', 'Landing', 'PR Card'];

export const journeyStepOrder = (step: JourneyStep): number => {
    return JOURNEY_STEPS.indexOf(step);
};

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageURL?: string;
    crsScore?: number;
    nocCode?: string;
    teerCategory?: number;
    occupation?: string;
    currentStep: JourneyStep;
    hasCompletedOnboarding?: boolean;
    immigrationStream?: ImmigrationStream;
    createdAt: Date;
    updatedAt: Date;
}

export const MOCK_USER: User = {
    id: 'user-001',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    crsScore: 530,
    nocCode: '21101',
    teerCategory: 1,
    occupation: 'Software Engineer',
    currentStep: 'Pre-ITA',
    createdAt: new Date(),
    updatedAt: new Date(),
};

// ─────────────── CRS Profile ───────────────

export type EducationLevel =
    | 'Less than secondary school'
    | 'Secondary diploma (high school)'
    | 'One-year program credential'
    | 'Two-year program credential'
    | "Bachelor's degree (3+ years)"
    | 'Two or more credentials'
    | "Master's degree"
    | 'Doctoral degree (PhD)';

export const EDUCATION_LEVELS: EducationLevel[] = [
    'Less than secondary school',
    'Secondary diploma (high school)',
    'One-year program credential',
    'Two-year program credential',
    "Bachelor's degree (3+ years)",
    'Two or more credentials',
    "Master's degree",
    'Doctoral degree (PhD)',
];

export type CanadianEducationCredential = 'No Canadian credential' | '1 or 2-year credential' | '3+ year credential';

export type LanguageTestType = 'IELTS General' | 'CELPIP-G' | 'TEF Canada' | 'TCF Canada';

export interface LanguageTestScore {
    testType: LanguageTestType;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
}

export interface CLBLevels {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
}

export interface WorkExperience {
    yearsInCanada: number;
    yearsOverseas: number;
    nocCode?: string;
    jobTitle?: string;
}

export interface CRSProfile {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    countryOfCitizenship: string;
    countryOfResidence: string;
    hasSpouse: boolean;
    spouseIsAccompanying: boolean;
    spouseIsCitizenOrPR: boolean;
    educationLevel: EducationLevel;
    hasECA: boolean;
    canadianEducation: CanadianEducationCredential;
    spouseEducation?: EducationLevel;
    firstLanguageTest: LanguageTestScore;
    hasSecondLanguage: boolean;
    secondLanguageTest?: LanguageTestScore;
    spouseLanguageTest?: LanguageTestScore;
    workExperience: WorkExperience;
    spouseWorkExperience?: WorkExperience;
    hasProvincialNomination: boolean;
    nominatingProvince?: string;
    hasSiblingInCanada: boolean;
    hasTradesCertificate: boolean;
    preferredProvinces: string[];
    immigrationStream?: ImmigrationStream;
}

export const EMPTY_LANGUAGE_TEST: LanguageTestScore = {
    testType: 'IELTS General',
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
};

export const EMPTY_WORK_EXPERIENCE: WorkExperience = {
    yearsInCanada: 0,
    yearsOverseas: 0,
};

export const EMPTY_CRS_PROFILE: CRSProfile = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(Date.now() - 25 * 365 * 24 * 60 * 60 * 1000),
    countryOfCitizenship: '',
    countryOfResidence: '',
    hasSpouse: false,
    spouseIsAccompanying: false,
    spouseIsCitizenOrPR: false,
    educationLevel: "Bachelor's degree (3+ years)",
    hasECA: false,
    canadianEducation: 'No Canadian credential',
    firstLanguageTest: EMPTY_LANGUAGE_TEST,
    hasSecondLanguage: false,
    workExperience: EMPTY_WORK_EXPERIENCE,
    hasProvincialNomination: false,
    hasSiblingInCanada: false,
    hasTradesCertificate: false,
    preferredProvinces: [],
    immigrationStream: undefined,
};

// ─────────────── Forum ───────────────

export type ForumCategory =
    | 'Express Entry'
    | 'PNP'
    | 'Family Sponsorship'
    | 'Study Permit'
    | 'Work Permit'
    | 'Citizenship'
    | 'General';

export const FORUM_CATEGORIES: ForumCategory[] = [
    'Express Entry',
    'PNP',
    'Family Sponsorship',
    'Study Permit',
    'Work Permit',
    'Citizenship',
    'General',
];

export const forumCategoryIcon = (cat: ForumCategory): string => {
    const map: Record<ForumCategory, string> = {
        'Express Entry': 'star',
        'PNP': 'location',
        'Family Sponsorship': 'heart',
        'Study Permit': 'school',
        'Work Permit': 'briefcase',
        'Citizenship': 'flag',
        'General': 'chatbubbles',
    };
    return map[cat];
};

export interface MediaAttachment {
    id: string;
    uri: string;
    type: 'image' | 'video';
    width?: number;
    height?: number;
}

export interface ForumPost {
    id: string;
    authorId: string;
    authorName: string;
    authorImageURL?: string;
    title: string;
    content: string;
    category: ForumCategory;
    journeyStep?: JourneyStep;
    mediaAttachments?: MediaAttachment[];
    createdAt: Date;
    updatedAt: Date;
    likesCount: number;
    commentsCount: number;
    isLikedByUser: boolean;
}

export interface ForumComment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorImageURL?: string;
    content: string;
    createdAt: Date;
    likesCount: number;
    isLikedByUser: boolean;
}

// ─────────────── Chat ───────────────

export interface ChatMessage {
    id: string;
    content: string;
    isFromUser: boolean;
    timestamp: Date;
}

export interface SuggestedPrompt {
    id: string;
    text: string;
    icon?: string;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
    { id: '1', text: 'What is CRS score?', icon: 'help-circle' },
    { id: '2', text: 'How to improve my score?', icon: 'trending-up' },
    { id: '3', text: 'PNP explained', icon: 'map' },
    { id: '4', text: 'IELTS vs CELPIP', icon: 'language' },
    { id: '5', text: 'Express Entry pool', icon: 'people' },
];

// ─────────────── News ───────────────

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    url: string;
    imageURL?: string;
    publishedAt: Date;
    category: string;
}

// ─────────────── Documents ───────────────

export interface ImmigrationDocument {
    id: string;
    name: string;
    category: string;
    isRequired: boolean;
    isCompleted: boolean;
    dueDate?: Date;
    notes?: string;
}

export const MOCK_DOCUMENTS: ImmigrationDocument[] = [
    { id: '1', name: 'Valid Passport', category: 'Identity', isRequired: true, isCompleted: true },
    { id: '2', name: 'IELTS/CELPIP Results', category: 'Language', isRequired: true, isCompleted: true },
    { id: '3', name: 'Educational Credential Assessment (ECA)', category: 'Education', isRequired: true, isCompleted: false },
    { id: '4', name: 'Employment Reference Letters', category: 'Work Experience', isRequired: true, isCompleted: false },
    { id: '5', name: 'Police Clearance Certificate', category: 'Background', isRequired: true, isCompleted: false },
    { id: '6', name: 'Medical Exam Results', category: 'Health', isRequired: true, isCompleted: false },
    { id: '7', name: 'Birth Certificate', category: 'Identity', isRequired: false, isCompleted: true },
];
