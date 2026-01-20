import express from 'express';
import User from '../models/User';

const router = express.Router();

// Add your user routes here
router.get('/', (req, res) => {
  res.json({ message: 'User routes' });
});

export default router;