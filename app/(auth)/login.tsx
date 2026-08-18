import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { LabeledTextField } from '../../components/TextFields';
import { PrimaryButton, TextButton } from '../../components/Buttons';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        loginEmail, setLoginEmail,
        loginPassword, setLoginPassword,
        isBusy, errorMessage,
        isAuthenticated,
        hasCompletedOnboarding,
        isLoginFormValid,
        signInWithEmail,
        signInWithGoogle,
        resetPassword,
        clearError,
    } = useAuth();

    // Navigate away once auth state changes
    useEffect(() => {
        if (isAuthenticated) {
            if (!hasCompletedOnboarding) {
                router.replace('/onboarding');
            } else {
                router.replace('/(tabs)');
            }
        }
    }, [isAuthenticated, hasCompletedOnboarding]);

    const handleForgotPassword = async () => {
        if (!loginEmail) {
            Alert.alert('Enter your email first', 'Please enter your email address above.');
            return;
        }
        await resetPassword();
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.mascot}>🪿</Text>
                    <Text style={styles.appName}>imiGoose</Text>
                    <Text style={styles.tagline}>Your Immigration Journey Starts Here</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <LabeledTextField
                        label="Email Address"
                        placeholder="john@example.com"
                        value={loginEmail}
                        onChangeText={text => { setLoginEmail(text); clearError(); }}
                        icon="mail-outline"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <LabeledTextField
                        label="Password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChangeText={text => { setLoginPassword(text); clearError(); }}
                        icon="lock-closed-outline"
                        isSecure
                    />

                    <View style={styles.forgotRow}>
                        <TextButton title="Forgot Password?" onPress={handleForgotPassword} />
                    </View>
                </View>

                {/* Error */}
                {errorMessage ? (
                    <View style={styles.errorBox}>
                        <Ionicons name="warning" size={16} color={Colors.imiError} />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                {/* Sign In */}
                <PrimaryButton
                    title="Sign In"
                    onPress={signInWithEmail}
                    isLoading={isBusy}
                    disabled={!isLoginFormValid}
                    icon="arrow-forward"
                />

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Google */}
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={signInWithGoogle}
                    activeOpacity={0.85}
                >
                    <Ionicons name="logo-google" size={20} color={Colors.imiTextPrimary} />
                    <Text style={styles.googleText}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signUpRow}>
                    <Text style={styles.signUpPrompt}>Don't have an account? </Text>
                    <TextButton title="Sign Up" onPress={() => router.push('/(auth)/signup')} />
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
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 20,
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        gap: 8,
    },
    mascot: {
        fontSize: 72,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.imiPrimary,
    },
    tagline: {
        fontSize: 15,
        color: Colors.imiTextSecondary,
    },
    form: {
        gap: 16,
    },
    forgotRow: {
        alignItems: 'flex-end',
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.imiBorder,
    },
    dividerText: {
        fontSize: 14,
        color: Colors.imiTextMuted,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: 52,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.imiBorder,
    },
    googleText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.imiTextPrimary,
    },
    signUpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpPrompt: {
        fontSize: 15,
        color: Colors.imiTextSecondary,
    },
});
