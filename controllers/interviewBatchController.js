import asyncHandler from 'express-async-handler';
import InterviewBatch from '../models/InterviewBatch.js';

// @desc    Create a new interview batch
// @route   POST /api/interviewBatch
// @access  Private (requires authorization)
const createInterviewBatch = asyncHandler(async (req, res) => {
  // Extract form data
  const {
    companyName,
    totalCandidatesRequired,
    domains,
    skills,
    interviewTypes,
    deadline,
    csvFile,
  } = req.body;

  // Create new InterviewBatch instance
  const interviewBatch = new InterviewBatch({
    companyName,
    totalCandidatesRequired,
    domains,
    skills,
    interviewTypes,
    deadline,
    csvFile,
  });

  // Save interview batch to database
  const createdBatch = await interviewBatch.save();

  res.status(201).json(createdBatch);
});

export { createInterviewBatch };
