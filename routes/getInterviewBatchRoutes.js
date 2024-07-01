import express from 'express';
import InterviewBatch from '../models/InterviewBatch.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Assuming you have authentication middleware

const router = express.Router();

// Fetch interview batches for logged-in user's company
router.get('/interviewBatch', authMiddleware, async (req, res) => {
  const companyName = req.user.companyName; // Assuming company name is stored in req.user

  try {
    const interviewBatches = await InterviewBatch.find({ companyName });
    res.status(200).json(interviewBatches);
  } catch (error) {
    console.error('Error fetching interview batches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
