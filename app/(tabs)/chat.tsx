import React, { useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform, FlatList,
    ActivityIndicator,
} from 'react-native';
import { useChat } from '../../context/ChatContext';
import { Colors } from '../../constants/Colors';
import { IMIHeaderBar } from '../../components/IMIHeaderBar';
import { SUGGESTED_PROMPTS } from '../../types';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
    const { messages, inputText, isLoading, setInputText, sendMessage, sendSuggestedPrompt } = useChat();
    const flatRef = useRef<FlatList>(null);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages.length]);

    return (
        <View style={styles.screen}>
            <IMIHeaderBar />
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                {/* Messages */}
                <FlatList
                    ref={flatRef}
                    data={messages}
                    keyExtractor={m => m.id}
                    contentContainerStyle={styles.messagesList}
                    renderItem={({ item }) => (
                        <View style={[styles.bubbleRow, item.isFromUser && styles.bubbleRowUser]}>
                            {!item.isFromUser && (
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarEmoji}>🪿</Text>
                                </View>
                            )}
                            <View style={styles.bubbleWrapper}>
                                {!item.isFromUser && <Text style={styles.sender}>imi</Text>}
                                <View style={[styles.bubble, item.isFromUser ? styles.bubbleUser : styles.bubbleBot]}>
                                    <Text style={[styles.bubbleText, item.isFromUser && styles.bubbleTextUser]}>
                                        {item.content}
                                    </Text>
                                </View>
                            </View>
                            {item.isFromUser && <View style={{ width: 36 }} />}
                        </View>
                    )}
                    ListFooterComponent={
                        isLoading ? (
                            <View style={styles.typingRow}>
                                <View style={styles.avatar}><Text style={styles.avatarEmoji}>🪿</Text></View>
                                <View style={styles.typingBubble}>
                                    <ActivityIndicator size="small" color={Colors.imiPrimary} />
                                    <Text style={styles.typingText}>imi is thinking...</Text>
                                </View>
                            </View>
                        ) : null
                    }
                />

                {/* Suggested prompts */}
                {messages.length <= 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.promptsRow}
                    >
                        {SUGGESTED_PROMPTS.map(p => (
                            <TouchableOpacity
                                key={p.id}
                                style={styles.promptChip}
                                onPress={() => sendSuggestedPrompt(p.text)}
                            >
                                {p.icon && <Ionicons name={p.icon as any} size={13} color={Colors.imiPrimary} />}
                                <Text style={styles.promptText}>{p.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Input bar */}
                <View style={styles.inputBar}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Ionicons name="add-circle" size={28} color={Colors.imiPrimary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.textInput}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask anything..."
                        placeholderTextColor={Colors.imiTextMuted}
                        multiline={false}
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                        style={styles.sendBtn}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || isLoading}
                    >
                        <Ionicons
                            name="arrow-up-circle"
                            size={34}
                            color={!inputText.trim() || isLoading ? Colors.imiTextMuted : Colors.imiPrimary}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.imiBackground },
    flex: { flex: 1 },
    messagesList: { paddingVertical: 16, paddingHorizontal: 16, gap: 12 },
    bubbleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    bubbleRowUser: { flexDirection: 'row-reverse' },
    avatar: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: `${Colors.imiPrimary}15`,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarEmoji: { fontSize: 18 },
    bubbleWrapper: { flex: 1, gap: 2 },
    sender: { fontSize: 12, fontWeight: '600', color: Colors.imiPrimary },
    bubble: {
        maxWidth: '85%',
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
    },
    bubbleUser: {
        backgroundColor: Colors.imiPrimary,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    bubbleBot: {
        backgroundColor: `${Colors.imiPrimary}15`,
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    bubbleText: { fontSize: 15, color: Colors.imiTextPrimary, lineHeight: 20 },
    bubbleTextUser: { color: Colors.white },
    typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 4 },
    typingBubble: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: `${Colors.imiPrimary}15`,
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
    },
    typingText: { fontSize: 13, color: Colors.imiTextSecondary },
    promptsRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    promptChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: Colors.white,
        borderRadius: 20, borderWidth: 1, borderColor: `${Colors.imiPrimary}40`,
        paddingHorizontal: 14, paddingVertical: 8,
    },
    promptText: { fontSize: 13, color: Colors.imiPrimary },
    inputBar: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: Colors.white,
        paddingHorizontal: 16, paddingVertical: 12,
        borderTopWidth: 1, borderTopColor: Colors.imiBorder,
    },
    attachBtn: {},
    textInput: {
        flex: 1, fontSize: 16, color: Colors.imiTextPrimary,
        backgroundColor: Colors.white,
        borderRadius: 24, borderWidth: 1, borderColor: Colors.imiBorder,
        paddingHorizontal: 16, paddingVertical: 10, maxHeight: 120,
    },
    sendBtn: {},
});
