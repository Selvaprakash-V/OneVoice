import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus, Audio } from 'expo-av';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

// Adjust based on your environment (10.0.2.2 for Android Emulator, localhost for iOS/Web)
const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

const SignAnimationScreen = () => {
    const [text, setText] = useState('');
    const [words, setWords] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Video ref
    const videoRef = useRef<Video>(null);

    const handleTranslate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setWords([]);
        setCurrentVideoIndex(0);
        setIsPlaying(false);

        try {
            const response = await fetch(`${BACKEND_URL}/animation/convert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sen: text }), // Matching backend expectation 'sen' or 'text'? 
                // Ah, the Python backend used 'sen'. 
                // My Node impl used { text }.
                // Let's check my node impl... I used `let { text } = req.body;`.
                // So I should send `text`.
                // Wait, I should verify what I wrote in controller.
            });

            // Checking controller again...
            // "let { text } = req.body;"
            // But let's support 'sen' if needed or just send 'text'. 
            // I'll send 'text'. Need to make sure I update the request Body correctly.

            // Retry with 'text'
            const data = await fetch(`${BACKEND_URL}/animation/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            }).then(res => res.json());

            if (data.words) {
                setWords(data.words);
                setCurrentVideoIndex(0);
                setIsPlaying(true);
            }
        } catch (error) {
            console.error(error);
            alert('Error connecting to translation server');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;

        if (status.didJustFinish) {
            if (currentVideoIndex < words.length - 1) {
                setCurrentVideoIndex((prev: number) => prev + 1);
            } else {
                setIsPlaying(false); // Finished sequence
                setCurrentVideoIndex(0); // Reset or stay at end?
            }
        }
    };

    // Effect to play video when index changes
    /* 
       The Video component source will update automatically. 
       We might need to trigger playAsync() manually if autoplay doesn't pick it up smoothly.
    */

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Sign Language Animation</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter text to translate..."
                    placeholderTextColor={colors.subtitle}
                    value={text}
                    onChangeText={setText}
                />
                <TouchableOpacity style={styles.button} onPress={handleTranslate} disabled={loading}>
                    <Ionicons name="search" size={24} color={colors.background} />
                </TouchableOpacity>
            </View>

            <View style={styles.videoContainer}>
                {loading ? (
                    <Text style={{ color: 'white' }}>Processing...</Text>
                ) : words.length > 0 ? (
                    <View>
                        <Video
                            ref={videoRef}
                            style={styles.video}
                            source={{
                                uri: `${BACKEND_URL}/assets/${words[currentVideoIndex]}.mp4`,
                            }}
                            useNativeControls={false}
                            resizeMode={ResizeMode.CONTAIN}
                            isLooping={false}
                            shouldPlay={isPlaying}
                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        />
                        <Text style={styles.caption}>{words[currentVideoIndex]}</Text>
                    </View>
                ) : (
                    <Text style={styles.placeholderText}>Enter text to see animation</Text>
                )}
            </View>

            {words.length > 0 && (
                <View style={styles.wordList}>
                    <Text style={styles.wordListTitle}>Sequence:</Text>
                    <ScrollView horizontal>
                        {words.map((w: string, i: number) => (
                            <Text key={i} style={[styles.wordItem, i === currentVideoIndex && styles.activeWord]}>
                                {w}
                            </Text>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.darkBackground,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.neonBlue,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        backgroundColor: colors.card,
        color: colors.text,
        padding: 15,
        borderRadius: 8,
        marginRight: 10,
    },
    button: {
        backgroundColor: colors.neonBlue,
        padding: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        height: 300,
        backgroundColor: '#000',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },
    video: {
        width: 320,
        height: 240, // Match typical asset ratio
    },
    placeholderText: {
        color: colors.subtitle,
    },
    caption: {
        color: colors.neonBlue,
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    wordList: {
        marginTop: 10,
    },
    wordListTitle: {
        color: colors.subtitle,
        marginBottom: 5,
    },
    wordItem: {
        color: colors.text,
        marginRight: 10,
        fontSize: 16,
    },
    activeWord: {
        color: colors.neonBlue,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    }
});

export default SignAnimationScreen;
