console.log('🔥🔥🔥 app.ts IS RUNNING 🔥🔥🔥');
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import onboardingRouter from './routes/onboarding';
import userRouter from './routes/user';
import questionnaireRouter from './routes/questionnaire';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

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
app.use('/questionnaire', questionnaireRouter);

app.get('/', (req, res) => {
  res.send('OneVoice API running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
