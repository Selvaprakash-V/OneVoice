// text.types.ts
// Centralized types for text-based ML logic

export type ContextType =
  | 'daily'
  | 'classroom'
  | 'workplace'
  | 'public';

export interface TextLLMRequest {
  uid: string;
  context: ContextType;
  userMessage: string;
}