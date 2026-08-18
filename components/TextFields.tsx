import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface LabeledTextFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    icon?: keyof typeof Ionicons.glyphMap;
    isSecure?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    errorMessage?: string | null;
}

export function LabeledTextField({
    label,
    placeholder,
    value,
    onChangeText,
    icon,
    isSecure = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    autoCorrect = true,
    errorMessage,
}: LabeledTextFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputRow, isFocused && styles.inputRowFocused, !!errorMessage && styles.inputRowError]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={18}
                        color={isFocused ? Colors.imiPrimary : Colors.imiTextMuted}
                        style={styles.leadingIcon}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.imiTextMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isSecure && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {isSecure && (
                    <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeButton}>
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={Colors.imiTextMuted} />
                    </TouchableOpacity>
                )}
            </View>
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.imiTextPrimary,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.imiBorder,
        height: 52,
        paddingHorizontal: 14,
    },
    inputRowFocused: {
        borderColor: Colors.imiPrimary,
    },
    inputRowError: {
        borderColor: Colors.imiError,
    },
    leadingIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.imiTextPrimary,
    },
    eyeButton: {
        padding: 4,
    },
    errorText: {
        fontSize: 12,
        color: Colors.imiError,
        marginTop: 2,
    },
});
