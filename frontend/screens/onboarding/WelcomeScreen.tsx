import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
} from 'react-native';

const COLORS = {
  neonBlue: '#5AD7FF',
  neonPurple: '#C77DFF',
  softWhite: '#F1F6FF',
  mutedText: '#A9B7D0',
  darkBg: 'rgba(0,0,0,0.35)',
};

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const [brandPressed, setBrandPressed] = useState(false);

  return (
    <ImageBackground
      source={require('../../assets/bg-placeholder.png')}
      style={styles.background}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    >
      {/* Overlay for readability */}
      <View style={styles.overlay} />

      <View style={styles.container}>
        {/* TOP SECTION */}
        <View style={styles.topSection}>
          {/* Logo */}<View style={styles.logoGlow}>
  <View style={styles.logoMask}>
    <View style={styles.logoCircle}>
  <Image
    source={require('../../assets/logo.png')}
    style={styles.logoImage}
    resizeMode="cover"
  />
</View>
  </View>
</View>




          {/* App name */}
          <Pressable
            onPressIn={() => setBrandPressed(true)}
            onPressOut={() => setBrandPressed(false)}
            accessibilityRole="text"
          >
            <Text
              style={[
                styles.brand,
                {
                  color: brandPressed
                    ? COLORS.neonPurple
                    : COLORS.neonBlue,
                },
              ]}
            >
              OneVoice
            </Text>
          </Pressable>

          {/* Headline */}
          <Text style={styles.title}>
            Understand{' '}
            <Text style={styles.titleAccent}>Conversations</Text>
          </Text>

          {/* Tagline */}
          <Text style={styles.subtitlePrimary}>
            Be understood anywhere.
          </Text>
          <Text style={styles.subtitleSecondary}>
            Communicate freely.
          </Text>
        </View>

        {/* BOTTOM CTA */}
        <View style={styles.bottomSection}>
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text style={styles.ctaText}>Get started</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.darkBg,
  },

  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 72,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },

  topSection: {
    alignItems: 'center',
    marginTop: 24, // pushes everything slightly down
  },

  logoGlow: {
  width: 96,
  height: 96,
  borderRadius: 48,
  marginBottom: 12,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: COLORS.neonPurple,
  shadowOpacity: 0.7,
  shadowRadius: 22,
  elevation: 12,
},

logoMask: {
  width: 96,
  height: 96,
  borderRadius: 48,
  backgroundColor: 'rgba(255,255,255,0.85)',
  alignItems: 'center',
  justifyContent: 'center',
},

logoCircle: {
  width: 90,
  height: 90,
  borderRadius: 45,        // EXACTLY half
  overflow: 'hidden',      // 🔒 this is what clips
  backgroundColor: '#fff', // or transparent
  alignItems: 'center',
  justifyContent: 'center',
},

logoImage: {
  width: '100%',
  height: '100%',
},



  brand: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 24,
    letterSpacing: 1.4,
    marginTop: 0,
    marginBottom: 42,
  },

  title: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 36,
    lineHeight: 40,
    color: COLORS.softWhite,
    textAlign: 'center',
    marginBottom: 14,
    marginTop: 22, // NEW

  },

  titleAccent: {
    color: COLORS.neonPurple,
  },

    subtitlePrimary: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 22,
    color: COLORS.softWhite,
    textAlign: 'center',
  },

  subtitleSecondary: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.mutedText,
    textAlign: 'center',
    marginTop: 1,
    maxWidth: '90%',
  },

  bottomSection: {
    alignItems: 'center',
  },

  cta: {
    backgroundColor: COLORS.neonBlue,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 48,
    shadowColor: COLORS.neonBlue,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
  },

  ctaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    color: '#0A0F2C',
    letterSpacing: 0.4,
  },
});
