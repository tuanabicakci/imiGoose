import { supabase } from '../lib/supabase';
import { CRSProfile, ImmigrationStream } from '../types';

// Map CRSProfile to/from Supabase row format
function toRow(userId: string, profile: CRSProfile) {
    return {
        id: userId,
        first_name: profile.firstName,
        last_name: profile.lastName,
        date_of_birth: profile.dateOfBirth.toISOString(),
        country_of_citizenship: profile.countryOfCitizenship,
        country_of_residence: profile.countryOfResidence,
        has_spouse: profile.hasSpouse,
        spouse_is_accompanying: profile.spouseIsAccompanying,
        spouse_is_citizen_or_pr: profile.spouseIsCitizenOrPR,
        education_level: profile.educationLevel,
        has_eca: profile.hasECA,
        canadian_education: profile.canadianEducation,
        first_lang_test_type: profile.firstLanguageTest.testType,
        first_lang_listening: profile.firstLanguageTest.listening,
        first_lang_reading: profile.firstLanguageTest.reading,
        first_lang_writing: profile.firstLanguageTest.writing,
        first_lang_speaking: profile.firstLanguageTest.speaking,
        has_second_language: profile.hasSecondLanguage,
        years_in_canada: profile.workExperience.yearsInCanada,
        years_overseas: profile.workExperience.yearsOverseas,
        noc_code: profile.workExperience.nocCode ?? null,
        job_title: profile.workExperience.jobTitle ?? null,
        has_provincial_nomination: profile.hasProvincialNomination,
        nominating_province: profile.nominatingProvince ?? null,
        has_sibling_in_canada: profile.hasSiblingInCanada,
        has_trades_certificate: profile.hasTradesCertificate,
        preferred_provinces: profile.preferredProvinces,
        immigration_stream: profile.immigrationStream ?? null,
    };
}

function fromRow(row: Record<string, any>): CRSProfile {
    return {
        id: row.id,
        firstName: row.first_name ?? '',
        lastName: row.last_name ?? '',
        dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : new Date(),
        countryOfCitizenship: row.country_of_citizenship ?? '',
        countryOfResidence: row.country_of_residence ?? '',
        hasSpouse: row.has_spouse ?? false,
        spouseIsAccompanying: row.spouse_is_accompanying ?? false,
        spouseIsCitizenOrPR: row.spouse_is_citizen_or_pr ?? false,
        educationLevel: row.education_level ?? "Bachelor's degree (3+ years)",
        hasECA: row.has_eca ?? false,
        canadianEducation: row.canadian_education ?? 'No Canadian credential',
        firstLanguageTest: {
            testType: row.first_lang_test_type ?? 'IELTS General',
            listening: row.first_lang_listening ?? 0,
            reading: row.first_lang_reading ?? 0,
            writing: row.first_lang_writing ?? 0,
            speaking: row.first_lang_speaking ?? 0,
        },
        hasSecondLanguage: row.has_second_language ?? false,
        workExperience: {
            yearsInCanada: row.years_in_canada ?? 0,
            yearsOverseas: row.years_overseas ?? 0,
            nocCode: row.noc_code ?? undefined,
            jobTitle: row.job_title ?? undefined,
        },
        hasProvincialNomination: row.has_provincial_nomination ?? false,
        nominatingProvince: row.nominating_province ?? undefined,
        hasSiblingInCanada: row.has_sibling_in_canada ?? false,
        hasTradesCertificate: row.has_trades_certificate ?? false,
        preferredProvinces: row.preferred_provinces ?? [],
        immigrationStream: (row.immigration_stream ?? undefined) as ImmigrationStream | undefined,
    };
}

export const ProfileService = {
    async saveProfile(userId: string, profile: CRSProfile): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .upsert(toRow(userId, profile), { onConflict: 'id' });
        if (error) throw new Error(error.message);
    },

    async loadProfile(userId: string): Promise<CRSProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error || !data) return null;
        return fromRow(data);
    },
};
