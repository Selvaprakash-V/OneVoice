import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../../navigation/AppNavigator';

type WelcomeGestureNavProp = StackNavigationProp<
  RootParamList,
  'WelcomeGesture'
>;

const { width } = Dimensions.get('window');
const AVATAR_SIZE = width * 0.42;

export default function WelcomeGestureScreen() {
  const navigation = useNavigation<WelcomeGestureNavProp>();

  const videoScale = useRef(new Animated.Value(0.6)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Video pop-in animation
    Animated.spring(videoScale, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // Text fade + slide animation
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navigate after 4 seconds (video duration)
    const timer = setTimeout(() => {
      navigation.replace('MainApp');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation, videoScale, textOpacity, textTranslate]);

  return (
    <View style={styles.container}>
      {/* Video Avatar */}
      <Animated.View
        style={[
          styles.videoWrapper,
          { transform: [{ scale: videoScale }] },
        ]}
      >
        <Video
          source={require('../../assets/welcomegesture.mp4')}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false}
        />
      </Animated.View>

      {/* Text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslate }],
          },
        ]}
      >
        <Text style={styles.title}>OneVoice</Text>
        <Text style={styles.subtitle}>
          Every conversation matters
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F2C',
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#5AD7FF',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },

  video: {
    width: '100%',
    height: '100%',
  },

  textContainer: {
    marginTop: 18,
    alignItems: 'center',
  },

  title: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 30,
    color: '#F1F6FF',
    letterSpacing: 0.6,
  },

  subtitle: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#A9B7D0',
    letterSpacing: 0.3,
  },
});
