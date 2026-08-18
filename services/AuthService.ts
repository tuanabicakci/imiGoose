import { supabase } from '../lib/supabase';
import { User, ImmigrationStream } from '../types';

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

// Convert Supabase user to our app User type — also exported for use in AuthContext
export function toAppUser(supabaseUser: import('@supabase/supabase-js').User): User {
    const meta = supabaseUser.user_metadata ?? {};
    return {
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        firstName: meta.first_name ?? meta.firstName ?? '',
        lastName: meta.last_name ?? meta.lastName ?? '',
        currentStep: meta.currentStep ?? 'Application',
        hasCompletedOnboarding: meta.hasCompletedOnboarding ?? false,
        immigrationStream: (meta.immigrationStream ?? undefined) as ImmigrationStream | undefined,
        crsScore: meta.crsScore ?? undefined,
        nocCode: meta.nocCode ?? undefined,
        occupation: meta.occupation ?? undefined,
        createdAt: new Date(supabaseUser.created_at),
        updatedAt: new Date(supabaseUser.updated_at ?? supabaseUser.created_at),
    };
}

export const AuthService = {
    async signInWithEmail(email: string, password: string): Promise<User> {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new AuthError(error.message);
        return toAppUser(data.user);
    },

    async signUpWithEmail(
        email: string,
        password: string,
        firstName: string,
        lastName: string
    ): Promise<User> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { first_name: firstName, last_name: lastName, currentStep: 'Application' },
            },
        });
        if (error) throw new AuthError(error.message);
        if (!data.user) throw new AuthError('Signup failed — please try again.');
        return toAppUser(data.user);
    },

    async signInWithGoogle(): Promise<User> {
        // OAuth requires a deep link redirect — for now falls back to mock
        throw new AuthError('Google sign-in requires a development build. Use email/password instead.');
    },

    async signOut(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) throw new AuthError(error.message);
    },

    async resetPassword(email: string): Promise<void> {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw new AuthError(error.message);
    },

    async getCurrentUser(): Promise<User | null> {
        const { data } = await supabase.auth.getUser();
        return data.user ? toAppUser(data.user) : null;
    },

    // Subscribe to auth state changes
    onAuthStateChange(callback: (user: User | null) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session?.user ? toAppUser(session.user) : null);
        });
    },
};
