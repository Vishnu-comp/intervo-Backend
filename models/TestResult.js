// models/interviewBatch.js
import mongoose from 'mongoose';


const testResultSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AptitudeUser', // Assuming you have a User model
      required: true,
    },
    correctAnswersCount: {
      type: Number,
      required: true,
    },
    wrongAnswersCount: {
      type: Number,
      required: true,
    },
    marksScored: {
      type: Number,
      required: true,
    },
    questionsAttempted: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number,
      required: true, // Time taken in seconds
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    }
  }, { timestamps: true });
  

export default mongoose.model('TestResult', testResultSchema);
