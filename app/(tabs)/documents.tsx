import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { IMIHeaderBar } from '../../components/IMIHeaderBar';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_DOCUMENTS, ImmigrationDocument } from '../../types';

export default function DocumentsScreen() {
    const [docs, setDocs] = useState<ImmigrationDocument[]>(MOCK_DOCUMENTS);

    const toggleComplete = (id: string) => {
        setDocs(prev => prev.map(d => d.id === id ? { ...d, isCompleted: !d.isCompleted } : d));
    };

    const completed = docs.filter(d => d.isCompleted).length;
    const total = docs.length;

    const categories = [...new Set(docs.map(d => d.category))];

    return (
        <View style={styles.screen}>
            <IMIHeaderBar />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.heading}>Document Checklist</Text>
                <Text style={styles.sub}>Track your immigration documents</Text>

                {/* Progress */}
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressText}>{completed}/{total} documents ready</Text>
                        <Text style={styles.progressPct}>{Math.round((completed / total) * 100)}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${(completed / total) * 100}%` }]} />
                    </View>
                </View>

                {/* Grouped by category */}
                {categories.map(cat => (
                    <View key={cat}>
                        <Text style={styles.catLabel}>{cat}</Text>
                        {docs.filter(d => d.category === cat).map(doc => (
                            <TouchableOpacity
                                key={doc.id}
                                style={styles.docItem}
                                onPress={() => toggleComplete(doc.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.checkbox, doc.isCompleted && styles.checkboxChecked]}>
                                    {doc.isCompleted && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                                </View>
                                <View style={styles.docText}>
                                    <Text style={[styles.docName, doc.isCompleted && styles.docNameDone]}>{doc.name}</Text>
                                    {doc.isRequired && <Text style={styles.requiredTag}>Required</Text>}
                                </View>
                                <Ionicons
                                    name={doc.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={20}
                                    color={doc.isCompleted ? Colors.imiSuccess : Colors.imiTextMuted}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    content: { padding: 16, paddingBottom: 100, gap: 12 },
    heading: { fontSize: 22, fontWeight: '700', color: Colors.imiTextPrimary },
    sub: { fontSize: 14, color: Colors.imiTextSecondary },
    progressCard: {
        backgroundColor: Colors.white, borderRadius: 12, padding: 16, gap: 10,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressText: { fontSize: 14, fontWeight: '600', color: Colors.imiTextPrimary },
    progressPct: { fontSize: 16, fontWeight: '700', color: Colors.imiPrimary },
    progressTrack: { height: 8, backgroundColor: Colors.imiBorder, borderRadius: 4 },
    progressFill: { height: 8, backgroundColor: Colors.imiPrimary, borderRadius: 4 },
    catLabel: {
        fontSize: 13, fontWeight: '700', color: Colors.imiTextMuted,
        textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4,
    },
    docItem: {
        backgroundColor: Colors.white, borderRadius: 10, padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
        marginTop: 6,
    },
    checkbox: {
        width: 22, height: 22, borderRadius: 6,
        borderWidth: 2, borderColor: Colors.imiBorder,
        alignItems: 'center', justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: Colors.imiSuccess, borderColor: Colors.imiSuccess },
    docText: { flex: 1, gap: 2 },
    docName: { fontSize: 14, fontWeight: '500', color: Colors.imiTextPrimary },
    docNameDone: { textDecorationLine: 'line-through', color: Colors.imiTextMuted },
    requiredTag: { fontSize: 11, color: Colors.imiAccent, fontWeight: '600' },
});
