// textLLM.ts
// Abstracts text generation logic

import { generateWithGroq } from './groqFallback';

export async function generateText(prompt: string): Promise<string> {
  try {
    // Placeholder for future local / HF / hosted model
    throw new Error('Primary model not implemented');
  } catch {
    return generateWithGroq(prompt);
  }
}