import React from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { IMIHeaderBar } from '../../components/IMIHeaderBar';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_USER } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { currentUser, signOut } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = currentUser ?? MOCK_USER;
    const initials = (user.firstName[0] ?? '') + (user.lastName[0] ?? '');

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Sign Out', 
                style: 'destructive', 
                onPress: async () => {
                    try {
                        await signOut();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to sign out. Please try again.');
                    }
                }
            },
        ]);
    };

    return (
        <View style={styles.screen}>
            <IMIHeaderBar />
            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.fullName}>{user.firstName} {user.lastName}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    {[
                        { label: 'CRS Score', value: String(user.crsScore ?? '—'), icon: 'bar-chart' as const },
                        { label: 'Documents', value: '7', icon: 'document-text' as const },
                        { label: 'Journey', value: user.currentStep.split('-')[0], icon: 'map' as const },
                    ].map(s => (
                        <View key={s.label} style={styles.statCard}>
                            <Ionicons name={s.icon} size={20} color={Colors.imiPrimary} />
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Menu items */}
                {[
                    { icon: 'document-text' as const, title: 'Immigration Forms', subtitle: 'IMM 1294, IMM 5257, and more' },
                    { icon: 'bookmark' as const, title: 'Saved Resources', subtitle: 'Articles, guides, and checklists' },
                    { icon: 'notifications' as const, title: 'Notifications', subtitle: 'Manage your alerts' },
                    { icon: 'settings' as const, title: 'Settings', subtitle: 'Account, privacy, and more', onPress: () => router.push('/profile/settings' as any) },
                    { icon: 'help-circle' as const, title: 'Help & Support', subtitle: 'FAQs and contact us', onPress: () => router.push('/profile/help' as any) },
                ].map(item => (
                    <TouchableOpacity key={item.title} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.8}>
                        <View style={styles.menuIconCircle}>
                            <Ionicons name={item.icon} size={20} color={Colors.imiPrimary} />
                        </View>
                        <View style={styles.menuText}>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.imiTextMuted} />
                    </TouchableOpacity>
                ))}

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.imiError} />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.version}>imiGoose v1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    content: { padding: 16, gap: 12 },
    profileCard: {
        backgroundColor: Colors.white, borderRadius: 16, padding: 24,
        alignItems: 'center', gap: 8,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: `${Colors.imiPrimary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 28, fontWeight: '700', color: Colors.imiPrimary },
    fullName: { fontSize: 20, fontWeight: '700', color: Colors.imiTextPrimary },
    email: { fontSize: 14, color: Colors.imiTextSecondary },
    editButton: {
        marginTop: 4, paddingHorizontal: 20, paddingVertical: 8,
        backgroundColor: `${Colors.imiPrimary}15`, borderRadius: 20,
    },
    editButtonText: { fontSize: 14, fontWeight: '500', color: Colors.imiPrimary },
    statsRow: { flexDirection: 'row', gap: 12 },
    statCard: {
        flex: 1, backgroundColor: Colors.white, borderRadius: 12, padding: 16,
        alignItems: 'center', gap: 4,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    statValue: { fontSize: 16, fontWeight: '700', color: Colors.imiTextPrimary },
    statLabel: { fontSize: 11, color: Colors.imiTextSecondary },
    menuItem: {
        backgroundColor: Colors.white, borderRadius: 12, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    menuIconCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: `${Colors.imiPrimary}12`,
        alignItems: 'center', justifyContent: 'center',
    },
    menuText: { flex: 1 },
    menuTitle: { fontSize: 15, fontWeight: '500', color: Colors.imiTextPrimary },
    menuSubtitle: { fontSize: 12, color: Colors.imiTextSecondary, marginTop: 2 },
    signOutButton: {
        backgroundColor: `${Colors.imiError}10`,
        borderRadius: 12, padding: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 8,
    },
    signOutText: { fontSize: 16, fontWeight: '500', color: Colors.imiError },
    version: { textAlign: 'center', fontSize: 12, color: Colors.imiTextMuted, marginTop: 4 },
});
