import express, { Response } from 'express';
import { saveGeneratedPrompt } from '../services/userService';
import { SignRecognitionService } from '../services/signRecognitionService';

const router = express.Router();

// Ensure req.user is properly typed
interface AuthenticatedRequest extends express.Request {
  user?: { id: string };
}

// Mock ChatController for backend usage
const ChatController = {
  processInput: async ({ uid, mode, text, activeContext, prefs }: any) => {
    return {
      response: `Processed input for user ${uid} in mode ${mode} with text: ${text}`,
    };
  },
};

// Save generated prompt
router.post('/:uid/generatedPrompt', async (req: express.Request, res: Response) => {
  const uid = req.params.uid as string; // Ensure uid is a string
  const prompt = req.body.prompt as string; // Ensure prompt is a string

  try {
    await saveGeneratedPrompt(uid, prompt);
    res.status(200).send({ message: 'Prompt saved successfully' });
  } catch (error) {
    console.error('Error saving generated prompt:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Process sign input
router.post('/process-sign', async (req: AuthenticatedRequest, res) => {
  const { signFrames } = req.body;

  if (!signFrames) {
    return res.status(400).json({ error: 'Sign frames are required' });
  }

  try {
    const recognizedText = await SignRecognitionService.recognizeSign(signFrames);
    const chatResponse = await ChatController.processInput({
      uid: req.user?.id || 'unknown', // Fallback for missing user ID
      mode: 'sign',
      text: recognizedText,
      activeContext: req.body.activeContext,
      prefs: req.body.prefs,
    });

    res.json(chatResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process sign input' });
  }
});

export default router;