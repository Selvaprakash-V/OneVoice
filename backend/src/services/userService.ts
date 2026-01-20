import User from '../models/User';

export async function saveGeneratedPrompt(uid: string, prompt: string): Promise<void> {
  const user = await User.findOne({ uid });
  if (!user) {
    throw new Error('User not found');
  }

  user.generatedPrompt = prompt;
  await user.save();
}