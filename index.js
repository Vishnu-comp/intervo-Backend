import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import interviewBatchRoutes from './routes/interviewBatchRoutes.js';
import getInterviewBatchRoutes from './routes/getInterviewBatchRoutes.js';
import meetingRouter from './routes/meetingRoutes.js';
import interviewerRouter from './routes/interviewerAuth.js';
import sendEmailsRoute from './routes/sendEmails.js';
import storeCandidatesRoute from './routes/storeCandidates.js';
import userLogin from './routes/userLogin.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());

// Middleware to serve static files from 'uploads/csv' directory
app.use('/api/uploads/csv', express.static(path.join(__dirname, 'uploads', 'csv')));

app.use('/api/account', authRoutes);
app.use('/api', interviewBatchRoutes);
app.use('/api', getInterviewBatchRoutes);
app.use('/api', sendEmailsRoute);
app.use('/api', storeCandidatesRoute);
app.use('/candidate', userLogin);

// Aarav's routes
app.use('/meeting', meetingRouter);
app.use('/interviewer', interviewerRouter);

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
