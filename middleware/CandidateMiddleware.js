import jwt from 'jsonwebtoken';
import Candidate from '../models/Candidate.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const candidate = await Candidate.findById(decoded.id).select('-password');
    if (!candidate) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = candidate;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;
