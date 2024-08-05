// routes/candidateRoutes.js
import express from 'express';
import nodemailer from 'nodemailer';
import Candidate from '../models/Candidate.js';
import InterviewBatch from '../models/InterviewBatch.js';

const router = express.Router();

const removeBOM = (str) => {
  if (str.charCodeAt(0) === 0xFEFF) {
    return str.slice(1);
  }
  return str;
};

router.post('/storeCandidates', async (req, res) => {
  const { candidates, companyName, batchId } = req.body;

  try {
    // Clean BOM from candidate keys
    const cleanedCandidates = candidates.map((candidate) => {
      const cleanedCandidate = {};
      for (let key in candidate) {
        const cleanedKey = removeBOM(key);
        cleanedCandidate[cleanedKey] = candidate[key];
      }
      return cleanedCandidate;
    });

    // Validate candidates
    const validCandidates = cleanedCandidates.filter(candidate => candidate.email);

    if (validCandidates.length === 0) {
      throw new Error('No valid candidates found');
    }

    // Set up Nodemailer transporter with Gmail and app-specific password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const promises = validCandidates.map(async (candidate) => {
      const randomPassword = Math.random().toString(36).slice(-8);

      // Save candidate to the database with batchId
      const newCandidate = new Candidate({
        srNo: candidate.srNo,
        email: candidate.email,
        name: candidate.name,
        companyName,
        experience: candidate.experience,
        domain: candidate.domain,
        sex: candidate.sex,
        username: candidate.email, // Use email as username
        password: randomPassword,
        batchId // Store the batchId here
      });

      await newCandidate.save();

      // Send email to candidate
      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: candidate.email,
        subject: 'Your Account Credentials',
        text: `Your email: ${candidate.email}\nYour password: ${randomPassword}\nCompany Name: ${companyName}\nDomain: ${candidate.domain || 'Not specified'}`, // Include domain in the email
      });

      // Update InterviewBatch with candidate
      await InterviewBatch.updateOne(
        { batchId },
        { $push: { candidates: { email: candidate.email, testScore: 0, interviewScore: 0 } } }
      );
    });

    await Promise.all(promises);

    res.status(200).json({ message: 'Candidates stored, emails sent, and interview batch updated successfully' });
  } catch (error) {
    console.error('Error storing candidates and sending emails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
