// models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correct_option: {
    type: String,
    required: true
  }
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
