// routes/getInterviewBatchRoutes.js
import express from 'express';
import InterviewBatch from '../models/InterviewBatch.js';

const router = express.Router();

// Fetch all interview batches
router.get('/interviewBatch', async (req, res) => {
  try {
    const interviewBatches = await InterviewBatch.find();
    res.status(200).json(interviewBatches);
  } catch (error) {
    console.error('Error fetching interview batches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
