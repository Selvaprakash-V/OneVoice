import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type your message..."
        placeholderTextColor="#888"
        editable={!disabled}
        returnKeyType="send"
        onSubmitEditing={handleSend}
        accessibilityLabel="Chat input field"
        accessibilityHint="Enter your message"
      />
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={disabled}
        accessibilityLabel="Send message"
        accessibilityState={{ disabled }}
      >
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    marginRight: 8,
    color: '#222',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChatInput;
