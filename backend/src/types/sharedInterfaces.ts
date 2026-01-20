// Shared TypeScript Interfaces for OneVoice

/**
 * Represents an input event from the user.
 */
export interface InputEvent {
  uid: string; // User ID
  mode: 'text' | 'sign' | 'both'; // Communication mode
  text?: string; // Text input (if any)
  signFrames?: string; // Reference to sign frames (if any)
  activeContext: string; // Current active context
  prefs: Record<string, any>; // User preferences
}

/**
 * Represents a normalized turn in the conversation.
 */
export interface NormalizedTurn {
  uid: string; // User ID
  mode: 'text' | 'sign' | 'both'; // Communication mode
  userText: string; // Normalized user input as text
  context: {
    activeContext: string; // Current active context
    prefs: Record<string, any>; // User preferences
  };
}

/**
 * Represents the AI's response.
 */
export interface AIResponse {
  text: string; // AI-generated text response
}

/**
 * Represents the output plan for rendering the response.
 */
export interface OutputPlan {
  text?: string; // Text output (if any)
  avatarInstructions?: SignInstruction[]; // Instructions for sign avatar animation
  subtitles?: string; // Subtitles for the output
  tts?: string; // Reference to TTS audio (if any)
  mode: 'text' | 'sign' | 'both'; // Communication mode
}

/**
 * Represents instructions for sign avatar animation.
 */
export interface SignInstruction {
  type: string; // Type of instruction (e.g., gesture, facial expression)
  data: any; // Instruction data
}