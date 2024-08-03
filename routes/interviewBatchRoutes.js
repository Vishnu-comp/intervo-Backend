//routes/interviewBatchRoutes.js
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

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/csv');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Function to generate a unique 6-digit batchId
const generateUniqueBatchId = async (model) => {
  const generate = () => Math.floor(100000 + Math.random() * 900000).toString();

  let batchId = generate();
  let exists = await model.findOne({ batchId });

  while (exists) {
    batchId = generate();
    exists = await model.findOne({ batchId });
  }

  return batchId;
};

// Create a new interview batch
router.post('/interviewBatch', upload.single('csvFile'), async (req, res) => {
  try {
    const csvFileRelativePath = path.relative(__dirname, req.file.path).replace(/\\/g, '/');
    
    const batchId = await generateUniqueBatchId(InterviewBatch); // Generate unique batchId

    const interviewBatch = new InterviewBatch({
      companyName: req.body.companyName,
      totalCandidatesRequired: req.body.totalCandidatesRequired,
      domains: req.body.domains,
      skills: JSON.parse(req.body.skills),
      interviewTypes: JSON.parse(req.body.interviewTypes),
      deadline: req.body.deadline,
      csvFile: csvFileRelativePath,
      note: req.body.note,
      batchId, // Add the batchId here
    });

    await interviewBatch.save();
    res.status(201).json({ message: 'Interview batch created successfully', batchId });
  } catch (error) {
    console.error('Error creating interview batch:', error);
    res.status(400).json({ message: error.message });
  }
});

// Serve CSV file content
router.get('/getCSVFile/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/csv', req.params.filename);
  res.sendFile(filePath);
});

export default router;
