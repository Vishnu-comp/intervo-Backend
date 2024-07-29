// routes/interviewBatchRoutes.js
import express from 'express';
import InterviewBatch from '../models/InterviewBatch.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

// Create a new interview batch
router.post('/interviewBatch', upload.single('csvFile'), async (req, res) => {
  try {
    const interviewBatch = new InterviewBatch({
      companyName: req.body.companyName,
      totalCandidatesRequired: req.body.totalCandidatesRequired,
      domains: req.body.domains,
      skills: JSON.parse(req.body.skills),
      interviewTypes: JSON.parse(req.body.interviewTypes),
      deadline: req.body.deadline,
      csvFile: req.file.buffer.toString('base64'),
      note: req.body.note,
    });

    await interviewBatch.save();
    res.status(201).json({ message: 'Interview batch created successfully' });
  } catch (error) {
    console.error('Error creating interview batch:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
