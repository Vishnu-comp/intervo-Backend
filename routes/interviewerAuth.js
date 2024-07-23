import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';  // Import the fileURLToPath function from the url module
import { dirname } from 'path';  // Import the dirname function from the path module

const __filename = fileURLToPath(import.meta.url);  // Define __filename
const __dirname = dirname(__filename); 

const router = express.Router();

const imageToBase64 = (filePath) => {
  return fs.readFileSync(filePath, { encoding: 'base64' });
};

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

    const otp = Math.random().toString(36).slice(-8);

    // Simulating user creation (replace with actual logic)
    // const newUser = new User({
    //   email,
    //   password: otp, 
    //   username: email,
    //   companyName: 'Your Company',
    //   domain: 'example.com',
    // });

    // await newUser.save();

    const logoPath = path.join(__dirname, '../assets/logo-white.png');
    const base64Logo = imageToBase64(logoPath);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>Hello ${name},</p>
        <p>Thank you for being part of Your Company. Here are your account details:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>One-Time Password (OTP):</strong> ${otp}</p>
        <p>Please use the OTP to verify your email and complete the setup.</p>
        <p>Best regards,<br>Your Company Team</p>
        <div style="text-align: center; margin-top: 20px;">
          <img src="data:image/png;base64,${base64Logo}" alt="Your Company Logo" style="max-width: 150px;">
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Your OTP for Intervo Login',
      html: htmlContent,
    });

    res.status(200).json({ message: 'Email sent and user created successfully' });
  } catch (error) {
    console.error('Error sending email and creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;