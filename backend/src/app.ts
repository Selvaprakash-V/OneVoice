console.log('🔥🔥🔥 app.ts IS RUNNING 🔥🔥🔥');
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import onboardingRouter from './routes/onboarding';
import userRouter from './routes/user';
import animationRouter from './routes/animation';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// Serve static assets (videos)
// Assumes assets are in backend/public/assets
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// Debug log to confirm middleware registration
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri || '')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/onboarding', onboardingRouter);
app.use('/users', userRouter);
app.use('/animation', animationRouter);

app.get('/', (req, res) => {
  res.send('OneVoice API running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
