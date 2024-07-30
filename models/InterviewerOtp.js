import mongoose from "mongoose";
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // TTL in seconds (5 minutes)
  }
});

const InterviewerOtp = mongoose.model('InterviewerOtp', otpSchema);

export default InterviewerOtp;
