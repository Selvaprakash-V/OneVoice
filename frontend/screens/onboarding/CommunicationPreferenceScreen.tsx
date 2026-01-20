import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ImageBackground,
} from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';

const COLORS = {
  bg: '#0A0F2C',
  cardBg: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.08)',
  neonPurple: '#C77DFF',
  neonBlue: '#5AD7FF',
  softWhite: '#F1F6FF',
  mutedText: '#A9B7D0',
};

const IMAGES = {
  text: require('../../assets/text.png'),
  sign: require('../../assets/signlang.png'),
  both: require('../../assets/both.png'),
};

export default function CommunicationPreferenceScreen({ navigation }: any) {
  const { communicationPreference, setCommunicationPreference } =
    useOnboarding();

  return (
    <ImageBackground
      source={require('../../assets/bg-placeholdr.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          How do you prefer to communicate?
        </Text>
        <Text style={styles.subtitle}>
          Choose what you’re most comfortable using.
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.grid}>
        {/* TEXT */}
        <Pressable
          style={[
            styles.card,
            communicationPreference === 'text' && styles.cardActive,
          ]}
          onPress={() => setCommunicationPreference('text')}
        >
          <View style={[styles.imageLayer, { pointerEvents: 'none' }]}>
            <Image
              source={IMAGES.text}
              style={styles.contextImage}
            />
          </View>

          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardTitle,
                communicationPreference === 'text' &&
                  styles.cardTitleActive,
              ]}
            >
              Text
            </Text>
            <Text style={styles.cardDescription}>
              Read live captions and messages.
            </Text>
          </View>
        </Pressable>

        {/* SIGN */}
        <Pressable
          style={[
            styles.card,
            communicationPreference === 'sign' && styles.cardActive,
          ]}
          onPress={() => setCommunicationPreference('sign')}
        >
          <View style={[styles.imageLayer, { pointerEvents: 'none' }]}>
            <Image
              source={IMAGES.sign}
              style={styles.contextImage}
            />
          </View>

          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardTitle,
                communicationPreference === 'sign' &&
                  styles.cardTitleActive,
              ]}
            >
              Sign Language
            </Text>
            <Text style={styles.cardDescription}>
              Communicate using hand gestures.
            </Text>
          </View>
        </Pressable>
      </View>

      {/* BOTH */}
      <Pressable
        style={[
          styles.cardWide,
          communicationPreference === 'both' && styles.cardActive,
        ]}
        onPress={() => setCommunicationPreference('both')}
      >
        <View style={[styles.imageLayer, { pointerEvents: 'none' }]}>
          <Image
            source={IMAGES.both}
            style={styles.contextImageWide}
          />
        </View>

        <View style={styles.cardContent}>
          <Text
            style={[
              styles.cardTitle,
              communicationPreference === 'both' &&
                styles.cardTitleActive,
            ]}
          >
            Both
          </Text>
          <Text style={styles.cardDescription}>
            Switch between text and sign anytime.
          </Text>
        </View>
      </Pressable>

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.nextButton,
          pressed && { opacity: 0.88 },
        ]}
        onPress={() => navigation.navigate('UsageContext')}
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

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    minHeight: 190,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },

  cardWide: {
    marginTop: 18,
    minHeight: 150,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },

  cardActive: {
    borderColor: COLORS.neonPurple,
  },

  imageLayer: {
    position: 'absolute',
    top: -50,
    left: -40,
    right: -40,
    bottom: -40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.25,
  },

  contextImage: {
    width: '160%',
    height: '160%',
    resizeMode: 'cover',
  },

  contextImageWide: {
    width: '140%',
    height: '140%',
    resizeMode: 'cover',
  },

  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  cardTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.6,
    color: COLORS.neonBlue,
    marginBottom: 6,
    textAlign: 'center',
  },

  cardTitleActive: {
    color: COLORS.neonPurple,
  },

  cardDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.mutedText,
    textAlign: 'center',
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
