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
      // Return an error if the user does not exist
      console.log('User not found with uid:', uid); // Debug log
      return res.status(404).json({ error: 'User not found' });
    } else {
      // Update the existing user's questionnaire
      user.questionnaire = questionnaire; // Updated to top-level field
      await user.save();
      console.log('User updated:', user); // Debug log
      return res.status(200).json({ message: 'Questionnaire updated successfully', user });
    }
  } catch (error) {
    console.error('Error in POST /questionnaire:', error);
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