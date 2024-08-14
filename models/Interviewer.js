import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the schema
const interviewerSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'] // Simple email validation
  },
  name: {
    type: String,
    required: true
  },
  domains: {
    type: [String],
    required: true
  },
  days: {
    type: [String],
    required: true
  },
  exp: {
    type: Number,
    required: true
  },
  timeFrom: {
    type: String,
    required: true,
    match: [/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Please fill a valid time in HH:mm format'] // Simple time validation
  },
  timeTo: {
    type: String,
    required: true,
    match: [/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Please fill a valid time in HH:mm format'] // Simple time validation
  },
  password: {
    type: String,
    required: true
  },
  batchIds: {
    type: [String],
    required: true
  }
});

// Create the model
const Interviewer = mongoose.model('Interviewer', interviewerSchema);

export default Interviewer;
