import express from 'express';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const router = express.Router();

router.post('/sendEmails', async (req, res) => {
  const { emails, companyName, domain } = req.body;

  try {
    // Set up Nodemailer transporter with Gmail and app-specific password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const promises = emails.map(async (emailEntry) => {
      if (!emailEntry || !emailEntry.email) {
        console.error('Invalid emailEntry:', emailEntry);
        throw new Error('Invalid emailEntry');
      }

      const randomPassword = Math.random().toString(36).slice(-8);

      const newUser = new User({
        email: emailEntry.email,
        password: randomPassword,
        username: emailEntry.email, // Use email as username
        companyName,
        domain,
      });

      await newUser.save();

      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: emailEntry.email,
        subject: 'Your Account Credentials',
        text: `Your email: ${emailEntry.email}\nYour password: ${randomPassword}\nCompany Name: ${companyName}\nDomain: ${emailEntry.domain}`,
      });
    });

    await Promise.all(promises);

    res.status(200).json({ message: 'Emails sent and users created successfully' });
  } catch (error) {
    console.error('Error sending emails and creating users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
