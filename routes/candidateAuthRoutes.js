import express from 'express';
import { authCandidate } from '../controllers/candidateAuthController.js';

const router = express.Router();

router.post('/signin', authCandidate);

export default router;
