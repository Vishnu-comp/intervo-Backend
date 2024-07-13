  //controllers/authController.js
  import asyncHandler from 'express-async-handler';
  import User from '../models/User.js';
  import generateToken from '../utils/generateToken.js';
  import nodemailer from 'nodemailer';
  import Otp from '../models/Otp.js';

  // @desc    Register a new user
  // @route   POST /api/account/signup
  // @access  Public
  const registerUser = asyncHandler(async (req, res) => {
    const { companyName,companyType, username, email, password } = req.body;

    try {
      const userExists = await User.findOne({ email });

      if (userExists) {
        res.status(400);
        throw new Error('User already exists');
      }

      const user = await User.create({
        companyName,
        companyType,
        username,
        email,
        password,
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          companyName: user.companyName,
          companyType: user.companyType,
          token: generateToken(user._id),
        });
      } else {
        res.status(400);
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('Error during user registration:', error); // Log error
      res.status(500).json({ message: 'Server error during registration' });
    }
  });

  // @desc    Auth user & get token
  // @route   POST /api/account/signin
  // @access  Public
  const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          companyName: user.companyName,
          companyType: user.companyType,
          token: generateToken(user._id),
        });
      } else {
        res.status(401);
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during user authentication:', error); // Log error
      res.status(500).json({ message: 'Server error during authentication' });
    }
  });

  // @desc    Send OTP to email
  // @route   POST /api/account/send-otp
  // @access  Public
  const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otpCode}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      await Otp.create({ email, otp: otpCode });

      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error); // Log error
      res.status(500).json({ message: 'Error sending OTP' });
    }
  });

  // @desc    Verify OTP
  // @route   POST /api/account/verify-otp
  // @access  Public
  const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    try {
      const otpRecord = await Otp.findOne({ email, otp });

      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      // OTP verified, proceed with registration
      res.status(200).json({ message: 'OTP verified' });
    } catch (error) {
      console.error('Error verifying OTP:', error); // Log error
      res.status(500).json({ message: 'Error verifying OTP' });
    }
  });

  export { registerUser, authUser, sendOtp, verifyOtp };
