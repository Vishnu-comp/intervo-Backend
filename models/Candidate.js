import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  srNo: { type: Number, required: false },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  companyName: { type: String, required: true },
  experience: { type: String, required: true },
  domain: { type: String, required: true },
  sex: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  batchIds: [{ type: String }] // Add batchIds array
});

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;
