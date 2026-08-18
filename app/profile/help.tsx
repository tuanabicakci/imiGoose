import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FAQS = [
    {
        q: 'What is Express Entry?',
        a: 'Express Entry is Canada\'s online immigration application management system for skilled workers. It manages three federal economic programs: Federal Skilled Worker, Federal Skilled Trades, and Canadian Experience Class.',
    },
    {
        q: 'How is the CRS score calculated?',
        a: 'The Comprehensive Ranking System awards points based on age, education, language ability, Canadian work experience, and adaptability factors like having a job offer or a provincial nomination.',
    },
    {
        q: 'How often are Express Entry draws held?',
        a: 'IRCC typically holds draws every two weeks, although the frequency and category can vary. Draws may target all programs or specific categories like STEM, healthcare, or trade workers.',
    },
    {
        q: 'What documents do I need for Express Entry?',
        a: 'You\'ll need a valid passport, language test results (IELTS/CELPIP/TEF), educational credentials assessment (ECA), employment records, police clearance certificates, and medical exam results.',
    },
    {
        q: 'Can I improve my CRS score?',
        a: 'Yes! You can improve by retaking language tests, gaining Canadian work experience, obtaining a provincial nomination (+600 pts), securing a qualifying job offer, or completing additional education in Canada.',
    },
    {
        q: 'What is the difference between inland and outland spousal sponsorship?',
        a: 'Inland sponsorship is for spouses already in Canada; they can stay and work while the application is processed. Outland is for spouses outside Canada; it\'s typically faster and the sponsor can appeal decisions.',
    },
];

export default function HelpSupportScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.imiTextPrimary} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Contact card */}
                <View style={styles.contactCard}>
                    <Text style={styles.contactEmoji}>🪿</Text>
                    <Text style={styles.contactTitle}>Need Help?</Text>
                    <Text style={styles.contactSub}>Our team is here for you. Reach out anytime.</Text>
                    <TouchableOpacity style={styles.contactBtn}>
                        <Ionicons name="mail" size={16} color={Colors.white} />
                        <Text style={styles.contactBtnText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQs */}
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                {FAQS.map((faq, i) => (
                    <TouchableOpacity
                        key={i}
                        style={styles.faqCard}
                        onPress={() => setExpanded(expanded === i ? null : i)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.faqHeader}>
                            <Text style={styles.faqQuestion}>{faq.q}</Text>
                            <Ionicons name={expanded === i ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.imiTextMuted} />
                        </View>
                        {expanded === i && (
                            <Text style={styles.faqAnswer}>{faq.a}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
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
    content: { padding: 16, gap: 12, paddingBottom: 60 },
    contactCard: {
        backgroundColor: Colors.imiPrimary, borderRadius: 16, padding: 24,
        alignItems: 'center', gap: 8,
    },
    contactEmoji: { fontSize: 40 },
    contactTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
    contactSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
    contactBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4,
    },
    contactBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.imiTextPrimary },
    faqCard: {
        backgroundColor: Colors.white, borderRadius: 12, padding: 16, gap: 10,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.imiTextPrimary, lineHeight: 20 },
    faqAnswer: { fontSize: 14, color: Colors.imiTextSecondary, lineHeight: 20 },
});
