import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { LabeledTextField } from '../../components/TextFields';
import { PrimaryButton } from '../../components/Buttons';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        signupFirstName, setSignupFirstName,
        signupLastName, setSignupLastName,
        signupEmail, setSignupEmail,
        signupPassword, setSignupPassword,
        signupConfirmPassword, setSignupConfirmPassword,
        isBusy, errorMessage,
        isAuthenticated,
        isSignupFormValid,
        passwordMismatchError,
        passwordLengthError,
        signUpWithEmail,
        clearError,
    } = useAuth();

    const handleSignUp = async () => {
        const success = await signUpWithEmail();
        if (success) {
            // Navigate to onboarding. Works whether Supabase email confirmation
            // is enabled (no session yet) or disabled (session set immediately).
            router.replace('/onboarding');
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/onboarding');
        }
    }, [isAuthenticated]);

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={Colors.imiTextPrimary} />
            </TouchableOpacity>

            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join thousands on their immigration journey</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.nameRow}>
                        <View style={styles.halfField}>
                            <LabeledTextField
                                label="First Name"
                                placeholder="John"
                                value={signupFirstName}
                                onChangeText={v => { setSignupFirstName(v); clearError(); }}
                                icon="person-outline"
                                autoCapitalize="words"
                            />
                        </View>
                        <View style={styles.halfField}>
                            <LabeledTextField
                                label="Last Name"
                                placeholder="Doe"
                                value={signupLastName}
                                onChangeText={v => { setSignupLastName(v); clearError(); }}
                                icon="person-outline"
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    <LabeledTextField
                        label="Email Address"
                        placeholder="john@example.com"
                        value={signupEmail}
                        onChangeText={v => { setSignupEmail(v); clearError(); }}
                        icon="mail-outline"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <LabeledTextField
                        label="Password"
                        placeholder="Min. 8 characters"
                        value={signupPassword}
                        onChangeText={v => { setSignupPassword(v); clearError(); }}
                        icon="lock-closed-outline"
                        isSecure
                        errorMessage={passwordLengthError}
                    />

                    <LabeledTextField
                        label="Confirm Password"
                        placeholder="Repeat your password"
                        value={signupConfirmPassword}
                        onChangeText={v => { setSignupConfirmPassword(v); clearError(); }}
                        icon="lock-closed-outline"
                        isSecure
                        errorMessage={passwordMismatchError}
                    />
                </View>

                {errorMessage ? (
                    <View style={styles.errorBox}>
                        <Ionicons name="warning" size={16} color={Colors.imiError} />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                <PrimaryButton
                    title="Create Account"
                    onPress={handleSignUp}
                    isLoading={isBusy}
                    disabled={!isSignupFormValid}
                    icon="checkmark"
                />

                <View style={styles.loginRow}>
                    <Text style={styles.loginPrompt}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.imiBackground,
    },
    backButton: {
        padding: 16,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 20,
    },
    titleRow: {
        gap: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.imiTextPrimary,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.imiTextSecondary,
    },
    form: {
        gap: 16,
    },
    nameRow: {
        flexDirection: 'row',
        gap: 12,
    },
    halfField: {
        flex: 1,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: `${Colors.imiError}15`,
        borderRadius: 8,
        padding: 12,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: Colors.imiError,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginPrompt: {
        fontSize: 15,
        color: Colors.imiTextSecondary,
    },
    loginLink: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.imiPrimary,
    },
});
