console.log('🔥 questionnaire router file LOADED');
import express from 'express';
import User from '../models/User'; // Corrected import for Mongoose model

const router = express.Router();

// POST /questionnaire
router.post('/', async (req, res) => {
  console.log('POST /questionnaire called with body:', req.body); // Debug log
  try {
    const { uid, questionnaire } = req.body;

    if (!uid || !questionnaire) {
      console.log('Missing required fields:', { uid, questionnaire }); // Debug log
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the user exists
    const user = await User.findOne({ uid });
    console.log('User found:', user); // Debug log

    if (!user) {
      // Create a new user with minimal onboarding data if they don't exist
      console.log('User not found, creating new user with uid:', uid);
      const newUser = new User({
        uid,
        onboarding: {
          textSize: 'medium',
          communicationPreference: 'both',
          usageContexts: ['general'],
          primaryLanguage: 'English',
          secondaryLanguage: 'None'
        },
        questionnaire
      });
      await newUser.save();
      console.log('New user created:', newUser);
      return res.status(201).json({ message: 'User created with questionnaire', user: newUser });
    } else {
      // Update the existing user's questionnaire
      user.questionnaire = questionnaire;
      await user.save();
      console.log('User updated:', user); // Debug log
      return res.status(200).json({ message: 'Questionnaire updated successfully', user });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in POST /questionnaire:', error.message, error.stack);
    } else {
      console.error('Unexpected error in POST /questionnaire:', error);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /questionnaire
router.get('/', (req, res) => {
  console.log('GET /questionnaire called'); // Debug log
  res.status(200).json({ message: 'GET request to /questionnaire is successful' });
});

// OPTIONS /questionnaire
router.options('/', (req, res) => {
  res.status(204).send();
});

export default router;