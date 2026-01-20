import React from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator } from 'react-native';
import MessageBubble from './MessageBubble';
import { Message } from './ChatController';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageBubble message={item} />}
      contentContainerStyle={styles.list}
      inverted
      ListFooterComponent={isTyping ? (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      ) : null}
      accessibilityLabel="Chat message list"
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingVertical: 8,
  },
  typingIndicator: {
    alignItems: 'flex-start',
    marginLeft: 8,
    marginBottom: 8,
  },
});

export default MessageList;
