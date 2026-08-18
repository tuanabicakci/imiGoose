import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChatMessage, SUGGESTED_PROMPTS } from '../types';
import { ChatService } from '../services/ChatService';

interface ChatContextValue {
    messages: ChatMessage[];
    inputText: string;
    isLoading: boolean;
    setInputText: (v: string) => void;
    sendMessage: () => Promise<void>;
    sendSuggestedPrompt: (prompt: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const WELCOME_MESSAGE: ChatMessage = {
    id: 'welcome',
    content: "👋 Hi! I'm **imi**, your immigration guide. Ask me anything about Express Entry, CRS scores, PNP programs, or your immigration journey!",
    isFromUser: false,
    timestamp: new Date(),
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendUserMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            content: text,
            isFromUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await ChatService.sendMessage(messages, text);
            setMessages(prev => [...prev, response]);
        } catch {
            const errorMsg: ChatMessage = {
                id: `err-${Date.now()}`,
                content: 'Sorry, I encountered an issue. Please try again.',
                isFromUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        }
        setIsLoading(false);
    }, [messages, isLoading]);

    const sendMessage = useCallback(() => sendUserMessage(inputText), [inputText, sendUserMessage]);
    const sendSuggestedPrompt = useCallback((prompt: string) => sendUserMessage(prompt), [sendUserMessage]);

    return (
        <ChatContext.Provider value={{
            messages, inputText, isLoading,
            setInputText, sendMessage, sendSuggestedPrompt,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat(): ChatContextValue {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within ChatProvider');
    return ctx;
}
