import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  bg: '#0A0F2C',
  neonBlue: '#5AD7FF',
  neonPurple: '#C77DFF',
  softWhite: '#F1F6FF',
  mutedText: '#A9B7D0',
};

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function LoginScreen({ navigation }: any) {
  const [showEmailSignIn, setShowEmailSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    console.log('Google login pressed (placeholder)');
    // later: Firebase Google Auth
  };

  const handleEmailLogin = () => {
    navigation.navigate('EmailAuth');
  };

  const handleShowEmailSignIn = () => {
    setShowEmailSignIn(true);
    setError(null);
  };

  const handleEmailSignIn = async () => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      console.log('Successfully signed in with UID:', uid);
        // Navigation will happen automatically via AppNavigator after login
      
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sign in to OneVoice</Text>
        <Text style={styles.subtitle}>
          Your preferences and communication settings are saved securely.
        </Text>
      </View>

      {/* Google */}
      <Pressable
        style={({ pressed }) => [
          styles.googleButton,
          pressed && { opacity: 0.9 },
        ]}
        onPress={handleGoogleLogin}
      >
        <MaterialCommunityIcons
          name="google"
          size={22}
          color={COLORS.neonBlue}
          style={{ marginRight: 10 }}
        />
        <Text style={styles.googleText}>Continue with Google</Text>
      </Pressable>

      {/* Divider */}
      <Text style={styles.orText}>or</Text>

      {/* Email */}
      <Pressable onPress={handleEmailLogin}>
        <Text style={styles.emailText}>Sign up with email</Text>
      </Pressable>

      <Pressable onPress={handleShowEmailSignIn} style={{ marginTop: 18 }}>
        <Text style={[styles.emailText, { color: COLORS.neonBlue }]}>Sign in with email & password</Text>
      </Pressable>

      {showEmailSignIn && (
        <View style={{ marginTop: 28 }}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={COLORS.mutedText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.mutedText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error && <Text style={{ color: COLORS.neonPurple, marginTop: 6 }}>{error}</Text>}
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              pressed && { opacity: 0.85 },
              { marginTop: 10 },
            ]}
            onPress={handleEmailSignIn}
          >
            <Text style={styles.ctaText}>Sign in</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.neonBlue,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.softWhite,
    borderWidth: 1,
    
    marginBottom: 14,
    fontFamily: 'Inter_400Regular',
  },
  cta: {
    backgroundColor: COLORS.neonBlue,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 56,
    shadowColor: COLORS.neonBlue,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 8,
  },
  ctaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    color: '#0A0F2C',
    letterSpacing: 0.4,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },

  header: {
    marginBottom: 60,
  },

  title: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 28,
    color: COLORS.softWhite,
    marginBottom: 10,
  },

  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.neonBlue,
  },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.neonBlue,
    borderRadius: 28,
    paddingVertical: 14,
    marginBottom: 20,
  },

  googleText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: COLORS.mutedText,
  },

  orText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.mutedText,
    textAlign: 'center',
    marginBottom: 18,
  },

  emailText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: COLORS.neonPurple,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
