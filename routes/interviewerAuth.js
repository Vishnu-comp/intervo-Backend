import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import InterviewerOtp from '../models/InterviewerOtp.js';
import Interviewer from '../models/Interviewer.js';
const router = express.Router();

router.post('/sendOtp', async (req, res) => {
  const { email, name } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const randomNumber = Math.floor(Math.random() * 1000000);
    const otp = String(randomNumber).padStart(6, '0');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #fff;">
        <p>Hello ${name},</p>
        <p>Your Otp to register as an Interviewer on Intervo.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>One-Time Password (OTP):</strong> ${otp}</p>
        <p>Please use the OTP to verify your email and complete the setup.</p>
        <p>Best regards,<br>Intervo</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Your OTP for Intervo Registration',
      html: htmlContent,
    });

    if (await InterviewerOtp.findOne({ email })) {
      await InterviewerOtp.findOneAndUpdate({ email },
        { otp, createdAt: new Date() });
    } else {
      await new InterviewerOtp({ email, otp }).save();
    }

    res.status(200).json({ message: 'Email sent and user created successfully' });
  } catch (error) {
    console.error('Error sending email and creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/verifyOtp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const Otp = await InterviewerOtp.findOne({ email, otp });
    if (!Otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    return res.status(200).json({ message: 'OTP verified successfully' });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

router.post('/register', async (req, res) => {
  const { email, name, domains, exp, timeFrom, timeTo, password, days } = req.body;

  try {
    console.log("ZXCV");
    console.log(req.body);
    const interviewer = await new Interviewer({ email, name, domains, exp, timeFrom, timeTo, password, days }).save();
    res.status(201).json({ message: 'Interviewer registered successfully' });
  } catch (error) {
    console.error('Error registering interviewer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const interviewer = await Interviewer.findOne({ email, password });
    if (!interviewer) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    let token = jwt.sign(interviewer.toObject(), process.env.JWT_SECRET);
    return res.status(200).json({ message: 'Login successful', interviewer, token });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post("/getPreferences", async (req, res) => {
  const { email } = req.body;

  try {
    let interviewer = await Interviewer.findOne({ email });
    delete interviewer.password;
    delete interviewer._id;
    return res.status(200).json(interviewer);
  } catch (error) {
    console.error('Error getting interviewer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post("/updatePreferences", async (req, res) => {
  const { email, domains, exp, timeFrom, timeTo, days } = req.body;

  try {
    let interviewer = await Interviewer.findOneAndUpdate({ email }, { domains, exp, timeFrom, timeTo, days });
    return res.status(200).json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating interviewer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
);

export default router;