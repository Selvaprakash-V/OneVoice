import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from './ChatController';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
      accessibilityLabel={isUser ? 'Your message' : 'Assistant message'}
    >
      <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
        {message.content}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
    color: '#222',
    letterSpacing: 0.2,
  },
  userText: {
    color: '#fff',
    fontWeight: '600',
  },
  assistantText: {
    color: '#222',
    fontWeight: '400',
  },
});

export default MessageBubble;
