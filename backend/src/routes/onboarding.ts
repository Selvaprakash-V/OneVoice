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
    console.log('POST /onboarding - req.body:', req.body); // Debug log
    console.log('POST /onboarding - req.headers:', req.headers); // Debug log
    
    const { uid, onboarding } = req.body || {};
    if (!uid || !onboarding) {
      console.log('Missing data - uid:', uid, 'onboarding:', onboarding); // Debug log
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

export default router;
