import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import userRouter from './routes/userRouter.js';
import eventRouter from './routes/eventRouter.js';
import teamRouter from './routes/teamRouter.js';
import analyticsRouter from './routes/analyticsRouter.js';

dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Allow frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

app.use('/api/users', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/teams', teamRouter);
app.use('/api/analytics', analyticsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));