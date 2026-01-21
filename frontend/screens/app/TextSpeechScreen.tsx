import React, { useState, useEffect } from 'react';
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
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { colors } from '../../theme/colors';

// Backend API URL - Update this to your Django server URL
const STT_API_URL = 'http://172.18.234.33:8000/api/speech-to-text/';

const COLORS = {
    bg: '#05070a',
    cardBg: 'rgba(30,30,40,0.4)',
    cardBorder: 'rgba(255,255,255,0.1)',
    neonPurple: '#d946ef',
    neonBlue: '#38bdf8',
    softWhite: '#f8fafc',
    mutedText: '#94a3b8',
    success: '#10b981',
    error: '#ef4444',
    highlight: '#22d3ee',
};

interface TextSpeechScreenProps {
    navigation?: any;
}

export default function TextSpeechScreen({ navigation }: TextSpeechScreenProps) {
    const [textToSpeak, setTextToSpeak] = useState('');
    const [transcribedText, setTranscribedText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, [recording]);

    const handleTextToSpeech = async () => {
        if (!textToSpeak.trim()) return;

        try {
            setIsSpeaking(true);
            await Speech.speak(textToSpeak, {
                language: 'en-US',
                pitch: 1.0,
                rate: 0.9,
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false),
            });
        } catch (error) {
            console.error('Text-to-Speech Error:', error);
            setIsSpeaking(false);
        }
    };

    const stopSpeaking = () => {
        Speech.stop();
        setIsSpeaking(false);
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
            setTranscribedText('Transcribing audio...');

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
                        // Not JSON, stick with text
                        if (errorText) errorMessage = errorText;
                    }
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                console.log('STT Response:', data);

                if (data.status === 'success' && data.text) {
                    setTranscribedText(data.text);
                } else {
                    setTranscribedText('Could not transcribe audio.');
                    if (data.error) Alert.alert('Transcription Failed', data.error);
                }

            } catch (apiError) {
                console.error('STT API Error:', apiError);
                setTranscribedText('Error connecting to transcription service.');
                Alert.alert('Connection Error', 'Ensure Django server is running at ' + STT_API_URL);
            } finally {
                setIsTranscribing(false);
            }

        } catch (error) {
            console.error('Error stopping recording:', error);
            setIsTranscribing(false);
        }
    };

    const clearText = () => {
        setTextToSpeak('');
        setTranscribedText('');
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
                    <Text style={styles.title}>Text & Speech</Text>
                    <Text style={styles.subtitle}>
                        Seamlessly convert between text and speech with AI-powered accuracy.
                    </Text>
                </View>

                {/* Text to Speech Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Text to Speech</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>TTS</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type something to hear it spoken..."
                            placeholderTextColor={COLORS.mutedText}
                            value={textToSpeak}
                            onChangeText={setTextToSpeak}
                            multiline
                            numberOfLines={4}
                        />

                        <View style={styles.buttonRow}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.actionButton,
                                    styles.primaryButton,
                                    pressed && { opacity: 0.8 },
                                    isSpeaking && styles.speakingButton,
                                ]}
                                onPress={isSpeaking ? stopSpeaking : handleTextToSpeech}
                                disabled={!textToSpeak.trim()}
                            >
                                {isSpeaking ? (
                                    <ActivityIndicator color={COLORS.bg} size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        {isSpeaking ? 'Stop' : '🔊 Speak'}
                                    </Text>
                                )}
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.actionButton,
                                    styles.secondaryButton,
                                    pressed && { opacity: 0.8 },
                                ]}
                                onPress={clearText}
                            >
                                <Text style={styles.secondaryButtonText}>Clear</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Speech to Text Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Speech to Text</Text>
                    </View>

                    <View style={styles.glassCard}>
                        <View style={styles.recordingContainer}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.recordButton,
                                    isRecording && styles.recordingActive,
                                    pressed && { transform: [{ scale: 0.95 }] },
                                ]}
                                onPress={isRecording ? stopRecording : startRecording}
                            >
                                <View style={[styles.recordIconWrapper, isRecording && styles.recordIconWrapperActive]}>
                                    <Text style={{ fontSize: 24 }}>{isRecording ? '⏹' : '🎙'}</Text>
                                </View>
                                <Text style={styles.recordButtonText}>
                                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                                </Text>
                            </Pressable>

                            {isTranscribing ? (
                                <View style={styles.recordingIndicator}>
                                    <ActivityIndicator size="small" color={COLORS.neonBlue} />
                                    <Text style={[styles.recordingText, { color: COLORS.neonBlue }]}>Transcribing audio...</Text>
                                </View>
                            ) : isRecording && (
                                <View style={styles.recordingIndicator}>
                                    <View style={styles.pulseCircle} />
                                    <Text style={styles.recordingText}>Listening...</Text>
                                </View>
                            )}
                        </View>

                        {transcribedText ? (
                            <View style={styles.transcriptionBox}>
                                <Text style={styles.transcriptionLabel}>TRANSCRIPTION</Text>
                                <Text style={styles.transcriptionText}>{transcribedText}</Text>
                            </View>
                        ) : (
                            <View style={styles.placeholderBox}>
                                <Text style={styles.placeholderText}>
                                    Tap the microphone to start speaking
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>💡 Quick Tips</Text>
                    <Text style={styles.infoText}>
                        • Speak clearly and at a moderate pace for best results{'\n'}
                        • Ensure you're in a quiet environment{'\n'}
                        • Grant microphone permissions when prompted
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
        alignItems: 'center',
    },
    title: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 32,
        color: COLORS.softWhite,
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: COLORS.neonPurple,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: COLORS.mutedText,
        textAlign: 'center',
        maxWidth: '85%',
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
    glassCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 24,
        padding: 24,
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
    // Keep legacy card for compatibility if missed
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    textInput: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: COLORS.softWhite,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        padding: 18,
        minHeight: 140,
        textAlignVertical: 'top',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.neonBlue,
        shadowColor: COLORS.neonBlue,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    speakingButton: {
        backgroundColor: COLORS.error,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    buttonText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
        color: '#fff', // White text
        fontWeight: '600',
    },
    secondaryButtonText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 15,
        color: COLORS.mutedText,
    },

    // STT Specifics
    recordingContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.neonPurple,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 100,
        gap: 12,
        shadowColor: COLORS.neonPurple,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    recordingActive: {
        backgroundColor: COLORS.error,
        shadowColor: COLORS.error,
    },
    recordIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordIconWrapperActive: {
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    recordButtonText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: '#fff',
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pulseCircle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error,
    },
    recordingText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 13,
        color: COLORS.mutedText,
    },
    transcriptionBox: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    transcriptionLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 11,
        color: COLORS.neonBlue,
        marginBottom: 12,
        letterSpacing: 1,
        opacity: 0.8,
    },
    transcriptionText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 18,
        color: COLORS.softWhite,
        lineHeight: 28,
    },
    placeholderBox: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        borderStyle: 'dashed',
    },
    placeholderText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.mutedText,
        textAlign: 'center',
        maxWidth: 200,
    },
    infoCard: {
        backgroundColor: 'rgba(217, 70, 239, 0.08)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.neonPurple,
    },
    infoTitle: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 16,
        color: COLORS.neonPurple,
        marginBottom: 8,
    },
    infoText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.mutedText,
        lineHeight: 22,
    },
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

    // Legacy support
    badge: { display: 'none' },
    badgeAlt: { display: 'none' },
    badgeText: { display: 'none' },
    recordDot: { display: 'none' },
    recordDotActive: { display: 'none' },
});
