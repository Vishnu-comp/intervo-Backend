// models/interviewBatchSchema.js
import mongoose from 'mongoose';

const interviewBatchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  totalCandidatesRequired: { type: Number, required: true },
  domains: { type: String, required: true },
  skills: { type: [String], required: true },
  interviewTypes: { type: [String], required: true },
  deadline: { type: Date, required: true },
  csvFile: { type: String, required: true },
  note: { type: String, required: true },
  interviewers: {type: Object, default: {}},
}, {
  timestamps: true,
});

export default mongoose.model('InterviewBatch', interviewBatchSchema);
