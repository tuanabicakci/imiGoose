import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ForumProvider } from '../context/ForumContext';
import { ChatProvider } from '../context/ChatContext';
import { Colors } from '../constants/Colors';

function AuthGate() {
    const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return; // Wait for Supabase session to resolve

        const inAuth = segments[0] === '(auth)';
        const inOnboarding = segments[0] === 'onboarding';
        const inTabs = segments[0] === '(tabs)';
        const inForum = segments[0] === 'forum';
        const inProfile = segments[0] === 'profile';

        if (!isAuthenticated) {
            if (!inAuth) {
                router.replace('/(auth)/login');
            }
        } else if (!hasCompletedOnboarding) {
            if (!inOnboarding) {
                router.replace('/onboarding');
            }
        } else {
            // Authenticated and onboarding completed - allow tabs, forum, and profile routes
            if (!inTabs && !inForum && !inProfile) {
                router.replace('/(tabs)');
            }
        }
    }, [isAuthenticated, hasCompletedOnboarding, isLoading, segments]);

    // Show splash while checking session
    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.imiBackground }}>
                <ActivityIndicator color={Colors.imiPrimary} size="large" />
            </View>
        );
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <StatusBar style="light" />
                <AuthProvider>
                    <ForumProvider>
                        <ChatProvider>
                            <AuthGate />
                        </ChatProvider>
                    </ForumProvider>
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
