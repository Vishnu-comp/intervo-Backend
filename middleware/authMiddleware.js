// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import InterviewBatch from '../models/InterviewBatch.js';

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    req.user = user;

    // Check if user has necessary permissions
    if (user.role === 'admin') {
      // Admin can fetch all interview batches
      next();
    } else {
      // Non-admin user can fetch interview batches associated with their company
      const interviewBatches = await InterviewBatch.find({ companyName: user.companyName });
      req.interviewBatches = interviewBatches;
      next();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;
