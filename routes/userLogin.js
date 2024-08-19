import express from 'express';
import Candidate from '../models/Candidate.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import InterviewBatch from '../models/InterviewBatch.js'
import Interviewer from '../models/Interviewer.js'
import AptitudeUser from '../models/AptitudeUser.js';
import CandidateMiddleware from '../middleware/CandidateMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace 'your_jwt_secret' with your actual JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'rrt543efdgtreft6rtr6';

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the candidate by email
    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(401).json({ valid: false, message: 'Invalid email or password' });
    }

    // Check if the password matches directly
    if (password !== candidate.password) {
      return res.status(401).json({ valid: false, message: 'Invalid email or password' });
    }

    // Generate a token with email and id
    const token = jwt.sign({ id: candidate._id, email: candidate.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      valid: true,
      token,
      username: candidate.username,
    });
  } catch (error) {
    console.error('Error during sign-in:', error);
    res.status(500).json({ valid: false, message: 'An error occurred during sign-in' });
  }
});
// Get candidate details
// Get candidate details
router.get('/details', CandidateMiddleware, async (req, res) => {
  try {
    const candidate = req.user; // Auth middleware attaches the candidate to req.user
    res.status(200).json(candidate);
  } catch (error) {
    console.error('Error fetching candidate details:', error);
    res.status(500).json({ message: 'An error occurred while fetching candidate details' });
  }
});


// Get scheduled interviews
// Get scheduled interviews
// Get scheduled interviews based on domain
router.get('/interviews', CandidateMiddleware, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);
    console.log(candidate.data)
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Generate interview data based on domain
    const currentDate = new Date();
    const validityDate = new Date();
    validityDate.setDate(currentDate.getDate() + 10); // Default validity of 10 days

    const interviews = [
      {
        id: 1,
        name: `${candidate.name}`,
        title: `${candidate.domain}`,
        email:`${candidate.email}`,
        comany:`${candidate.companyName}`,
        description: `Valid Till: ${validityDate.toISOString().split('T')[0]}`, // Format as YYYY-MM-DD
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWW9_d3hUdxBZ5W_Ltnlm7hD8fR-3jhvpAYg&s', // Placeholder image
      },
    ];
    console.log(interviews.data)
    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Error fetching interviews' });
  }
});


const questions = [
  {
    id: 1,
    text: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Madrid']
  },
  {
    id: 2,
    text: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Saturn']
  }
  // Add more questions as needed
];


// Get test questions
router.get('/test/questions', (req, res) => {
  res.json(questions);
});


const upload = multer({
  dest: 'uploads/', // Directory where files will be saved
  limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB size limit
  },
  fileFilter: (req, file, cb) => {
      // Filter to accept only jpg/jpeg/png files
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new Error('File type not allowed'), false);
      }
      cb(null, true);
  },
});

// Route to register a new user
router.post('/register', async (req, res) => {
  const { name, email } = req.body;
  try {
      const user = new AptitudeUser({ name, email });
      await user.save();
      res.status(201).send({ message: 'User registered successfully', user });
  } catch (error) {
      res.status(500).send({ message: 'Error registering user', error });
  }
});

// Route to upload face image

