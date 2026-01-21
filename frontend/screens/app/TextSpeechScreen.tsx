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
    bg: '#0A0F2C',
    cardBg: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(255,255,255,0.08)',
    neonPurple: '#C77DFF',
    neonBlue: '#5AD7FF',
    softWhite: '#F1F6FF',
    mutedText: '#A9B7D0',
    success: '#4ECDC4',
    error: '#FF6B6B',
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
                        Convert text to speech or speech to text seamlessly.
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
                        <View style={[styles.badge, styles.badgeAlt]}>
                            <Text style={styles.badgeText}>STT</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.recordingContainer}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.recordButton,
                                    isRecording && styles.recordingActive,
                                    pressed && { opacity: 0.8 },
                                ]}
                                onPress={isRecording ? stopRecording : startRecording}
                            >
                                <View style={[styles.recordDot, isRecording && styles.recordDotActive]} />
                                <Text style={styles.recordButtonText}>
                                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                                </Text>
                            </Pressable>

                            {isTranscribing ? (
                                <View style={styles.recordingIndicator}>
                                    <ActivityIndicator size="small" color={COLORS.neonBlue} />
                                    <Text style={[styles.recordingText, { color: COLORS.neonBlue }]}>Transcribing...</Text>
                                </View>
                            ) : isRecording && (
                                <View style={styles.recordingIndicator}>
                                    <View style={styles.pulseCircle} />
                                    <Text style={styles.recordingText}>Recording...</Text>
                                </View>
                            )}
                        </View>

                        {transcribedText ? (
                            <View style={styles.transcriptionBox}>
                                <Text style={styles.transcriptionLabel}>Transcription:</Text>
                                <Text style={styles.transcriptionText}>{transcribedText}</Text>
                            </View>
                        ) : (
                            <View style={styles.placeholderBox}>
                                <Text style={styles.placeholderText}>
                                    🎤 Tap the button above to start recording
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
    },
    title: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 32,
        color: COLORS.softWhite,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: COLORS.mutedText,
        lineHeight: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 20,
        color: COLORS.softWhite,
        marginRight: 12,
    },
    badge: {
        backgroundColor: COLORS.neonBlue,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeAlt: {
        backgroundColor: COLORS.neonPurple,
    },
    badgeText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: COLORS.bg,
        fontWeight: '600',
    },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    textInput: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: COLORS.softWhite,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: 16,
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
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.neonBlue,
    },
    speakingButton: {
        backgroundColor: COLORS.error,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.neonBlue,
    },
    buttonText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: COLORS.bg,
        fontWeight: '600',
    },
    secondaryButtonText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: COLORS.neonBlue,
        fontWeight: '600',
    },
    recordingContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.neonPurple,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        gap: 12,
    },
    recordingActive: {
        backgroundColor: COLORS.error,
    },
    recordDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.bg,
    },
    recordDotActive: {
        backgroundColor: COLORS.softWhite,
    },
    recordButtonText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: COLORS.bg,
        fontWeight: '600',
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 8,
    },
    pulseCircle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error,
    },
    recordingText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.error,
    },
    transcriptionBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.success,
    },
    transcriptionLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        color: COLORS.success,
        marginBottom: 8,
    },
    transcriptionText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: COLORS.softWhite,
        lineHeight: 24,
    },
    placeholderBox: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 24,
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
    },
    infoCard: {
        backgroundColor: 'rgba(93, 215, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(93, 215, 255, 0.2)',
    },
    infoTitle: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 16,
        color: COLORS.neonBlue,
        marginBottom: 12,
    },
    infoText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.mutedText,
        lineHeight: 22,
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
