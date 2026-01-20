import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
} from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';
import { storeOnboardingData } from '../../services/onboardingApi';

const COLORS = {
  bg: '#0A0F2C',
  cardBg: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.08)',
  neonPurple: '#C77DFF',
  neonBlue: '#5AD7FF',
  softWhite: '#F1F6FF',
  mutedText: '#A9B7D0',
};

export default function PermissionExplanationScreen({ navigation }: any) {
  const {
    textSize,
    communicationPreference,
    usageContexts,
    primaryLanguage,
    secondaryLanguage,
    setPermissionsExplained,
  } = useOnboarding();

  const handleContinue = async () => {
    try {
      const payload = {
        textSize,
        communicationPreference,
        usageContexts,
        primaryLanguage,
        secondaryLanguage,
      };
      console.log('Payload being sent to backend:', payload);
      await storeOnboardingData(payload);
    } catch (error) {
      console.warn('Failed to store onboarding data', error);
    }

    setPermissionsExplained(true);
    console.log('Navigating to Questionnaire'); // Updated log
    navigation.replace('Questionnaire'); // Updated screen name
  };

  return (
    <ImageBackground
      source={require('../../assets/bg-placeholdr.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Permissions & Privacy</Text>
        <Text style={styles.subtitle}>
          OneVoice needs a few permissions to support accessible communication.
          Nothing is used without your control.
        </Text>
      </View>

      {/* Permission cards */}
      <View style={styles.permissionList}>
        <PermissionCard
          title="Microphone"
          description="Used to convert speech into live captions so you can read conversations."
        />

        <PermissionCard
          title="Camera"
          description="Used to understand basic sign language gestures when you choose sign-based communication."
        />

        <PermissionCard
          title="Storage"
          description="Used to save transcripts and preferences securely on your device."
        />
      </View>

      {/* Footer note */}
      <Text style={styles.footerNote}>
        You can change or revoke these permissions anytime from your device
        settings.
      </Text>

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.nextButton,
          pressed && { opacity: 0.88 },
        ]}
        onPress={handleContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue to main app"
      >
        <Text style={styles.nextText}>Continue</Text>
      </Pressable>
    </ImageBackground>
  );
}

/* Reusable permission card */
function PermissionCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.permissionCard}>
      <View style={styles.imageLayer} />

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 26,
    color: COLORS.softWhite,
    marginBottom: 6,
  },

  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: COLORS.mutedText,
    lineHeight: 22,
  },

  permissionList: {
    rowGap: 16,
  },

  permissionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },

  imageLayer: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    opacity: 0.15,
  },

  cardTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.6,
    color: COLORS.neonPurple,
    marginBottom: 6,
  },

  cardDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.mutedText,
  },

  footerNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.mutedText,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
  },

  nextButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.neonBlue,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 56,
    shadowColor: COLORS.neonBlue,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },

  nextText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    color: '#0A0F2C',
    letterSpacing: 0.4,
  },
});
