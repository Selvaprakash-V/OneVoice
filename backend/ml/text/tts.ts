// tts.ts
// Handles text-to-speech functionality

export function speakText(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}