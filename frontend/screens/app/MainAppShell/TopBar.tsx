import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useCommunicationMode } from '../../../context/CommunicationModeProvider';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

interface TopBarProps {
  activeContext: string;
  onboarding: {
    communicationPreference: 'text' | 'sign' | 'both';
  };
}

const TopBar: React.FC<TopBarProps> = ({ activeContext, onboarding }) => {
  // Access global communication mode
  const { mode, setMode } = useCommunicationMode();

  // Temporary toggle UI, only if onboarding.preference is 'both'
  const showToggle = onboarding.communicationPreference === 'both';

  return (
    <View style={styles.topBar}>
      <Ionicons name="menu" size={28} color={colors.neonBlue} style={styles.icon} />
      <Text style={styles.contextName}>
        {activeContext.charAt(0).toUpperCase() + activeContext.slice(1)} Context
      </Text>
      <Ionicons name="person-circle-outline" size={28} color={colors.neonBlue} style={styles.icon} />
      {/* Temporary mode toggle for verification */}
      {showToggle && (
        <View style={styles.toggleContainer}>
          {(['text', 'sign', 'both'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={[styles.toggleButton, mode === m && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.sidebarBackground,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neonBlue,
  },
  contextName: {
    color: colors.neonBlue,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  icon: {
    width: 32,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginLeft: 12,
    backgroundColor: 'transparent',
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 2,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neonBlue,
  },
  toggleButtonActive: {
    backgroundColor: colors.neonBlue,
  },
  toggleText: {
    color: colors.neonBlue,
    fontSize: 14,
  },
  toggleTextActive: {
    color: colors.darkBackground,
    fontWeight: 'bold',
  },
});

export default TopBar;
