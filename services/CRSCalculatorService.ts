
// ─── Input types ─────────────────────────────────────────────────────────────

export type EducationLevel =
    | 'lessThanSecondary'
    | 'secondary'
    | 'oneYear'
    | 'twoYear'
    | 'bachelors'
    | 'twoOrMoreDegrees'
    | 'masters'
    | 'phd';

export type CLBLevel = 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type WorkYears =
    | 'none'
    | 'lessThanOne'
    | 'one'
    | 'two'
    | 'three'
    | 'fourOrFive'
    | 'sixOrMore';

export type CanadianWorkYears =
    | 'none'
    | 'lessThanOne'
    | 'one'
    | 'two'
    | 'threeOrMore';

export interface CRSInput {
    // Personal
    hasSpouse: boolean; // Is spouse/common-law partner accompanying?
    age: number;

    // Education
    educationLevel: EducationLevel;
    canadianEducation: 'none' | 'oneOrTwo' | 'threeOrMore';

    // First official language (CLB levels per skill)
    firstLangListening: CLBLevel;
    firstLangSpeaking: CLBLevel;
    firstLangReading: CLBLevel;
    firstLangWriting: CLBLevel;

    // Second official language
    hasSecondLang: boolean;
    secondLangListening?: CLBLevel;
    secondLangSpeaking?: CLBLevel;
    secondLangReading?: CLBLevel;
    secondLangWriting?: CLBLevel;

    // Work experience (foreign + Canadian)
    foreignWorkYears: WorkYears;
    canadianWorkYears: CanadianWorkYears;

    // Spouse factors (only if hasSpouse = true)
    spouseEducation?: EducationLevel;
    spouseLangListening?: CLBLevel;
    spouseLangSpeaking?: CLBLevel;
    spouseLangReading?: CLBLevel;
    spouseLangWriting?: CLBLevel;
    spouseCanadianWork?: CanadianWorkYears;

    // Additional points
    hasProvincialNomination: boolean;
    hasJobOffer: boolean;           // LMIA-exempt or LMIA
    jobOfferNocTeer: '00' | '1-3' | '4-5' | null;
    hasSiblingInCanada: boolean;
    hasCanadianFrench: boolean;     // CLB 7+ in French as second language
    hasPostSecondaryInCanada: boolean; // already captured via canadianEducation, kept separate for clarity
}

// ─── Breakdown ────────────────────────────────────────────────────────────────

export interface CRSBreakdown {
    /** A — Core human capital (no spouse) */
    coreAge: number;
    coreEducation: number;
    coreFirstLang: number;
    coreSecondLang: number;
    coreCanadianWork: number;
    coreTotal: number;

    /** B — Spouse factors */
    spouseEducation: number;
    spouseLang: number;
    spouseCanadianWork: number;
    spouseTotal: number;

    /** C — Skill transferability */
    transferability: number;

    /** D — Additional */
    additional: number;

    /** Grand total */
    total: number;
}

// ─── Helper maps ──────────────────────────────────────────────────────────────

const EDU_SCORE_NO_SPOUSE: Record<EducationLevel, number> = {
    lessThanSecondary: 0,
    secondary: 28,
    oneYear: 84,
    twoYear: 91,
    bachelors: 112,
    twoOrMoreDegrees: 119,
    masters: 126,
    phd: 140,
};

const EDU_SCORE_WITH_SPOUSE: Record<EducationLevel, number> = {
    lessThanSecondary: 0,
    secondary: 24,
    oneYear: 72,
    twoYear: 78,
    bachelors: 96,
    twoOrMoreDegrees: 102,
    masters: 108,
    phd: 119,
};

const SPOUSE_EDU_SCORE: Record<EducationLevel, number> = {
    lessThanSecondary: 0,
    secondary: 2,
    oneYear: 6,
    twoYear: 7,
    bachelors: 8,
    twoOrMoreDegrees: 9,
    masters: 10,
    phd: 10,
};

/** CLB → first-language per-skill points (no spouse) */
function firstLangSkillNoSpouse(clb: CLBLevel): number {
    if (clb >= 10) return 34;
    if (clb === 9) return 31;
    if (clb === 8) return 23;
    if (clb === 7) return 17;
    if (clb === 6) return 9;
    if (clb === 5) return 6;
    return 6; // CLB 4
}

/** CLB → first-language per-skill points (with spouse) */
function firstLangSkillWithSpouse(clb: CLBLevel): number {
    if (clb >= 10) return 29;
    if (clb === 9) return 26;
    if (clb === 8) return 20;
    if (clb === 7) return 14;
    if (clb === 6) return 8;
    if (clb === 5) return 6;
    return 6;
}

/** CLB → second-language per-skill points (both tables are the same) */
function secondLangSkill(clb: CLBLevel): number {
    if (clb >= 9) return 6;
    if (clb === 8) return 3;
    if (clb === 7) return 3;
    if (clb === 6) return 1;
    return 0; // CLB 4 or 5 = 0
}

