// routes/authRoutes.js
import express from 'express';
import { registerUser, authUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/signin', authUser);

export default router;
