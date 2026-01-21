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
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { colors } from '../../theme/colors';

const COLORS = {
    bg: '#05070a', // Darker cleaner background
    cardBg: 'rgba(30,30,40,0.4)', // More visible glassmorphism
    cardBorder: 'rgba(255,255,255,0.1)',
    neonPurple: '#d946ef', // Slightly more vibrant
    neonBlue: '#38bdf8', // Sky blue
    softWhite: '#f8fafc',
    mutedText: '#94a3b8',
    success: '#10b981',
    error: '#ef4444',
    highlight: '#22d3ee',
    gold: '#fbbf24',
};

// Backend API URL - Update this to your Django server URL
// For web: use localhost, for mobile: use your computer's IP address
const API_URL = 'http://172.18.234.33:8000/api/animation/';
const STT_API_URL = 'http://172.18.234.33:8000/api/speech-to-text/';
const PREDICT_API_URL = 'http://172.18.234.33:8000/api/predict-sign/';
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

    const [mode, setMode] = useState<'text-to-sign' | 'sign-to-text'>('text-to-sign');
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
    const [predictedLetter, setPredictedLetter] = useState('');
    const [isPredicting, setIsPredicting] = useState(false);

    // Prediction Loop Ref to stop it
    const predictionInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
            if (predictionInterval.current) {
                clearInterval(predictionInterval.current);
            }
        };
    }, [recording]);

    const toggleMode = async () => {
        if (mode === 'text-to-sign') {
            if (!cameraPermission?.granted) {
                const permission = await requestCameraPermission();
                if (!permission.granted) {
                    Alert.alert('Permission Required', 'Camera access is needed for real-time translation.');
                    return;
                }
            }
            setMode('sign-to-text');
            startPredictionLoop();
        } else {
            setMode('text-to-sign');
            stopPredictionLoop();
        }
    };

    const startPredictionLoop = () => {
        setIsPredicting(true);
        predictionInterval.current = setInterval(async () => {
            if (cameraRef) {
                try {
                    const photo = await cameraRef.takePictureAsync({ base64: true, quality: 0.5 });
                    if (photo.base64) {
                        sendFrameToBackend(photo.base64);
                    }
                } catch (e) {
                    console.log("Camera capture error:", e);
                }
            }
        }, 800); // Every 800ms
    };

    const stopPredictionLoop = () => {
        setIsPredicting(false);
        setPredictedLetter('');
        if (predictionInterval.current) {
            clearInterval(predictionInterval.current);
            predictionInterval.current = null;
        }
    };

    const sendFrameToBackend = async (base64Image: string) => {
        try {
            const response = await fetch(PREDICT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                setPredictedLetter(data.prediction);
            }
        } catch (error) {
            console.log("Prediction API Error:", error);
        }
    };

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
                        Transform speech and text into expressive sign language animations instantly.
                    </Text>
                </View>

                {/* Toggle Mode Switch */}
                <View style={styles.toggleContainer}>
                    <Pressable
                        style={[styles.toggleButton, mode === 'text-to-sign' && styles.toggleActive]}
                        onPress={() => mode !== 'text-to-sign' && toggleMode()}
                    >
                        <Text style={[styles.toggleText, mode === 'text-to-sign' && styles.toggleTextActive]}>Sign Aid</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.toggleButton, mode === 'sign-to-text' && styles.toggleActive]}
                        onPress={() => mode !== 'sign-to-text' && toggleMode()}
                    >
                        <Text style={[styles.toggleText, mode === 'sign-to-text' && styles.toggleTextActive]}>Real-Time</Text>
                    </Pressable>
                </View>

                {mode === 'text-to-sign' ? (
                    <>
                        {/* Input Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Input Source</Text>
                            </View>

                            <View style={styles.glassCard}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Type your message here..."
                                        placeholderTextColor={COLORS.mutedText}
                                        value={inputText}
                                        onChangeText={setInputText}
                                        multiline
                                        numberOfLines={3}
                                    />

                                    {/* Floating Mic Button */}
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.micButton,
                                            isRecording && styles.micButtonActive,
                                            pressed && { transform: [{ scale: 0.95 }] },
                                        ]}
                                        onPress={isTranscribing ? undefined : (isRecording ? stopRecording : startRecording)}
                                        disabled={isTranscribing}
                                    >
                                        {isTranscribing ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.micIcon}>{isRecording ? '⏹' : '🎙'}</Text>
                                        )}
                                    </Pressable>
                                </View>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.processButton,
                                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                                        isProcessing && styles.processingButton,
                                    ]}
                                    onPress={() => processTextToSign(inputText)}
                                    disabled={isProcessing || !inputText.trim()}
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.buttonText}>Convert to Sign Language ✨</Text>
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
                    </>
                ) : (
                    /* Real-Time Camera Mode */
                    <View style={styles.cameraSection}>
                        <View style={styles.glassCard}>
                            <View style={styles.cameraWrapper}>
                                {cameraPermission?.granted ? (
                                    <CameraView
                                        style={styles.camera}
                                        facing='front'
                                        ref={(ref) => setCameraRef(ref)}
                                    >
                                        <View style={styles.overlay}>
                                            <View style={styles.predictionBox}>
                                                <Text style={styles.predictionLabel}>DETECTED SIGN</Text>
                                                <Text style={styles.predictionText}>
                                                    {predictedLetter || "..."}
                                                </Text>
                                            </View>
                                        </View>
                                    </CameraView>
                                ) : (
                                    <View style={styles.cameraPlaceholder}>
                                        <Text style={styles.placeholderText}>Camera Permission Needed</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.instructionText}>
                                Point the camera at your hand. Perform ISL gestures clearly.
                            </Text>
                        </View>
                    </View>
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
        alignItems: 'center',
    },
    title: {
        fontFamily: 'SpaceGrotesk_700Bold', // Make sure this font is loaded, otherwise fallback
        fontSize: 32,
        color: COLORS.softWhite,
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: COLORS.neonBlue,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: COLORS.mutedText,
        textAlign: 'center',
        maxWidth: '80%',
        lineHeight: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 20,
        color: COLORS.softWhite,
        letterSpacing: 0.5,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 4,
        borderRadius: 16,
        marginBottom: 24,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    toggleButton: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    toggleActive: {
        backgroundColor: COLORS.neonBlue,
    },
    toggleText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        color: COLORS.mutedText,
    },
    toggleTextActive: {
        color: '#000',
        fontWeight: '700',
    },
    cameraSection: {
        marginBottom: 30,
    },
    cameraWrapper: {
        width: '100%',
        height: 400,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    predictionBox: {
        backgroundColor: 'rgba(0,0,0,0.7)', // Dark semi-transparent
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.neonBlue,
    },
    predictionLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 12,
        color: COLORS.neonBlue,
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    predictionText: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 48,
        color: '#fff',
    },
    cameraPlaceholder: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructionText: {
        textAlign: 'center',
        color: COLORS.mutedText,
        fontSize: 14,
        fontStyle: 'italic',
    },
    glassCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    card: { // Kept for backward compat if needed, but updated
        backgroundColor: COLORS.cardBg,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    inputWrapper: {
        position: 'relative',
        marginBottom: 20,
    },
    textInput: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: COLORS.softWhite,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        padding: 16,
        paddingRight: 60, // Space for mic button
        minHeight: 120,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    micButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.neonBlue,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.neonBlue,
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 4,
    },
    micButtonActive: {
        backgroundColor: COLORS.error,
        shadowColor: COLORS.error,
    },
    micIcon: {
        fontSize: 20,
        color: '#fff',
    },
    processButton: {
        backgroundColor: COLORS.neonPurple, // Changed to purple for better contrast
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: COLORS.neonPurple,
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
    processingButton: {
        backgroundColor: COLORS.mutedText,
        shadowOpacity: 0,
    },
    buttonText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // Updated chip styles
    wordChip: {
        backgroundColor: 'rgba(56, 189, 248, 0.1)', // Subtle blue tint
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 100,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.2)',
    },
    wordChipActive: {
        backgroundColor: COLORS.neonBlue,
        borderColor: COLORS.neonBlue,
        transform: [{ scale: 1.05 }],
    },
    wordText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 15,
        color: COLORS.neonBlue, // Colored text by default
    },
    wordTextActive: {
        color: '#000', // Dark text on active
        fontWeight: 'bold',
    },

    // Video Area
    videoContainer: {
        width: '100%',
        height: 300, // Slightly taller
        backgroundColor: '#000',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        marginBottom: 20,
    },
    videoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    placeholderIcon: {
        fontSize: 50,
        marginBottom: 16,
        opacity: 0.8,
    },
    placeholderText: {
        fontFamily: 'Inter_500Medium',
        color: COLORS.mutedText,
    },

    // Info & Status
    infoCard: {
        backgroundColor: 'rgba(34, 211, 238, 0.08)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.highlight,
    },
    infoTitle: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 15,
        color: COLORS.neonBlue, // Use a bright color
        marginBottom: 10,
    },
    infoText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: COLORS.mutedText,
        lineHeight: 20,
    },
    statusCard: {
        padding: 10,
        alignItems: 'center',
    },
    statusText: {
        color: COLORS.mutedText,
        fontSize: 10,
    },
    statusSubtext: {
        display: 'none', // Hide detailed status for cleaner UI
    },

    // Continue Button
    continueButton: {
        alignSelf: 'center',
        backgroundColor: 'transparent',
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        marginBottom: 20,
    },
    continueText: {
        fontFamily: 'Inter_500Medium',
        color: COLORS.mutedText,
        fontSize: 14,
    },

    /* Legacy styles kept to prevent crashes if I missed replacements */
    inputContainer: { flexDirection: 'row', gap: 10 },
    wordsContainer: { flexDirection: 'row' },
    video: { width: '100%', height: '100%' },
    controlsContainer: { flexDirection: 'row', justifyContent: 'center' },
    controlButton: { paddingVertical: 12, paddingHorizontal: 32, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 100 },
    primaryButton: { backgroundColor: COLORS.neonBlue },
    badge: { display: 'none' }, // Hiding badges for cleaner look
    badgeAlt: { display: 'none' },
    badgeSuccess: { display: 'none' },
    badgeText: { display: 'none' },
});
