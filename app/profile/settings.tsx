import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [notifs, setNotifs] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(false);
    const [biometrics, setBiometrics] = React.useState(false);

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.imiTextPrimary} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Notifications */}
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.settingCard}>
                    <SettingToggle label="Push Notifications" value={notifs} onChange={setNotifs} />
                    <View style={styles.divider} />
                    <SettingToggle label="CRS Draw Alerts" value={notifs} onChange={setNotifs} />
                    <View style={styles.divider} />
                    <SettingToggle label="Forum Replies" value={notifs} onChange={setNotifs} />
                </View>

                {/* Appearance */}
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.settingCard}>
                    <SettingToggle label="Dark Mode" value={darkMode} onChange={setDarkMode} />
                </View>

                {/* Security */}
                <Text style={styles.sectionTitle}>Security</Text>
                <View style={styles.settingCard}>
                    <SettingToggle label="Biometric Login" value={biometrics} onChange={setBiometrics} />
                    <View style={styles.divider} />
                    <SettingRow label="Change Password" onPress={() => { }} />
                    <View style={styles.divider} />
                    <SettingRow label="Delete Account" onPress={() => { }} danger />
                </View>

                {/* About */}
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.settingCard}>
                    <SettingRow label="Privacy Policy" onPress={() => { }} />
                    <View style={styles.divider} />
                    <SettingRow label="Terms of Service" onPress={() => { }} />
                    <View style={styles.divider} />
                    <View style={styles.settingRowPlain}>
                        <Text style={styles.settingLabel}>App Version</Text>
                        <Text style={styles.settingValue}>1.0.0</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function SettingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{label}</Text>
            <Switch value={value} onValueChange={onChange} trackColor={{ true: Colors.imiPrimary }} />
        </View>
    );
}

function SettingRow({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
    return (
        <TouchableOpacity style={styles.settingRow} onPress={onPress}>
            <Text style={[styles.settingLabel, danger && { color: Colors.imiError }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.imiTextMuted} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    navBar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.imiBorder,
    },
    backBtn: { width: 40 },
    navTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.imiTextPrimary, textAlign: 'center' },
    content: { padding: 16, gap: 8, paddingBottom: 60 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.imiTextMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8 },
    settingCard: { backgroundColor: Colors.white, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
    settingRowPlain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
    settingLabel: { fontSize: 15, color: Colors.imiTextPrimary },
    settingValue: { fontSize: 14, color: Colors.imiTextMuted },
    divider: { height: 1, backgroundColor: Colors.imiBorder, marginHorizontal: 16 },
});
