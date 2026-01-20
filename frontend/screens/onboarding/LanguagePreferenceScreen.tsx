import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ImageBackground,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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

export default function LanguagePreferenceScreen({ navigation }: any) {
  const {
    primaryLanguage,
    secondaryLanguage,
    setPrimaryLanguage,
    setSecondaryLanguage,
  } = useOnboarding();

  const [primary, setPrimary] = useState(primaryLanguage || '');
  const [secondary, setSecondary] = useState(secondaryLanguage || '');

  const indianLanguages = [
    'Hindi',
    'Bengali',
    'Telugu',
    'Marathi',
    'Tamil',
    'Urdu',
    'Gujarati',
    'Kannada',
    'Odia',
    'Malayalam',
    'Punjabi',
    'Assamese',
  ];

  return (
    <ImageBackground
      source={require('../../assets/bg-placeholdr.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Language preferences</Text>
        <Text style={styles.subtitle}>
          This helps us tailor captions and reading clarity.
        </Text>
      </View>

      {/* FORM + WATERMARK */}
      <View style={styles.formWrapper}>
        {/* WATERMARK IMAGE */}
        <View style={styles.languageImageWrapper}>
          <Image
            source={require('../../assets/languages.png')}
            style={styles.languageImage}
            resizeMode="contain"
            accessible={false}
          />
        </View>

        {/* PRIMARY LANGUAGE */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Primary language</Text>
          <TextInput
            value={primary}
            onChangeText={setPrimary}
            placeholder="e.g. English"
            placeholderTextColor={COLORS.mutedText}
            style={styles.input}
          />
        </View>

        {/* SECONDARY LANGUAGE */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>
            Secondary language <Text style={styles.optional}>(optional)</Text>
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={secondary}
              onValueChange={(itemValue: string) => setSecondary(itemValue)}
              style={styles.picker}
              dropdownIconColor={COLORS.softWhite}
            >
              <Picker.Item label="Select a language" value="" color={COLORS.mutedText} />
              {indianLanguages.map(lang => (
                <Picker.Item key={lang} label={lang} value={lang} color={COLORS.neonPurple} />
              ))}
            </Picker>
          </View>
        </View>

        {/* HELPER */}
        <Text style={styles.helper}>
          You can change languages anytime later in settings.
        </Text>
      </View>

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.nextButton,
          pressed && { opacity: 0.88 },
        ]}
        onPress={() => {
          setPrimaryLanguage(primary.trim());
          setSecondaryLanguage(
            secondary.trim() ? secondary.trim() : undefined
          );
          console.log('Navigating to Questionnaire'); // Updated log
          navigation.navigate('Questionnaire'); // Updated screen name
        }}
        accessibilityRole="button"
        accessibilityLabel="Continue"
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
    color: COLORS.softWhite,
    marginBottom: 6,
  },

  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.mutedText,
  },

  /* 🔑 WATERMARK CONTAINER */
  formWrapper: {
    position: 'relative',
  },

  languageImageWrapper: {
  position: 'absolute',
  top: -165,          // 🔑 image visible, not decapitated
  left: -24,
  right: -24,
  alignItems: 'center',
  zIndex: 0,
  opacity: 0.6,
},


  languageImage: {
    width: '120%',     // ⬅️ zoom
    height: 190,
  },

  inputCard: {
  backgroundColor: COLORS.cardBg,
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: COLORS.cardBorder,
  marginBottom: 20,
  zIndex: 2, // 🔑 cards hide lower image naturally
},

  inputLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: COLORS.mutedText,
    marginBottom: 10,
  },

  optional: {
    fontFamily: 'Inter_400Regular',
    color: COLORS.mutedText,
  },

  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: COLORS.softWhite,
    paddingVertical: 6,
  },

  helper: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 2,
  },

  pickerWrapper: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.softWhite,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    height: 44,
    width: '100%',
  },

  /* CTA */
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
  form: {
    marginTop: 40,
  },
});
