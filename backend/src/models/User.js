import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  onboarding: {
    textSize: String,
    communicationPreference: String,
    usageContexts: [String],
    primaryLanguage: String,
    secondaryLanguage: String,
  },
  contexts: {
    type: Map,
    of: {
      struggles: String,
      preference: String,
      tone: String,
      goals: String,
      assistanceStyle: String,
      updatedAt: Date,
    },
  },
  generatedPrompt: { type: String },
});

const User = mongoose.model('User', UserSchema);
export default User;