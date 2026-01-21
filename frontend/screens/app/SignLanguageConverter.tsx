import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    ImageBackground,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Audio } from 'expo-av';
import { colors } from '../../theme/colors';

const COLORS = {
    bg: '#0A0F2C',
    cardBg: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(255,255,255,0.08)',
    neonPurple: '#C77DFF',
    neonBlue: '#5AD7FF',
    softWhite: '#F1F6FF',
    mutedText: '#A9B7D0',
    success: '#4ECDC4',
    error: '#FF6B6B',
    highlight: '#09edc7',
};

// Backend API URL - Update this to your Django server URL
// For web: use localhost, for mobile: use your computer's IP address
const API_URL = 'http://172.18.234.33:8000/api/animation/';
const STT_API_URL = 'http://172.18.234.33:8000/api/speech-to-text/';
const STATIC_URL = 'http://172.18.234.33:8000/static/';

interface SignLanguageConverterProps {
    navigation?: any;
}

export default function SignLanguageConverter({ navigation }: SignLanguageConverterProps) {
    const [inputText, setInputText] = useState('');
    const [processedWords, setProcessedWords] = useState<string[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const videoRef = useRef<Video>(null);

    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, [recording]);

    const processTextToSign = async (text: string) => {
        if (!text.trim()) {
            Alert.alert('Error', 'Please enter some text');
            return;
        }

        setIsProcessing(true);
        try {
            console.log('Sending request to:', API_URL);
            console.log('Request body:', { sen: text });

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sen: text }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (data.status === 'success' && data.words) {
                console.log('Processed words:', data.words);
                setProcessedWords(data.words);
                setCurrentWordIndex(-1);
                setIsPlaying(false);
                Alert.alert('Success', `Converted to ${data.words.length} sign language gestures!`);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            console.error('Error processing text:', error);
            console.error('Error details:', error.message);

            Alert.alert(
                'Processing Error',
                `Could not connect to Django server at ${API_URL}\n\nError: ${error.message}\n\nUsing fallback mode - videos may not be available.`
            );

            // Fallback: simulate processing for demo
            const words = text.toLowerCase().split(' ').filter(w => w.trim());
            setProcessedWords(words);
            console.log('Using fallback words:', words);
        } finally {
            setIsProcessing(false);
        }
    };

    const startRecording = async () => {
        try {
            if (permissionResponse?.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        console.log('Stopping recording..');
        setIsRecording(false);
        if (!recording) return;

        try {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });
            const uri = recording.getURI();
            console.log('Recording stopped and stored at', uri);
            setRecording(null);

            if (!uri) return;

            // Send to backend
            setIsTranscribing(true);

            try {
                const formData = new FormData();
                formData.append('audio', {
                    uri: uri,
                    type: 'audio/m4a', // Expo Audio default is m4a/caf
                    name: 'recording.m4a',
                } as any);

                console.log('Sending to STT API:', STT_API_URL);
                const response = await fetch(STT_API_URL, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = `Server returned ${response.status}`;
                    try {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.error) errorMessage = errorJson.error;
                    } catch (e) {
                        if (errorText) errorMessage = errorText;
                    }
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                console.log('STT Response:', data);

                if (data.status === 'success' && data.text) {
                    setInputText(data.text);
                    // Optional: Automatically convert after speaking?
                    // processTextToSign(data.text); 
                } else {
                    Alert.alert('Transcription Failed', data.error || 'Could not transcribe audio.');
                }

            } catch (apiError: any) {
                console.error('STT API Error:', apiError);
                Alert.alert('STT API Error', `Error: ${apiError.message}`);
            } finally {
                setIsTranscribing(false);
            }

        } catch (error) {
            console.error('Error stopping recording:', error);
            setIsTranscribing(false);
        }
    };

    const playSignLanguageAnimation = async () => {
        if (processedWords.length === 0) {
            Alert.alert('No Words', 'Please process some text first');
            return;
        }

        setIsPlaying(true);
        setCurrentWordIndex(0);
    };

    const pauseAnimation = () => {
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.pauseAsync();
        }
    };

    const onVideoPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
            // Move to next word
            const nextIndex = currentWordIndex + 1;
            if (nextIndex < processedWords.length) {
                setCurrentWordIndex(nextIndex);
            } else {
                // Animation complete
                setIsPlaying(false);
                setCurrentWordIndex(-1);
            }
        }
    };

    const getCurrentVideoSource = () => {
        if (currentWordIndex >= 0 && currentWordIndex < processedWords.length) {
            const word = processedWords[currentWordIndex];
            return { uri: `${STATIC_URL}${word}.mp4` };
        }
        return null;
    };

    return (
        <ImageBackground
            source={require('../../assets/bg-placeholdr.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Sign Language Converter</Text>
                    <Text style={styles.subtitle}>
                        Convert speech or text to Indian Sign Language animations
                    </Text>
                </View>

                {/* Input Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Input</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Speech/Text</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter text or use microphone..."
                                placeholderTextColor={COLORS.mutedText}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                numberOfLines={3}
                            />

                            <Pressable
                                style={({ pressed }) => [
                                    styles.micButton,
                                    isRecording && styles.micButtonActive,
                                    pressed && { opacity: 0.8 },
                                ]}
                                onPress={isTranscribing ? undefined : (isRecording ? stopRecording : startRecording)}
                                disabled={isTranscribing}
                            >
                                {isTranscribing ? (
                                    <ActivityIndicator size="small" color={COLORS.bg} />
                                ) : (
                                    <Text style={styles.micIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
                                )}
                            </Pressable>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.processButton,
                                pressed && { opacity: 0.8 },
                                isProcessing && styles.processingButton,
                            ]}
                            onPress={() => processTextToSign(inputText)}
                            disabled={isProcessing || !inputText.trim()}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color={COLORS.bg} size="small" />
                            ) : (
                                <Text style={styles.buttonText}>Convert to Sign Language</Text>
                            )}
                        </Pressable>
                    </View>
                </View>

                {/* Processed Words Section */}
                {processedWords.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Key Words</Text>
                            <View style={[styles.badge, styles.badgeAlt]}>
                                <Text style={styles.badgeText}>{processedWords.length}</Text>
                            </View>
                        </View>

                        <View style={styles.card}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.wordsContainer}
                            >
                                {processedWords.map((word, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.wordChip,
                                            currentWordIndex === index && styles.wordChipActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.wordText,
                                                currentWordIndex === index && styles.wordTextActive,
                                            ]}
                                        >
                                            {word}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}

                {/* Animation Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Sign Language Animation</Text>
                        <View style={[styles.badge, styles.badgeSuccess]}>
                            <Text style={styles.badgeText}>ISL</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.videoContainer}>
                            {getCurrentVideoSource() ? (
                                <Video
                                    ref={videoRef}
                                    source={getCurrentVideoSource()!}
                                    style={styles.video}
                                    useNativeControls={false}
                                    resizeMode={ResizeMode.CONTAIN}
                                    isLooping={false}
                                    shouldPlay={isPlaying}
                                    onPlaybackStatusUpdate={onVideoPlaybackStatusUpdate}
                                />
                            ) : (
                                <View style={styles.videoPlaceholder}>
                                    <Text style={styles.placeholderIcon}>🤟</Text>
                                    <Text style={styles.placeholderText}>
                                        Sign language animation will appear here
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.controlsContainer}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.controlButton,
                                    styles.primaryButton,
                                    pressed && { opacity: 0.8 },
                                ]}
                                onPress={isPlaying ? pauseAnimation : playSignLanguageAnimation}
                                disabled={processedWords.length === 0}
                            >
                                <Text style={styles.buttonText}>
                                    {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>ℹ️ How it works</Text>
                    <Text style={styles.infoText}>
                        1. Enter text or use the microphone to record speech{'\n'}
                        2. Click "Convert to Sign Language" to process{'\n'}
                        3. View the key words extracted from your input{'\n'}
                        4. Watch the sign language animation play automatically
                    </Text>
                </View>

                {/* Backend Status */}
                <View style={styles.statusCard}>
                    <Text style={styles.statusText}>
                        🔗 Backend: {API_URL}
                    </Text>
                    <Text style={styles.statusSubtext}>
                        Ensure Django server is running for full functionality
                    </Text>
                </View>

                {/* Navigation Button */}
                {navigation && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.continueButton,
                            pressed && { opacity: 0.88 },
                        ]}
                        onPress={() => navigation.navigate('WelcomeGesture')}
                    >
                        <Text style={styles.continueText}>Continue</Text>
                    </Pressable>
                )}
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
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
        color: COLORS.mutedText,
        lineHeight: 22,
    },
    section: {
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 18,
        color: COLORS.softWhite,
        marginRight: 12,
    },
    badge: {
        backgroundColor: COLORS.neonBlue,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    badgeAlt: {
        backgroundColor: COLORS.neonPurple,
    },
    badgeSuccess: {
        backgroundColor: COLORS.success,
    },
    badgeText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        color: COLORS.bg,
        fontWeight: '600',
    },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
    },
    textInput: {
        flex: 1,
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        color: COLORS.softWhite,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 14,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    micButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.neonPurple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    micButtonActive: {
        backgroundColor: COLORS.error,
    },
    micIcon: {
        fontSize: 24,
    },
    processButton: {
        backgroundColor: COLORS.neonBlue,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    processingButton: {
        backgroundColor: COLORS.mutedText,
    },
    buttonText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 15,
        color: COLORS.bg,
        fontWeight: '600',
    },
    wordsContainer: {
        flexDirection: 'row',
    },
    wordChip: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    wordChipActive: {
        backgroundColor: COLORS.highlight,
        borderColor: COLORS.highlight,
    },
    wordText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: COLORS.softWhite,
    },
    wordTextActive: {
        color: COLORS.bg,
        fontWeight: '700',
    },
    videoContainer: {
        width: '100%',
        height: 280,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    videoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    placeholderText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.mutedText,
        textAlign: 'center',
    },
    controlsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    controlButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.neonPurple,
    },
    infoCard: {
        backgroundColor: 'rgba(199, 125, 255, 0.1)',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(199, 125, 255, 0.2)',
    },
    infoTitle: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 15,
        color: COLORS.neonPurple,
        marginBottom: 10,
    },
    infoText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: COLORS.mutedText,
        lineHeight: 20,
    },
    statusCard: {
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(78, 205, 196, 0.2)',
    },
    statusText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: COLORS.success,
        marginBottom: 4,
    },
    statusSubtext: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: COLORS.mutedText,
    },
    continueButton: {
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
    continueText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 17,
        color: COLORS.bg,
        letterSpacing: 0.4,
    },
});
