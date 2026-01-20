import { AIResponse, OutputPlan } from '../types/sharedInterfaces';

/**
 * Orchestrates the output rendering logic based on the communication mode.
 */
export class OutputOrchestrator {
  /**
   * Generates an output plan based on the AI response and communication mode.
   * @param response The AI's text response.
   * @param mode The active communication mode ('text', 'sign', or 'both').
   * @returns The output plan for rendering.
   */
  static generateOutputPlan(response: AIResponse, mode: 'text' | 'sign' | 'both'): OutputPlan {
    const outputPlan: OutputPlan = {
      mode,
      subtitles: response.text, // Subtitles are mandatory for sign outputs
    };

    if (mode === 'text' || mode === 'both') {
      outputPlan.text = response.text;
    }

    if (mode === 'sign' || mode === 'both') {
      outputPlan.avatarInstructions = this.generateAvatarInstructions(response.text);
    }

    return outputPlan;
  }

  /**
   * Generates avatar animation instructions from the AI text response.
   * @param text The AI's text response.
   * @returns Instructions for the sign avatar.
   */
  private static generateAvatarInstructions(text: string): OutputPlan['avatarInstructions'] {
    // Placeholder logic for generating avatar instructions
    return [
      {
        type: 'gesture',
        data: { text },
      },
    ];
  }
}