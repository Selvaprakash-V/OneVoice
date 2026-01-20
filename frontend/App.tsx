import React from 'react';
import AppNavigator from './navigation/AppNavigator';

import { View } from 'react-native';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';

import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_500Medium,
} from '@expo-google-fonts/space-grotesk';


import {
  Inter_400Regular,
  Inter_500Medium,
} from '@expo-google-fonts/inter';

export default function App() {
  
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_500Medium,
    Inter_400Regular,
    Inter_500Medium,
  });
  return <AppNavigator />;
}
