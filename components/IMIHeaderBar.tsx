import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface IMIHeaderBarProps {
    showNotification?: boolean;
    notificationCount?: number;
    onBellTap?: () => void;
}

export function IMIHeaderBar({
    showNotification = true,
    notificationCount = 0,
    onBellTap,
}: IMIHeaderBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
            {/* Logo */}
            <View style={styles.logoRow}>
                <Text style={styles.logoEmoji}>🪿</Text>
                <Text style={styles.logoText}>imiGoose</Text>
            </View>

            {/* Bell */}
            {showNotification && (
                <TouchableOpacity onPress={onBellTap} style={styles.bellButton}>
                    <Ionicons name="notifications" size={22} color={Colors.white} />
                    {notificationCount > 0 && <View style={styles.badge} />}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.imiPrimary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoEmoji: {
        fontSize: 24,
    },
    logoText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.white,
    },
    bellButton: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.imiAccent,
    },
});
