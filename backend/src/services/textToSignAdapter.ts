/**
 * Adapter for converting AI text responses to sign avatar instructions.
 */
import { SignInstruction } from '../types/sharedInterfaces';

export class TextToSignAdapter {
  /**
   * Converts text to sign avatar instructions.
   * @param text The AI's text response.
   * @returns Instructions for the sign avatar and subtitles.
   */
  static convertTextToSign(text: string): {
    avatarInstructions: SignInstruction[];
    subtitles: string;
  } {
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