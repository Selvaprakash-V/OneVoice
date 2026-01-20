import React, { useEffect, useState } from 'react';

import EmailAuthScreen from '../screens/auth/EmailAuthScreen';
import MainAppScreen from '../screens/app/MainAppScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import VisualPreferenceScreen from '../screens/onboarding/VisualPreferenceScreen';
import CommunicationPreferenceScreen from '../screens/onboarding/CommunicationPreferenceScreen';
import UsageContextScreen from '../screens/onboarding/UsageContextScreen';
import LanguagePreferenceScreen from '../screens/onboarding/LanguagePreferenceScreen';
import PermissionExplanationScreen from '../screens/onboarding/PermissionExplanationScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import { OnboardingProvider } from '../context/OnboardingContext';
import { auth } from '../services/firebase';
import WelcomeGestureScreen from '../screens/app/WelcomeGestureScreen';

const Stack = createNativeStackNavigator();

export type RootParamList = {
  Welcome: undefined;
  Login: undefined;
  EmailAuth: undefined;
  VisualPreferenceScreen: undefined; // Correct screen name
  CommunicationPreference: undefined;
  UsageContext: undefined;
  LanguagePreference: undefined;
  PermissionExplanation: undefined;
  WelcomeGesture: undefined;
  MainApp: undefined;
};

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth?.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged
      ? auth.onAuthStateChanged((user: any) => setIsLoggedIn(!!user))
      : () => {};
    return unsubscribe;
  }, []);

  return (
    <OnboardingProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
              <>
                {console.log('Navigating to VisualPreferenceScreen')}
                <Stack.Screen name="VisualPreferenceScreen" component={VisualPreferenceScreen} />
                <Stack.Screen name="CommunicationPreference" component={CommunicationPreferenceScreen} />
                <Stack.Screen name="UsageContext" component={UsageContextScreen} />
                <Stack.Screen name="LanguagePreference" component={LanguagePreferenceScreen} />
                <Stack.Screen name="PermissionExplanation" component={PermissionExplanationScreen} />
                <Stack.Screen name="WelcomeGesture" component={WelcomeGestureScreen} />
                <Stack.Screen name="MainApp" component={MainAppScreen} />
              </>
          ) : (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </OnboardingProvider>
  );
}
