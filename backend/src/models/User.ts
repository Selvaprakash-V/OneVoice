import mongoose, { Schema, Document } from 'mongoose';

export interface Questionnaire {
  communicationChallenges: string;
  preferredStyle: string;
  contextNeeds: string;
  signNuances: string;
  techFeedback: string;
}

export interface QuestionnaireData {
  communicationChallenges: string;
  preferredStyle: string;
  contextNeeds: string;
  signNuances: string;
  techFeedback: string;
}

export interface Onboarding {
  textSize: string;
  communicationPreference: string;
  usageContexts: string[];
  primaryLanguage: string;
  secondaryLanguage: string;
  // questionnaire?: Questionnaire; // Removed questionnaire field from here
}

export interface IUser extends Document {
  uid: string;
  onboarding: Onboarding;
  createdAt: Date;
  updatedAt: Date;
  generatedPrompt?: string; // Added field for storing generated prompts
  // Future fields: preferences, personalization, aiEmbeddings, etc.
}

const OnboardingSchema: Schema = new Schema({
  textSize: { type: String, required: true },
  communicationPreference: { type: String, required: true },
  usageContexts: { type: [String], required: true },
  primaryLanguage: { type: String, required: true },
  secondaryLanguage: { type: String, required: true },
  // questionnaire: { type: QuestionnaireSchema, required: false }, // Removed questionnaire schema from here
});

const UserSchema: Schema = new Schema({
  uid: { type: String, required: true, unique: true, index: true },
  onboarding: { type: OnboardingSchema, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  generatedPrompt: { type: String }, // Added field for storing generated prompts
  // Future fields: preferences, personalization, aiEmbeddings, etc.
});

// Create indexes for onboarding options for analytics and fast lookup
UserSchema.index({
  'onboarding.textSize': 1,
  'onboarding.communicationPreference': 1,
  'onboarding.usageContexts': 1,
  'onboarding.primaryLanguage': 1,
  'onboarding.secondaryLanguage': 1,
  uid: 1
});

export default mongoose.model<IUser>('User', UserSchema, 'onboarding');
