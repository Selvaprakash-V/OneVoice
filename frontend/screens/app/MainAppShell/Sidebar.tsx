import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

interface SidebarProps {
  contexts: string[];
  activeContext: string;
  onSelectContext: (context: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ contexts, activeContext, onSelectContext }) => {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.title}>Contexts</Text>
      <ScrollView contentContainerStyle={styles.contextList}>
        {contexts.map((context) => (
          <TouchableOpacity
            key={context}
            style={[
              styles.contextButton,
              activeContext === context && styles.activeContextButton,
            ]}
            onPress={() => onSelectContext(context)}
            accessibilityLabel={`Switch to ${context} context`}
          >
            <Text
              style={[
                styles.contextText,
                activeContext === context && styles.activeContextText,
              ]}
            >
              {context.charAt(0).toUpperCase() + context.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.chatHistorySection}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.neonBlue} />
        <Text style={styles.chatHistoryText}>Chat History (empty)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 120,
    backgroundColor: colors.sidebarBackground,
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    height: '100%',
  },
  title: {
    color: colors.neonBlue,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    alignSelf: 'center',
  },
  contextList: {
    flexGrow: 1,
  },
  contextButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  activeContextButton: {
    backgroundColor: colors.neonBlue,
  },
  contextText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'left',
  },
  activeContextText: {
    color: colors.sidebarBackground,
    fontWeight: 'bold',
  },
  chatHistorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.darkBackground,
  },
  chatHistoryText: {
    color: colors.neonBlue,
    marginLeft: 8,
    fontSize: 12,
  },
});

export default Sidebar;
