import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
} from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';

const COLORS = {
  bg: '#0A0F2C',
  cardBg: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.08)',
  neonBlue: '#5AD7FF',
  neonPurple: '#C77DFF',
  softWhite: '#F1F6FF',
  mutedText: '#A9B7D0',
};

export default function VisualPreferenceScreen({ navigation }: any) {
  const { textSize, setTextSize } = useOnboarding();

  const isLarge = textSize === 'large';
  const isExtraLarge = textSize === 'extra-large';

  return (
    <ImageBackground
      source={require('../../assets/bg-placeholdr.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose your text size</Text>
        <Text style={styles.subtitle}>
          Pick what feels most comfortable to read.
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.cardRow}>
        {/* Large Text */}
        <Pressable
          style={[styles.card, isLarge && styles.cardActive]}
          onPress={() => setTextSize('large')}
        >
          <Text
            style={[
              styles.cardTitle,
              isLarge && styles.cardTitleActive,
            ]}
          >
            Large Text
          </Text>

          <Text style={styles.sampleLarge}>
            This is how your text will look.
          </Text>
        </Pressable>

        {/* Extra Large */}
        <Pressable
          style={[styles.card, isExtraLarge && styles.cardActive]}
          onPress={() => setTextSize('extra-large')}
        >
          <Text
            style={[
              styles.cardTitle,
              isExtraLarge && styles.cardTitleActive,
            ]}
          >
            Extra Large
          </Text>

          <Text style={styles.sampleExtraLarge}>
            This is how your text will look.
          </Text>
        </Pressable>
      </View>

      {/* Helper */}
      <Text style={styles.helperText}>
        If you don’t choose anything, the app will use the standard text size.
        You can change this later at any time.
      </Text>

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.nextButton,
          pressed && { opacity: 0.88 },
        ]}
        onPress={() => navigation.navigate('CommunicationPreference')}
      >
        <Text style={styles.nextText}>Next</Text>
      </Pressable>
    </ImageBackground>
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
    marginBottom: 30,
  },

  title: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 26,
    color: COLORS.neonBlue,
    marginBottom: 6,
  },

  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: COLORS.mutedText,
    lineHeight: 22,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  card: {
    width: '48%',
    minHeight: 160,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  cardActive: {
    borderColor: COLORS.neonPurple,
  },

  cardTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.6,
    color: COLORS.mutedText,
    marginBottom: 14,
  },

  cardTitleActive: {
    color: COLORS.neonPurple,
  },

  sampleLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 26,
    color: COLORS.softWhite,
  },

  sampleExtraLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 22,
    lineHeight: 30,
    color: COLORS.softWhite,
  },

  helperText: {
    marginTop: 30,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.mutedText,
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
