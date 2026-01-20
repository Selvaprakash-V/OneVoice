import mongoose, { Schema, Document } from 'mongoose';
import { Questionnaire } from './User';

export interface IQuestionnaireDocument extends Document {
  uid: string;
  questionnaire: Questionnaire;
  createdAt: Date;
}

const QuestionnaireRecordSchema: Schema = new Schema({
  uid: { type: String, required: true, index: true },
  questionnaire: {
    communicationChallenges: { type: String, required: true },
    preferredStyle: { type: String, required: true },
    contextNeeds: { type: String, required: true },
    signNuances: { type: String, required: true },
    techFeedback: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

// Explicitly set collection name to "questionnare" as requested
export default mongoose.model<IQuestionnaireDocument>(
  'Questionnaire',
  QuestionnaireRecordSchema,
  'questionnare'
);