/** CLB → spouse language per-skill points */
function spouseLangSkill(clb: CLBLevel): number {
    if (clb >= 9) return 5;
    if (clb === 8) return 3;
    if (clb === 7) return 2;
    if (clb === 6) return 1;
    return 0;
}

/** Age points — no spouse */
function ageNoSpouse(age: number): number {
    if (age <= 17) return 0;
    if (age === 18) return 99;
    if (age === 19) return 105;
    if (age >= 20 && age <= 29) return 110;
    if (age === 30) return 105;
    if (age === 31) return 99;
    if (age === 32) return 94;
    if (age === 33) return 88;
    if (age === 34) return 83;
    if (age === 35) return 77;
    if (age === 36) return 72;
    if (age === 37) return 66;
    if (age === 38) return 61;
    if (age === 39) return 55;
    if (age === 40) return 50;
    if (age === 41) return 39;
    if (age === 42) return 28;
    if (age === 43) return 17;
    if (age === 44) return 6;
    return 0;
}

/** Age points — with spouse */
function ageWithSpouse(age: number): number {
    if (age <= 17) return 0;
    if (age === 18) return 90;
    if (age === 19) return 95;
    if (age >= 20 && age <= 29) return 100;
    if (age === 30) return 95;
    if (age === 31) return 90;
    if (age === 32) return 85;
    if (age === 33) return 80;
    if (age === 34) return 75;
    if (age === 35) return 70;
    if (age === 36) return 65;
    if (age === 37) return 60;
    if (age === 38) return 55;
    if (age === 39) return 50;
    if (age === 40) return 45;
    if (age === 41) return 35;
    if (age === 42) return 25;
    if (age === 43) return 15;
    if (age === 44) return 5;
    return 0;
}

/** Canadian work experience points — no spouse */
function canadianWorkNoSpouse(y: CanadianWorkYears): number {
    switch (y) {
        case 'none': return 0;
        case 'lessThanOne': return 0;
        case 'one': return 40;
        case 'two': return 53;
        case 'threeOrMore': return 64;
    }
}

/** Canadian work experience points — with spouse */
function canadianWorkWithSpouse(y: CanadianWorkYears): number {
    switch (y) {
        case 'none': return 0;
        case 'lessThanOne': return 0;
        case 'one': return 35;
        case 'two': return 46;
        case 'threeOrMore': return 56;
    }
}

/** Spouse Canadian work experience points */
function spouseCanadianWork(y: CanadianWorkYears): number {
    switch (y) {
        case 'none': return 0;
        case 'lessThanOne': return 0;
        case 'one': return 5;
        case 'two': return 7;
        case 'threeOrMore': return 8;
    }
}

// ─── Skill Transferability (max 100) ─────────────────────────────────────────

function calcTransferability(input: CRSInput): number {
    let pts = 0;

    const avgFirstLang = Math.min(
        input.firstLangListening,
        input.firstLangSpeaking,
        input.firstLangReading,
        input.firstLangWriting,
    ) as CLBLevel;

    // Education + language
    const hasDegree = !['lessThanSecondary', 'secondary'].includes(input.educationLevel);
    if (hasDegree) {
        if (avgFirstLang >= 9) pts += 50;
        else if (avgFirstLang >= 7) pts += 25;
    }

    // Education + Canadian work
    if (hasDegree) {
        const canWork = input.canadianWorkYears;
        if (canWork === 'one') pts += 13;
        else if (canWork === 'two' || canWork === 'threeOrMore') pts += 25;
    }

    // Foreign work + Canadian work
    const foreignWork = input.foreignWorkYears;
    const hasOnePlusForeign = !['none', 'lessThanOne'].includes(foreignWork);
    const hasOnePlusCanadian = !['none', 'lessThanOne'].includes(input.canadianWorkYears);
    if (hasOnePlusForeign && hasOnePlusCanadian) {
        if (foreignWork === 'one') pts += 13;
        else if (['two', 'three', 'fourOrFive', 'sixOrMore'].includes(foreignWork)) pts += 25;
    }

    // Foreign work + language
    if (hasOnePlusForeign) {
        if (avgFirstLang >= 9) {
            pts += foreignWork === 'one' ? 25 : 50;
        } else if (avgFirstLang >= 7) {
            pts += foreignWork === 'one' ? 13 : 25;
        }
    }

    // Certificate of qualification (trades)
    // Not in CRSInput by default; users with trades + CLB 5+ language get 25 pts
    // Kept at 0 unless we add it later

    return Math.min(pts, 100);
}

// ─── Additional Points ────────────────────────────────────────────────────────

function calcAdditional(input: CRSInput): number {
    let pts = 0;

    // Provincial/Territorial Nomination — 600 pts
    if (input.hasProvincialNomination) pts += 600;

    // Job offer
    if (input.hasJobOffer) {
        if (input.jobOfferNocTeer === '00') pts += 200;
        else if (input.jobOfferNocTeer === '1-3') pts += 50;
        // TEER 4-5 = 25 (rare, add if desired)
    }

    // Sibling in Canada (citizen or PR)
    if (input.hasSiblingInCanada) pts += 15;

    // French-language skills (strong bilingualism bonus)
    if (input.hasCanadianFrench) pts += 50;

    // Post-secondary study in Canada
    if (input.canadianEducation === 'oneOrTwo') pts += 15;
    if (input.canadianEducation === 'threeOrMore') pts += 30;

    return pts;
}

