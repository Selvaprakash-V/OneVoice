import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { saveContextPersonalization } from '../../services/onboardingApi';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

const ContextSetupScreen = ({ route }: any) => {
  const { selectedContexts } = route.params; // Array of selected contexts
  const navigation = useNavigation<NavigationProp<any>>();

  const [answers, setAnswers] = useState(
    selectedContexts.reduce((acc: any, context: string) => {
      acc[context] = {
        struggles: '',
        preference: '',
        tone: '',
        goals: '',
        assistanceStyle: '',
      };
      return acc;
    }, {})
  );

  const handleInputChange = (context: string, field: string, value: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [context]: {
        ...prev[context],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      for (const context of selectedContexts) {
        await saveContextPersonalization(context, answers[context]);
      }
      navigation.navigate('MainAppScreen');
    } catch (error) {
      console.error('Error saving context personalization:', error);
    }
  };

  return (
    <View style={styles.container}>
      {selectedContexts.map((context: string) => (
        <View key={context} style={styles.contextSection}>
          <Text style={styles.contextTitle}>{context}</Text>

          <Text>What’s hardest for you here?</Text>
          <TextInput
            style={styles.input}
            value={answers[context].struggles}
            onChangeText={(text) => handleInputChange(context, 'struggles', text)}
          />

          <Text>How should responses be explained?</Text>
          <TextInput
            style={styles.input}
            value={answers[context].preference}
            onChangeText={(text) => handleInputChange(context, 'preference', text)}
          />

          <Text>Preferred tone?</Text>
          <TextInput
            style={styles.input}
            value={answers[context].tone}
            onChangeText={(text) => handleInputChange(context, 'tone', text)}
          />

          <Text>Your main goal in this context?</Text>
          <TextInput
            style={styles.input}
            value={answers[context].goals}
            onChangeText={(text) => handleInputChange(context, 'goals', text)}
          />

          <Text>Anything the assistant must always do or avoid?</Text>
          <TextInput
            style={styles.input}
            value={answers[context].assistanceStyle}
            onChangeText={(text) => handleInputChange(context, 'assistanceStyle', text)}
          />
        </View>
      ))}

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  contextSection: {
    marginBottom: 24,
  },
  contextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
});

export default ContextSetupScreen;