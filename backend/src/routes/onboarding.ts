import express from 'express';
import User from '../models/User';

const router = express.Router();

// GET /onboarding?uid=xxx
router.get('/', async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) {
      return res.status(400).json({ error: 'Missing uid parameter.' });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /onboarding
router.post('/', async (req, res) => {
  try {
    const { uid, onboarding } = req.body;
    if (!uid || !onboarding) {
      return res.status(400).json({ error: 'Missing uid or onboarding data.' });
    }

    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, onboarding });
      await user.save();
      return res.status(201).json({ message: 'User created', user });
    } else {
      user.onboarding = onboarding;
      user.updatedAt = new Date();
      await user.save();
      return res.status(200).json({ message: 'User updated', user });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /onboarding/questionnaire
router.post('/questionnaire', async (req, res) => {
  try {
    console.log('Received questionnaire input:', req.body); // Log input data

    const { uid, questionnaire } = req.body;
    if (!uid || !questionnaire) {
      return res.status(400).json({ error: 'Missing uid or questionnaire data.' });
    }

    let user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.questionnaire = questionnaire; // Updated to top-level field
    user.updatedAt = new Date();
    await user.save();

    return res.status(200).json({ message: 'Questionnaire saved successfully', user });
  } catch (error) {
    console.error('Error in /questionnaire route:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
