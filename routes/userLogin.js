import express from 'express';
import Candidate from '../models/Candidate.js';
import jwt from 'jsonwebtoken';
import CandidateMiddleware from '../middleware/CandidateMiddleware.js';
const router = express.Router();

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

    // Generate a token
    const token = jwt.sign({ id: candidate._id }, JWT_SECRET, { expiresIn: '1h' });

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
        name: `${candidate.username}`,
        title: `${candidate.domain}`,
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



export default router;


