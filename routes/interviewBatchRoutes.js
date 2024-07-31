
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import InterviewBatch from '../models/InterviewBatch.js';

// Determine the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import multer from 'multer';
import Interviewer from '../models/Interviewer.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/csv'); // Path to csv folder
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create the folder if it doesn't exist
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Create a new interview batch
router.post('/interviewBatch', upload.single('csvFile'), async (req, res) => {
  try {
    // Save the relative path to the database
    const csvFileRelativePath = path.relative(__dirname, req.file.path).replace(/\\/g, '/');

    const interviewBatch = new InterviewBatch({
      companyName: req.body.companyName,
      totalCandidatesRequired: req.body.totalCandidatesRequired,
      domains: req.body.domains,
      skills: JSON.parse(req.body.skills),
      interviewTypes: JSON.parse(req.body.interviewTypes),
      deadline: req.body.deadline,
      csvFile: csvFileRelativePath, // Save the relative file path
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

// Serve CSV file content
router.get('/getCSVFile/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/csv', req.params.filename);
  res.sendFile(filePath);
});

export default router;
