import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

// ─── PrimaryButton ───

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
}

export function PrimaryButton({ title, onPress, isLoading, disabled, icon, style }: PrimaryButtonProps) {
    const isDisabled = disabled || isLoading;
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            style={[styles.primary, isDisabled && styles.primaryDisabled, style]}
            activeOpacity={0.85}
        >
            {isLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
            ) : (
                <View style={styles.row}>
                    <Text style={styles.primaryText}>{title}</Text>
                    {icon && <Ionicons name={icon} size={18} color={Colors.white} style={{ marginLeft: 6 }} />}
                </View>
            )}
        </TouchableOpacity>
    );
}

// ─── SecondaryButton ───

interface SecondaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
}

export function SecondaryButton({ title, onPress, disabled, icon, style }: SecondaryButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[styles.secondary, disabled && styles.secondaryDisabled, style]}
            activeOpacity={0.8}
        >
            <View style={styles.row}>
                {icon && <Ionicons name={icon} size={16} color={Colors.imiPrimary} style={{ marginRight: 6 }} />}
                <Text style={styles.secondaryText}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── TextButton ───

interface TextButtonProps {
    title: string;
    onPress: () => void;
    color?: string;
}

export function TextButton({ title, onPress, color = Colors.imiPrimary }: TextButtonProps) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Text style={[styles.textButton, { color }]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: Colors.imiPrimary,
        borderRadius: 12,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    primaryDisabled: {
        opacity: 0.5,
    },
    primaryText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    secondary: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: Colors.imiBorder,
    },
    secondaryDisabled: {
        opacity: 0.5,
    },
    secondaryText: {
        color: Colors.imiPrimary,
        fontSize: 16,
        fontWeight: '500',
    },
    textButton: {
        fontSize: 14,
        fontWeight: '600',
    },
});
