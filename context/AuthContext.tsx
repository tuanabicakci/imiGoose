import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { User, CRSProfile, ImmigrationStream } from '../types';
import { AuthService, AuthError, toAppUser } from '../services/AuthService';
import { supabase } from '../lib/supabase';
import { ProfileService } from '../services/ProfileService';

interface AuthState {
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    currentUser: User | null;
    crsProfile: CRSProfile | null;
    isLoading: boolean;        // initial session load
    isBusy: boolean;           // form action in progress
    errorMessage: string | null;
    // Login form
    loginEmail: string;
    loginPassword: string;
    // Signup form
    signupEmail: string;
    signupPassword: string;
    signupConfirmPassword: string;
    signupFirstName: string;
    signupLastName: string;
}

interface AuthContextValue extends AuthState {
    setLoginEmail: (v: string) => void;
    setLoginPassword: (v: string) => void;
    setSignupEmail: (v: string) => void;
    setSignupPassword: (v: string) => void;
    setSignupConfirmPassword: (v: string) => void;
    setSignupFirstName: (v: string) => void;
    setSignupLastName: (v: string) => void;
    signInWithEmail: () => Promise<void>;
    signUpWithEmail: () => Promise<boolean>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: () => Promise<void>;
    completeOnboarding: (profile: CRSProfile) => Promise<void>;
    updateImmigrationStream: (stream: ImmigrationStream) => Promise<void>;
    updateNocCode: (nocCode: string, occupation: string) => Promise<void>;
    clearError: () => void;
    isLoginFormValid: boolean;
    isSignupFormValid: boolean;
    passwordMismatchError: string | null;
    passwordLengthError: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        currentUser: null,
        crsProfile: null,
        isLoading: true,   // true until session check completes
        isBusy: false,
        errorMessage: null,
        loginEmail: '',
        loginPassword: '',
        signupEmail: '',
        signupPassword: '',
        signupConfirmPassword: '',
        signupFirstName: '',
        signupLastName: '',
    });

    // ── 1. PRIMARY INIT — getSession() always resolves, even on reload ─────────
    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                if (cancelled) return;

                const su = data.session?.user ?? null;
                const user: User | null = su ? toAppUser(su) : null;

                let profile: CRSProfile | null = null;
                if (user) {
                    try { profile = await ProfileService.loadProfile(user.id); } catch { }
                }

                if (!cancelled) {
                    setState(prev => ({
                        ...prev,
                        currentUser: user,
                        isAuthenticated: !!user,
                        hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false,
                        crsProfile: profile,
                        isLoading: false,
                    }));
                }
            } catch {
                if (!cancelled) setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        init();

        // Safety net — if Supabase hangs for >5 s, unblock anyway
        const timeout = setTimeout(() => {
            setState(prev => prev.isLoading ? { ...prev, isLoading: false } : prev);
        }, 5000);

        return () => { cancelled = true; clearTimeout(timeout); };
    }, []);

    // ── 2. LIVE EVENTS — sign-in, sign-out, token refresh after init ───────────
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Skip INITIAL_SESSION — handled above by getSession() to avoid double-loading
            if (_event === 'INITIAL_SESSION') return;

            const su = session?.user ?? null;
            const user: User | null = su ? toAppUser(su) : null;

            // Fire-and-forget; always sets isLoading: false at the end
            (async () => {
                let profile: CRSProfile | null = null;
                if (user) {
                    try { profile = await ProfileService.loadProfile(user.id); } catch { }
                }
                setState(prev => ({
                    ...prev,
                    currentUser: user,
                    isAuthenticated: !!user,
                    hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false,
                    crsProfile: profile,
                    isLoading: false,
                }));
            })();
        });
        return () => subscription.unsubscribe();
    }, []);

    const setField = useCallback(<K extends keyof AuthState>(key: K, value: AuthState[K]) => {
        setState(prev => ({ ...prev, [key]: value }));
    }, []);

    const signInWithEmail = useCallback(async () => {
        setState(prev => ({ ...prev, isBusy: true, errorMessage: null }));
        try {
            await AuthService.signInWithEmail(state.loginEmail, state.loginPassword);
            // Auth state change listener will update currentUser + isAuthenticated
            setState(prev => ({ ...prev, isBusy: false, loginEmail: '', loginPassword: '' }));
        } catch (e) {
            setState(prev => ({
                ...prev,
                isBusy: false,
                errorMessage: e instanceof AuthError ? e.message : 'An unexpected error occurred',
            }));
        }
    }, [state.loginEmail, state.loginPassword]);

    const signUpWithEmail = useCallback(async (): Promise<boolean> => {
        setState(prev => ({ ...prev, isBusy: true, errorMessage: null }));
        try {
            await AuthService.signUpWithEmail(
                state.signupEmail,
                state.signupPassword,
                state.signupFirstName,
                state.signupLastName
            );
            setState(prev => ({
                ...prev,
                isBusy: false,
                signupEmail: '', signupPassword: '',
                signupConfirmPassword: '', signupFirstName: '', signupLastName: '',
            }));
            return true;
        } catch (e) {
            setState(prev => ({
                ...prev,
                isBusy: false,
                errorMessage: e instanceof AuthError ? e.message : 'An unexpected error occurred',
            }));
            return false;
        }
    }, [state.signupEmail, state.signupPassword, state.signupFirstName, state.signupLastName]);

    const signInWithGoogle = useCallback(async () => {
        setState(prev => ({ ...prev, isBusy: true, errorMessage: null }));
        try {
            await AuthService.signInWithGoogle();
        } catch (e) {
            setState(prev => ({
                ...prev,
                isBusy: false,
                errorMessage: e instanceof AuthError ? e.message : 'Google sign-in failed',
            }));
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await AuthService.signOut();
            setState(prev => ({
                ...prev,
                currentUser: null,
                crsProfile: null,
                isAuthenticated: false,
                hasCompletedOnboarding: false,
                errorMessage: null,
            }));
            try { router.replace('/(auth)/login'); } catch { /* ignore */ }
        } catch (e) {
            setState(prev => ({
                ...prev,
                errorMessage: e instanceof AuthError ? e.message : 'Failed to sign out',
            }));
        }
    }, [router]);

    const resetPassword = useCallback(async () => {
        setState(prev => ({ ...prev, isBusy: true, errorMessage: null }));
        try {
            await AuthService.resetPassword(state.loginEmail);
            setState(prev => ({ ...prev, isBusy: false, errorMessage: 'Password reset email sent!' }));
        } catch (e) {
            setState(prev => ({
                ...prev,
                isBusy: false,
                errorMessage: e instanceof AuthError ? e.message : 'Failed to send reset email',
            }));
        }
    }, [state.loginEmail]);

    const completeOnboarding = useCallback(async (profile: CRSProfile) => {
        if (!state.currentUser) return;
        // Save full CRS profile to profiles table
        await ProfileService.saveProfile(state.currentUser.id, profile);
        // Mark completion + stream in user metadata (survives sign-out)
        await supabase.auth.updateUser({
            data: {
                hasCompletedOnboarding: true,
                ...(profile.immigrationStream ? { immigrationStream: profile.immigrationStream } : {}),
            },
        });
        setState(prev => ({
            ...prev,
            crsProfile: profile,
            hasCompletedOnboarding: true,
            currentUser: prev.currentUser
                ? {
                    ...prev.currentUser,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    hasCompletedOnboarding: true,
                    immigrationStream: profile.immigrationStream,
                }
                : prev.currentUser,
        }));
    }, [state.currentUser]);

    const updateNocCode = useCallback(async (nocCode: string, occupation: string) => {
        if (!state.currentUser) return;
        setState(prev => ({
            ...prev,
            currentUser: prev.currentUser
                ? { ...prev.currentUser, nocCode, occupation }
                : prev.currentUser,
        }));
        await supabase.auth.updateUser({ data: { nocCode, occupation } });
    }, [state.currentUser]);

    const updateImmigrationStream = useCallback(async (stream: ImmigrationStream) => {
        if (!state.currentUser) return;

        // 1. Optimistically update local state immediately — UI flips right away
        const updatedProfile = state.crsProfile
            ? { ...state.crsProfile, immigrationStream: stream }
            : null;
        setState(prev => ({
            ...prev,
            ...(updatedProfile ? { crsProfile: updatedProfile } : {}),
            currentUser: prev.currentUser
                ? { ...prev.currentUser, immigrationStream: stream }
                : prev.currentUser,
        }));

        // 2. Save to DB first — MUST happen before auth.updateUser, because
        //    auth.updateUser triggers onAuthStateChange which reloads the profile
        //    from DB. If DB isn't updated yet, the reload overwrites our stream.
        if (updatedProfile) {
            try {
                await ProfileService.saveProfile(state.currentUser.id, updatedProfile);
            } catch (e) {
                console.warn('Could not save immigration_stream to profiles table:', e);
            }
        }

        // 3. Update auth metadata last — this triggers onAuthStateChange, which
        //    reloads the profile. By now DB already has the correct stream.
        await supabase.auth.updateUser({ data: { immigrationStream: stream } });
    }, [state.currentUser, state.crsProfile]);

    const isLoginFormValid =
        state.loginEmail.length > 0 &&
        state.loginPassword.length > 0 &&
        state.loginEmail.includes('@');

    const isSignupFormValid =
        state.signupEmail.length > 0 &&
        state.signupPassword.length >= 6 &&
        state.signupFirstName.length > 0 &&
        state.signupLastName.length > 0 &&
        state.signupEmail.includes('@') &&
        state.signupPassword === state.signupConfirmPassword;

    const passwordMismatchError =
        state.signupConfirmPassword.length > 0 && state.signupPassword !== state.signupConfirmPassword
            ? "Passwords don't match"
            : null;

    const passwordLengthError =
        state.signupPassword.length > 0 && state.signupPassword.length < 6
            ? 'Password must be at least 6 characters'
            : null;

    const value: AuthContextValue = {
        ...state,
        isLoading: state.isLoading,
        setLoginEmail: v => setField('loginEmail', v),
        setLoginPassword: v => setField('loginPassword', v),
        setSignupEmail: v => setField('signupEmail', v),
        setSignupPassword: v => setField('signupPassword', v),
        setSignupConfirmPassword: v => setField('signupConfirmPassword', v),
        setSignupFirstName: v => setField('signupFirstName', v),
        setSignupLastName: v => setField('signupLastName', v),
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        resetPassword,
        completeOnboarding,
        updateImmigrationStream,
        updateNocCode,
        clearError: () => setField('errorMessage', null),
        isLoginFormValid,
        isSignupFormValid,
        passwordMismatchError,
        passwordLengthError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
