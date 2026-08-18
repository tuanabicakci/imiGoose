import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { PrimaryButton } from './Buttons';

// ─── EmptyState ───

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    actionTitle?: string;
    onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionTitle, onAction }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={56} color={Colors.imiTextMuted} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {actionTitle && onAction && (
                <PrimaryButton
                    title={actionTitle}
                    onPress={onAction}
                    style={styles.actionButton}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.imiTextPrimary,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: Colors.imiTextSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    actionButton: {
        marginTop: 8,
        minWidth: 180,
    },
});
