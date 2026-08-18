import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import {
    ImmigrationStream,
    IMMIGRATION_STREAMS,
} from '../types';

// Per-stream accent colours + abbreviations — mirrors pathways.tsx exactly
const STREAM_META: Record<ImmigrationStream, { color: string; abbr: string }> = {
    'Federal Skilled Worker': { color: Colors.imiPrimary, abbr: 'FSW' },
    'Federal Skilled Trades': { color: Colors.imiSecondary, abbr: 'FST' },
    'Canadian Experience Class': { color: Colors.imiSuccess, abbr: 'CEC' },
    'Provincial Nominee Program': { color: Colors.imiAccent, abbr: 'PNP' },
    'Atlantic Immigration Program': { color: Colors.imiInfo, abbr: 'AIP' },
    'Family Sponsorship': { color: '#8B5CF6', abbr: 'FAS' },
    'Startup Visa': { color: '#EC4899', abbr: 'SUV' },
};

interface Props {
    selected?: ImmigrationStream;
    onSelect: (stream: ImmigrationStream) => void;
    onSkip?: () => void;
    skipLabel?: string;
}

export function ImmigrationStreamPicker({
    selected,
    onSelect,
    onSkip,
    skipLabel = 'Not sure? Select later →',
}: Props) {
    return (
        <View style={styles.container}>
            {Object.entries(IMMIGRATION_STREAMS).map(([stream, streamData]) => {
                const { color, abbr } = STREAM_META[stream as ImmigrationStream] ?? { color: Colors.imiPrimary, abbr: '' };
                const isSelected = selected === stream;
                return (
                    <TouchableOpacity
                        key={stream}
                        style={[styles.card, isSelected && { borderLeftWidth: 3, borderLeftColor: color }]}
                        onPress={() => onSelect(stream as ImmigrationStream)}
                        activeOpacity={0.85}
                    >
                        {/* Square icon box — pathways.tsx style */}
                        <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}>
                            <Ionicons
                                name={streamData.icon as any}
                                size={24}
                                color={color}
                            />
                        </View>

                        {/* Text block */}
                        <View style={styles.textBlock}>
                            <View style={styles.titleRow}>
                                <Text style={styles.name}>{stream}</Text>
                                <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
                                    <Text style={[styles.badgeText, { color }]}>{abbr}</Text>
                                </View>
                            </View>
                            <Text style={styles.desc}>{streamData.description}</Text>
                        </View>

                        {/* Checkmark when selected, chevron otherwise */}
                        {isSelected
                            ? <Ionicons name="checkmark-circle" size={20} color={color} />
                            : <Ionicons name="chevron-forward" size={16} color={Colors.imiTextMuted} />
                        }
                    </TouchableOpacity>
                );
            })}

            {onSkip && (
                <TouchableOpacity style={styles.skipLink} onPress={onSkip}>
                    <Text style={styles.skipLinkText}>{skipLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 12 },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        // Same shadow as pathways.tsx
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textBlock: { flex: 1, gap: 3 },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    name: { fontSize: 15, fontWeight: '600', color: Colors.imiTextPrimary },
    badge: {
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: { fontSize: 11, fontWeight: '700' },
    desc: { fontSize: 12, color: Colors.imiTextSecondary },
    skipLink: {
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 4,
    },
    skipLinkText: {
        fontSize: 14,
        color: Colors.imiPrimary,
        fontWeight: '500',
    },
});
