// TextLLMRouter.ts
// Decides which LLM to use (Local or Groq)

import { runLocalLLM } from './LocalTextLLM';
import { runGroqLLM } from './GroqTextLLM';

export async function generateTextResponse(finalPrompt: string): Promise<string> {
  try {
    return await runLocalLLM(finalPrompt);
  } catch (err) {
    console.error('Local LLM failed, falling back to Groq:', err);
    return await runGroqLLM(finalPrompt);
  }
}