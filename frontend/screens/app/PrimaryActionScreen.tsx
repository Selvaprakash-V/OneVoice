import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PrimaryActionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Conversation Mode</Text>
      <Text style={styles.subtitle}>This is the main app screen. (Coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#101A2C' },
  title: { fontSize: 28, color: '#00BFFF', fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, color: '#B0B8C1', marginBottom: 24 },
});
