// routes/interviewBatchRoutes.js
import express from 'express';
import InterviewBatch from '../models/InterviewBatch.js';
import multer from 'multer';
import Interviewer from '../models/Interviewer.js';

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

router.post("/get-new-batches", async (req, res) => {
  const { email } = req.body;

  try {
    const batches = await InterviewBatch.find();
    const interviewer = await Interviewer.findOne({ email });
    const domains = interviewer.domains;

    console.log('Interviewer domains:', batches);
    const newBatches = batches.filter(batch => {
      return  !batch.interviewers[email];
    });
    // domains.includes(batch.skills) &&
    res.status(200).json({ newBatches });

  } catch (error) {
    console.error('Error getting new batches:', error);
    res.status(400).json({ message: error.message });
  }
})

export default router;
