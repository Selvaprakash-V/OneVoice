import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchOnboardingData } from '../../services/onboardingApi';
import MainAppShell from './MainAppShell';
import { CommunicationModeProvider } from '../../context/CommunicationModeProvider';
import { colors } from '../../theme/colors';

export default function MainAppScreen() {
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      const response = await fetchOnboardingData();
      setOnboardingData(response.user.onboarding);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch onboarding data:', err);
      setError(err.message || 'Failed to load onboarding data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.neonBlue} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !onboardingData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error || 'No onboarding data found'}</Text>
        <Text style={styles.errorSubtext}>Please complete onboarding first</Text>
      </View>
    );
  }

  // Wrap MainAppShell with CommunicationModeProvider
  return (
    <CommunicationModeProvider initialMode={onboardingData.communicationPreference}>
      <MainAppShell onboarding={onboardingData} />
    </CommunicationModeProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkBackground,
  },
  loadingText: {
    color: colors.neonBlue,
    fontSize: 18,
    marginTop: 16,
  },
  errorText: {
    color: colors.neonBlue,
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 32,
  }, 
  errorSubtext: {
    color: colors.subtitle,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
