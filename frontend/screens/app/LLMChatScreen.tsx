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
    KeyboardAvoidingView,
    Platform,
    FlatList
} from 'react-native';
import { Audio } from 'expo-av';
import { colors } from '../../theme/colors';

const API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Using the verified local IP
const STT_API_URL = 'http://10.38.112.241:8000/api/speech-to-text/';

const COLORS = {
    bg: '#05070a',
    cardBg: 'rgba(30,30,40,0.6)',
    cardBorder: 'rgba(255,255,255,0.1)',
    neonPurple: '#d946ef',
    neonBlue: '#38bdf8',
    softWhite: '#f8fafc',
    mutedText: '#94a3b8',
    success: '#10b981',
    error: '#ef4444',
    userBubble: 'rgba(56, 189, 248, 0.2)',
    aiBubble: 'rgba(217, 70, 239, 0.1)',
};

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function LLMChatScreen({ navigation }: any) {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm here to listen and help. How can I support you today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, [recording]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192', // Using a fast, reliable model on Groq
                    messages: [
                        {
                            role: 'system',
                            content: "You are a helpful, empathetic, and patient assistant communicating with a deaf or hard-of-hearing person. Your responses should be clear, supportive, and concise. Prioritize understanding their needs and showing empathy."
                        },
                        ...messages.map(m => ({
                            role: m.sender === 'user' ? 'user' : 'assistant',
                            content: m.text
                        })),
                        { role: 'user', content: userMsg.text }
                    ]
                })
            });

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                const aiResponse = data.choices[0].message.content;
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: aiResponse,
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                throw new Error('No response from AI');
            }

        } catch (error) {
            console.error('Groq API Error:', error);
            Alert.alert('Error', 'Failed to get response from AI assistant.');
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            if (permissionResponse?.status !== 'granted') {
                await requestPermission();
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
        } catch (err) {
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        if (!recording) return;

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            if (!uri) return;

            setIsTranscribing(true);

            const formData = new FormData();
            formData.append('audio', {
                uri: uri,
                type: 'audio/m4a',
                name: 'recording.m4a',
            } as any);

            const response = await fetch(STT_API_URL, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) throw new Error('STT Failed');

            const data = await response.json();
            if (data.status === 'success' && data.text) {
                setInputText(prev => prev + (prev ? ' ' : '') + data.text);
            } else {
                Alert.alert('Transcription Failed', 'Could not understand audio.');
            }

        } catch (error) {
            console.error('STT Error:', error);
            Alert.alert('Error', 'Failed to transcribe speech. Check server connection.');
        } finally {
            setIsTranscribing(false);
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/bg-placeholdr.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>AI Companion</Text>
                </View>

                {/* Chat Area */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.messageBubble,
                            item.sender === 'user' ? styles.userBubble : styles.aiBubble
                        ]}>
                            <Text style={styles.senderLabel}>
                                {item.sender === 'user' ? 'You' : 'Assistant'}
                            </Text>
                            <Text style={styles.messageText}>{item.text}</Text>
                        </View>
                    )}
                />

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type a message..."
                            placeholderTextColor={COLORS.mutedText}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />

                        <Pressable
                            style={({ pressed }) => [
                                styles.micButton,
                                isRecording && styles.micButtonActive,
                                pressed && { opacity: 0.8 }
                            ]}
                            onPress={isTranscribing ? undefined : (isRecording ? stopRecording : startRecording)}
                            disabled={isTranscribing}
                        >
                            {isTranscribing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.iconText}>{isRecording ? '⏹' : '🎙'}</Text>
                            )}
                        </Pressable>
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.sendButton,
                            pressed && { opacity: 0.8 },
                            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.iconText}>➤</Text>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(5, 7, 10, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.cardBorder,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    backButtonText: {
        color: COLORS.neonBlue,
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
    },
    headerTitle: {
        color: COLORS.softWhite,
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 20,
    },
    chatContent: {
        padding: 20,
        paddingBottom: 40,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.userBubble,
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.aiBubble,
        borderBottomLeftRadius: 4,
    },
    senderLabel: {
        fontSize: 12,
        color: COLORS.neonBlue,
        marginBottom: 4,
        fontFamily: 'SpaceGrotesk_600SemiBold',
        opacity: 0.8,
    },
    messageText: {
        color: COLORS.softWhite,
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        lineHeight: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'rgba(30, 30, 40, 0.9)',
        borderTopWidth: 1,
        borderTopColor: COLORS.cardBorder,
        gap: 12,
        alignItems: 'flex-end',
    },
    inputWrapper: {
        flex: 1,
        position: 'relative',
    },
    textInput: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 24,
        padding: 12,
        paddingRight: 48,
        color: COLORS.softWhite,
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    micButton: {
        position: 'absolute',
        right: 8,
        bottom: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.neonPurple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    micButtonActive: {
        backgroundColor: COLORS.error,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.neonBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2, // Align with input
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.mutedText,
        opacity: 0.5,
    },
    iconText: {
        fontSize: 18,
        color: '#fff',
    }
});
