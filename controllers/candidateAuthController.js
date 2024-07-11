import Candidate from '../models/Candidate.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authCandidate = async (req, res) => {
  const { email, password } = req.body;

  try {
    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, candidate.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create a JWT token
    const token = jwt.sign({ id: candidate._id, email: candidate.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      token,
      username: candidate.username,
      email: candidate.email,
    });
  } catch (error) {
    console.error('Error during candidate signin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