router.post('/uploadface', async (req, res) => {
  try {
      const { email, faceImage } = req.body; // Extract email and faceImage from request body
      
      if (!faceImage) {
          return res.status(400).send({ message: 'No image data provided' });
      }

      // Find user by email
      const user = await AptitudeUser.findOne({ email: email });
      if (!user) {
          return res.status(404).send({ message: 'User not found' });
      }

      // Convert Data URL to file
      const base64Data = faceImage.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const uploadDir = path.join(__dirname, './Faceuploads');
      const filePath = path.join(uploadDir, `${email}-faceImage.png`); // File name can be adjusted

      // Ensure the uploads directory exists
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save the image file
      fs.writeFile(filePath, buffer, async (err) => {
          if (err) {
              console.error('Error saving image:', err);
              return res.status(500).send({ message: 'Failed to save image' });
          }

          // Update user with the new image path
          user.faceImage = filePath;
          await user.save();

          res.status(200).send({ message: 'Face image uploaded successfully', faceImage: filePath });
      });
  } catch (error) {
      console.error('Error uploading face image:', error);
      res.status(500).send({ message: 'Error uploading face image', error });
  }
});
// Route to upload ID card image
// Route to handle ID card image upload from Data URL
router.post('/upload-idcard', async (req, res) => {
  try {
      const { email, idCardImage } = req.body; // Extract email and idCardImage from request body
      
      if (!idCardImage) {
          return res.status(400).send({ message: 'No image data provided' });
      }

      // Find user by email
      const user = await AptitudeUser.findOne({ email: email });
      if (!user) {
          return res.status(404).send({ message: 'User not found' });
      }

      // Convert Data URL to file
    const base64Data = idCardImage.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const uploadDir = path.join(__dirname, './Identityuploads');
      const filePath = path.join(uploadDir, `${email}-idCardImage.png`); // File name can be adjusted

      // Ensure the uploads directory exists
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save the image file
      fs.writeFile(filePath, buffer, async (err) => {
          if (err) {
              console.error('Error saving image:', err);
              return res.status(500).send({ message: 'Failed to save image' });
          }

          // Update user with the new image path
          user.idCardImage = filePath;
          await user.save();

          res.status(200).send({ message: 'ID card image uploaded successfully', idCardImage: filePath });
      });
  } catch (error) {
      console.error('Error uploading ID card image:', error);
      res.status(500).send({ message: 'Error uploading ID card image', error });
  }
});

//fetch interview details including interviwer name
// Get interview details for the current user
router.post('/interviewsdetails', async (req, res) => {
  console.log('Request received for /interviewsdetails with email:', req.body.email);
  const { email } = req.body;

  try {
    // Find the interview where the candidate's email is present in the candidates array
    const interview = await InterviewBatch.findOne({ 'candidates.email': email });

    if (!interview) {
      console.log('No interview found for email:', email);
      return res.status(404).json({ message: 'Interview details not found' });
    }

    console.log('Interview found:', interview);

    let interviewTime;
    let interviewDay;

    // Extract the schedule by date and find the corresponding interview time and day
    for (const [day, scheduleForDate] of Object.entries(interview.schedule)) {
      const scheduleEntry = scheduleForDate.find(s => s.email === email);
      if (scheduleEntry) {
        interviewTime = scheduleEntry.time;
        interviewDay = day;
        break;
      }
    }

    if (!interviewTime) {
      console.log('No interview time found for email:', email);
      return res.status(404).json({ message: 'Interview time not found' });
    }

    console.log('Interview time:', interviewTime, 'Interview day:', interviewDay);

    // Find the interviewer's email from the interviewers object
    let interviewerEmail;
    const interviewerEmails = Object.keys(interview.interviewers);
    for (const email of interviewerEmails) {
      if (interview.interviewers[email].batchIds.includes(interview.batchId)) {
        interviewerEmail = email;
        break;
      }
    }

    if (!interviewerEmail) {
      console.log('No interviewer email found for batch ID:', interview.batchId);
      return res.status(404).json({ message: 'Interviewer not found' });
    }

    // Fetch the interviewer details from the Interviewer model using the email
    const interviewer = await Interviewer.findOne({ email: interviewerEmail });

    if (!interviewer) {
      console.log('No interviewer found for email:', interviewerEmail);
      return res.status(404).json({ message: 'Interviewer not found' });
    }

    console.log('Interviewer found:', interviewer);

    // Extract the date from the interview time
    const date = interviewTime.split('T')[0];

    res.status(200).json({
      date: date,
      time: interviewTime,
      day: interviewDay, // Return the day of the week
      position: interview.domains,
      type: interview.interviewTypes.join(', '),
      interviewerName: interviewer.name // Return the interviewer's name
    });
  } catch (error) {
    console.error('Error fetching interview details:', error);
    res.status(500).json({ message: 'An error occurred while fetching interview details' });
  }
});




export default router;


