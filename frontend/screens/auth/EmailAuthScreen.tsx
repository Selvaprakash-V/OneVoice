import React, { useState, useRef } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { logUid } from '../../services/logUid';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';

const COLORS = {
  bg: '#0A0F2C',
  neonBlue: '#5AD7FF',
  neonPurple: '#C77DFF',
  softWhite: '#F1F6FF',
  mutedText: '#A9B7D0',
  inputBg: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.12)',
  success: '#4CAF50',
  error: '#FF6B6B',
};

export default function EmailAuthScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [firebaseSuccess, setFirebaseSuccess] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  /* ───────── Validation ───────── */

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch =
    password.length > 0 && password === confirmPassword;

  const allValid =
    emailValid &&
    hasMinLength &&
    hasUppercase &&
    hasSymbol &&
    passwordsMatch;

  /* ───────── Shake animation ───────── */

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const ruleColor = (ok: boolean) => {
    if (!submitted) return COLORS.mutedText;
    return ok ? COLORS.success : COLORS.error;
  };

  const handleContinue = async () => {
    setSubmitted(true);
    setFirebaseError(null);
    setFirebaseSuccess(false);
    if (!allValid) {
      triggerShake();
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      logUid(userCredential.user.uid);
      setFirebaseSuccess(true);
      setTimeout(() => {
        navigation.replace('VisualPreferenceScreen');
      }, 1200);
    } catch (err: any) {
      setFirebaseError(err.message || 'Failed to create user');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Continue with email</Text>
          <Text style={styles.subtitle}>
            Your email securely stores your preferences and communication data.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
            placeholder="Create password"
            placeholderTextColor={COLORS.mutedText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor={COLORS.mutedText}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {/* Rules */}
          <View style={styles.rules}>
            {[
              { ok: hasMinLength, text: 'Minimum 8 characters' },
              { ok: hasUppercase, text: 'At least one uppercase letter' },
              { ok: hasSymbol, text: 'At least one symbol' },
              { ok: passwordsMatch, text: 'Passwords match' },
              { ok: emailValid, text: 'Valid email address' },
            ].map((rule, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.rule,
                  {
                    color: ruleColor(rule.ok),
                    transform: [
                      {
                        translateX:
                          submitted && !rule.ok
                            ? shakeAnim.interpolate({
                                inputRange: [-1, 1],
                                outputRange: [-6, 6],
                              })
                            : 0,
                      },
                    ],
                  },
                ]}
              >
                • {rule.text}
              </Animated.Text>
            ))}
          </View>
          {firebaseError && (
            <Text style={{ color: COLORS.error, marginTop: 10, textAlign: 'center' }}>{firebaseError}</Text>
          )}
          {firebaseSuccess && (
            <Text style={{ color: COLORS.success, marginTop: 10, textAlign: 'center' }}>Account successfully created!</Text>
          )}
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.ctaText}>Continue</Text>
          </Pressable>

          <Text style={styles.legal}>
            Your data is encrypted and never shared without consent.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
/* ───────── Styles ───────── */

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
    fontSize: 28,
    color: COLORS.softWhite,
    marginBottom: 8,
  },

  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.mutedText,
  },

  form: {
    marginTop: 12,
  },

  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.softWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    fontFamily: 'Inter_400Regular',
  },

  rules: {
    marginTop: 6,
    marginLeft: 4,
  },

  rule: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },

  footer: {
    alignItems: 'center',
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
    marginBottom: 18,
  },

  ctaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    color: '#0A0F2C',
    letterSpacing: 0.4,
  },

  legal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.mutedText,
    textAlign: 'center',
    maxWidth: '90%',
  },
});
