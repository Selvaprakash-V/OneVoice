import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Correct import for useNavigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParamList } from '../../navigation/AppNavigator';
import { submitQuestionnaire } from '../../services/onboardingApi'; // Fix import

const QuestionnaireScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>(); // Explicitly type navigation
  const [responses, setResponses] = useState({
    communicationChallenges: '',
    preferredStyle: '',
    contextNeeds: '',
    signNuances: '',
    techFeedback: '',
  });

  const handleInputChange = (key: string, value: string) => {
    setResponses({ ...responses, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      await submitQuestionnaire(responses); // Use named import
      navigation.navigate('WelcomeGesture'); // Fix navigation name
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>We'd like to know more about you!</Text>

      <Text style={styles.question}>1. What are the biggest challenges you face when communicating with others who don't know sign language?</Text>
      <TextInput
        style={styles.input}
        multiline
        value={responses.communicationChallenges}
        onChangeText={(text) => handleInputChange('communicationChallenges', text)}
      />

      <Text style={styles.question}>2. Do you prefer concise responses, detailed explanations, or something in between when interacting with technology?</Text>
      <TextInput
        style={styles.input}
        multiline
        value={responses.preferredStyle}
        onChangeText={(text) => handleInputChange('preferredStyle', text)}
      />

      <Text style={styles.question}>3. Are there specific situations (e.g., work, social, emergencies) where you struggle to communicate effectively?</Text>
      <TextInput
        style={styles.input}
        multiline
        value={responses.contextNeeds}
        onChangeText={(text) => handleInputChange('contextNeeds', text)}
      />

      <Text style={styles.question}>4. Are there any specific signs, phrases, or expressions that are important for your daily communication?</Text>
      <TextInput
        style={styles.input}
        multiline
        value={responses.signNuances}
        onChangeText={(text) => handleInputChange('signNuances', text)}
      />

      <Text style={styles.question}>5. What features or improvements would you like to see in technology to better support your communication needs?</Text>
      <TextInput
        style={styles.input}
        multiline
        value={responses.techFeedback}
        onChangeText={(text) => handleInputChange('techFeedback', text)}
      />

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
});

export default QuestionnaireScreen;