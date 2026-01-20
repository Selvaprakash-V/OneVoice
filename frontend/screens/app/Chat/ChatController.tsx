import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

interface ChatControllerProps {
  activeContext: string;
}

const contextPrompts: Record<string, string> = {
  daily: 'You are helping with daily conversations.',
  classroom: 'You are assisting in a classroom for a deaf student.',
  workplace: 'You are supporting workplace communication for a deaf user.',
  public: 'You are assisting with public interactions for a deaf user.',
};

const getSystemPrompt = (context: string) => {
  return contextPrompts[context] || 'You are helping with daily conversations.';
};

const ChatController: React.FC<ChatControllerProps> = ({ activeContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Reset messages when context changes
  useEffect(() => {
    setMessages([]);
  }, [activeContext]);

  const sendMessage = useCallback((userText: string) => {
    if (!userText.trim()) return;
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate assistant response
    setTimeout(() => {
      const systemPrompt = getSystemPrompt(activeContext);
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: `${systemPrompt}\n\n(Assistant reply to: "${userText}")`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1200);
  }, [activeContext]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.chatArea}>
        <MessageList messages={messages} isTyping={isTyping} />
      </View>
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
});

export default ChatController;
