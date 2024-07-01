// index.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import interviewBatchRoutes from './routes/interviewBatchRoutes.js';
import getInterviewBatchRoutes from './routes/getInterviewBatchRoutes.js';
import meetingRouter from './routes/meetingRoutes.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/account', authRoutes);
app.use('/api', interviewBatchRoutes);
app.use('/api', getInterviewBatchRoutes);
app.use('/meeting', meetingRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
