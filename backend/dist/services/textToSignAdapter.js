"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextToSignAdapter = void 0;
class TextToSignAdapter {
    /**
     * Converts text to sign avatar instructions.
     * @param text The AI's text response.
     * @returns Instructions for the sign avatar and subtitles.
     */
    static convertTextToSign(text) {
        // Placeholder logic for converting text to sign instructions
        return {
            avatarInstructions: [
                {
                    type: 'gesture',
                    data: { text },
                },
            ],
            subtitles: text, // Subtitles are the same as the text
        };
    }
}
exports.TextToSignAdapter = TextToSignAdapter;
