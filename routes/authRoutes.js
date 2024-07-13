import express from 'express';
import { registerUser, authUser, sendOtp, verifyOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/signin', authUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