// ─── Main calculator ──────────────────────────────────────────────────────────

export function calculateCRS(input: CRSInput): CRSBreakdown {
    const sp = input.hasSpouse;

    // ── A: Core human capital ──
    const coreAge = sp ? ageWithSpouse(input.age) : ageNoSpouse(input.age);

    const coreEducation = sp
        ? EDU_SCORE_WITH_SPOUSE[input.educationLevel]
        : EDU_SCORE_NO_SPOUSE[input.educationLevel];

    const skillFn = sp ? firstLangSkillWithSpouse : firstLangSkillNoSpouse;
    const coreFirstLang =
        skillFn(input.firstLangListening) +
        skillFn(input.firstLangSpeaking) +
        skillFn(input.firstLangReading) +
        skillFn(input.firstLangWriting);

    let coreSecondLang = 0;
    if (input.hasSecondLang && input.secondLangListening) {
        coreSecondLang = Math.min(
            secondLangSkill(input.secondLangListening) +
            secondLangSkill(input.secondLangSpeaking ?? 4) +
            secondLangSkill(input.secondLangReading ?? 4) +
            secondLangSkill(input.secondLangWriting ?? 4),
            22, // max 22 points for second language
        );
    }

    const coreCanadianWork = sp
        ? canadianWorkWithSpouse(input.canadianWorkYears)
        : canadianWorkNoSpouse(input.canadianWorkYears);

    const coreTotal = coreAge + coreEducation + coreFirstLang + coreSecondLang + coreCanadianWork;

    // ── B: Spouse factors (max 40) ──
    let spouseEduPts = 0;
    let spouseLangPts = 0;
    let spouseCanWork = 0;

    if (sp) {
        spouseEduPts = SPOUSE_EDU_SCORE[input.spouseEducation ?? 'lessThanSecondary'];

        if (input.spouseLangListening) {
            spouseLangPts = Math.min(
                spouseLangSkill(input.spouseLangListening) +
                spouseLangSkill(input.spouseLangSpeaking ?? 4) +
                spouseLangSkill(input.spouseLangReading ?? 4) +
                spouseLangSkill(input.spouseLangWriting ?? 4),
                20, // max 20 for spouse language
            );
        }

        spouseCanWork = spouseCanadianWork(input.spouseCanadianWork ?? 'none');
    }

    const spouseTotal = Math.min(spouseEduPts + spouseLangPts + spouseCanWork, 40);

    // ── C: Skill Transferability ──
    const transferability = calcTransferability(input);

    // ── D: Additional ──
    const additional = calcAdditional(input);

    const total = Math.min(coreTotal + spouseTotal + transferability + additional, 1200);

    return {
        coreAge,
        coreEducation,
        coreFirstLang,
        coreSecondLang,
        coreCanadianWork,
        coreTotal,
        spouseEducation: spouseEduPts,
        spouseLang: spouseLangPts,
        spouseCanadianWork: spouseCanWork,
        spouseTotal,
        transferability,
        additional,
        total,
    };
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const EDU_LABELS: Record<EducationLevel, string> = {
    lessThanSecondary: 'Less than High School',
    secondary: 'High School Diploma',
    oneYear: '1-Year Post-Secondary',
    twoYear: '2-Year Post-Secondary',
    bachelors: "Bachelor's Degree (3+ yr)",
    twoOrMoreDegrees: '2+ Post-Secondary Degrees',
    masters: "Master's Degree",
    phd: 'Doctoral (PhD)',
};

export const FOREIGN_WORK_LABELS: Record<WorkYears, string> = {
    none: 'None',
    lessThanOne: 'Less than 1 year',
    one: '1 year',
    two: '2 years',
    three: '3 years',
    fourOrFive: '4–5 years',
    sixOrMore: '6+ years',
};

export const CANADIAN_WORK_LABELS: Record<CanadianWorkYears, string> = {
    none: 'None',
    lessThanOne: 'Less than 1 year',
    one: '1 year',
    two: '2 years',
    threeOrMore: '3+ years',
};

export const CLB_OPTIONS: { label: string; value: CLBLevel }[] = [
    { label: 'CLB 4', value: 4 },
    { label: 'CLB 5', value: 5 },
    { label: 'CLB 6', value: 6 },
    { label: 'CLB 7', value: 7 },
    { label: 'CLB 8', value: 8 },
    { label: 'CLB 9', value: 9 },
    { label: 'CLB 10+', value: 10 },
];

/** Returns a qualitative band label for a given CRS score */
export function scoreBand(score: number): { label: string; color: string } {
    if (score >= 600) return { label: 'Excellent', color: '#22C55E' };
    if (score >= 470) return { label: 'Competitive', color: '#0F766E' };
    if (score >= 420) return { label: 'Moderate', color: '#F59E0B' };
    return { label: 'Building', color: '#EF4444' };
}
