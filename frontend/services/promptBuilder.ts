// Centralized system prompt builder for OneVoice
// All prompt logic for AI interactions must go through this file

// --- Type Definitions ---

export interface OnboardingData {
  textSize: 'large' | 'extra-large';
  communicationPreference: 'text' | 'sign' | 'both';
  usageContexts: string[];
  primaryLanguage: string;
  secondaryLanguage?: string;
}

export interface PersonalizationContext {
  role: string;         // e.g. student, employee, citizen
  goals: string;        // what they want to achieve
  struggles: string;    // pain points
  environment: string;  // classroom / office / public place
  preferences: string;  // tone, speed, style
}

export type PersonalizationData = {
  [context: string]: PersonalizationContext;
};

// --- Main Prompt Builder ---

import { fetchContextPersonalization, saveGeneratedPrompt } from './onboardingApi';

/**
 * Builds the system prompt for the AI assistant.
 * @param uid - Firebase UID of the user
 * @param context - Active context (must be in onboarding.usageContexts)
 * @param onboarding - Onboarding data
 * @returns The final system prompt string
 */
export async function buildSystemPrompt(
  uid: string,
  context: string,
  onboarding: OnboardingData
): Promise<string> {
  let personalization: PersonalizationData | null = null;

  try {
    personalization = await fetchContextPersonalization(context);
  } catch (error) {
    console.warn(`Failed to fetch personalization for context ${context}:`, error);
  }

  // 1. Identity of the assistant
  let prompt = `You are a helpful digital assistant for a deaf or hard of hearing user.`;

  // 2. Accessibility rules (DEAF FIRST)
  prompt += `\n\nAccessibility rules:`;
  prompt += `\n- Always prioritize clear, concise, structured text.`;
  prompt += `\n- Avoid idioms, slang, and metaphors unless explicitly requested.`;
  prompt += `\n- Use short sentences.`;
  prompt += `\n- Use bullet points when helpful.`;
  prompt += `\n- Do not reference being an AI, policies, or training data.`;

  // 3. Language rules
  prompt += `\n\nLanguage rules:`;
  prompt += `\n- Primary language: ${onboarding.primaryLanguage}.`;
  if (onboarding.secondaryLanguage && onboarding.secondaryLanguage !== 'None') {
    prompt += `\n- Secondary language: ${onboarding.secondaryLanguage}.`;
  }
  prompt += `\n- Communication preference: ${onboarding.communicationPreference}.`;
  prompt += `\n- Text size: ${onboarding.textSize}.`;

  // 4. Context-specific behavior
  prompt += `\n\nContext: ${context}`;
  prompt += `\nContext-specific instructions:`;
  switch (context) {
    case 'daily':
      prompt += `\n- Use a casual, supportive tone.`;
      prompt += `\n- Help with everyday conversation.`;
      prompt += `\n- Ensure emotional clarity.`;
      break;
    case 'classroom':
      prompt += `\n- Act like a teaching assistant.`;
      prompt += `\n- Explain step-by-step.`;
      prompt += `\n- Use simple examples.`;
      prompt += `\n- Avoid verbal-only references.`;
      break;
    case 'workplace':
      prompt += `\n- Use a professional tone.`;
      prompt += `\n- Provide clear action steps.`;
      prompt += `\n- Avoid ambiguity.`;
      break;
    case 'public':
      prompt += `\n- Use short, direct responses.`;
      prompt += `\n- Focus on clarity and correctness.`;
      prompt += `\n- Prioritize safety-first explanations.`;
      break;
    default:
      prompt += `\n- Use a neutral, supportive tone.`;
      prompt += `\n- Focus on clarity and accessibility.`;
      break;
  }

  // 5. Personalization (if available)
  if (personalization && personalization[context]) {
    const p = personalization[context];
    prompt += `\n\nPersonalization:`;
    prompt += `\n- User role: ${p.role}.`;
    prompt += `\n- User goals: ${p.goals}.`;
    prompt += `\n- User struggles: ${p.struggles}.`;
    prompt += `\n- Environment: ${p.environment}.`;
    prompt += `\n- Preferences: ${p.preferences}.`;
  } else {
    prompt += `\n\nPersonalization:`;
    prompt += `\n- Use neutral defaults. Do not assume user details.`;
  }

  // 6. Output formatting constraints
  prompt += `\n\nOutput formatting:`;
  prompt += `\n- Use large, readable text.`;
  prompt += `\n- Ensure high contrast and accessibility.`;
  prompt += `\n- No tiny buttons or hard-to-read elements.`;

  // Save the generated prompt to MongoDB
  try {
    await saveGeneratedPrompt(uid, prompt);
  } catch (error) {
    console.error('Failed to save generated prompt:', error);
  }

  return prompt;
}

/*
Example output:

You are a helpful digital assistant for a deaf or hard of hearing user.

Accessibility rules:
- Always prioritize clear, concise, structured text.
- Avoid idioms, slang, and metaphors unless explicitly requested.
- Use short sentences.
- Use bullet points when helpful.
- Do not reference being an AI, policies, or training data.

Language rules:
- Primary language: English.
- Secondary language: Spanish.
- Communication preference: text.
- Text size: large.

Context: classroom
Context-specific instructions:
- Act like a teaching assistant.
- Explain step-by-step.
- Use simple examples.
- Avoid verbal-only references.

Personalization:
- User role: student.
- User goals: Understand math concepts.
- User struggles: Difficulty hearing teacher.
- Environment: classroom.
- Preferences: Slow, clear explanations.

Output formatting:
- Use large, readable text.
- Ensure high contrast and accessibility.
- No tiny buttons or hard-to-read elements.
*/
