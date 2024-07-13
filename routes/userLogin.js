import express from 'express';
import Candidate from '../models/Candidate.js';
import jwt from 'jsonwebtoken';

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

export default router;
