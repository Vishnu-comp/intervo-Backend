// // routes/questions.js
// import express from 'express';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const router = express.Router();

// // Get the directory name of the current module file
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Helper function to load questions from all JSON files
// const loadQuestionsFromJSON = () => {
//   const questionsDir = path.join(__dirname, '../questions');
//   const files = fs.readdirSync(questionsDir);
//   let allQuestions = [];

//   files.forEach((file) => {
//     const filePath = path.join(questionsDir, file);
//     const fileContent = fs.readFileSync(filePath, 'utf8');
//     const questions = JSON.parse(fileContent);
//     allQuestions = allQuestions.concat(questions);
//   });

//   return allQuestions;
// };

// // Get all questions
// router.get('/', (req, res) => {
//   try {
//     const questions = loadQuestionsFromJSON();
//     res.json(questions);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Get a random question
// router.get('/random', (req, res) => {
//   try {
//     const questions = loadQuestionsFromJSON();
//     const randomIndex = Math.floor(Math.random() * questions.length);
//     res.json(questions[randomIndex]);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;


import express from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import TestResult from '../models/TestResult.js';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to load questions from all JSON files
const loadQuestionsFromJSON = () => {
  const questionsDir = path.join(__dirname, '../questions');
  const files = fs.readdirSync(questionsDir);
  let allQuestions = [];

  files.forEach((file) => {
    const filePath = path.join(questionsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(fileContent);
    allQuestions = allQuestions.concat(questions);
  });

  return allQuestions;
};

// Shuffle array function
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Get 20 random questions
router.get('/random20', (req, res) => {
  try {
    let questions = loadQuestionsFromJSON();
    shuffleArray(questions);
    const randomQuestions = questions.slice(0, 20); // Get first 20 questions from the shuffled array
    const numberedQuestions = randomQuestions.map((question, index) => ({
      ...question,
      questionNumber: index + 1
    }));
    res.json(numberedQuestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//test results
router.post('/submit-results', async (req, res) => {
  try {
    const { userId, correctAnswers, questionsAttempted, timeTaken, startTime, endTime } = req.body;

    // Validate and parse dates
    const startedAtDate = new Date(startTime);
    const endedAtDate = new Date(endTime);

    if (isNaN(startedAtDate.getTime()) || isNaN(endedAtDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    // Validate input
    if (typeof correctAnswers !== 'number' || typeof questionsAttempted !== 'number' || typeof timeTaken !== 'number') {
      return res.status(400).json({ message: 'Invalid input: correctAnswers, questionsAttempted, and timeTaken must be numbers.' });
    }

    const wrongAnswersCount = questionsAttempted - correctAnswers;
    const percentage = (questionsAttempted > 0) ? (correctAnswers / questionsAttempted) * 100 : 0;

    // Save the test results to the database
    const testResult = new TestResult({
      userId,
      correctAnswersCount: correctAnswers,
      wrongAnswersCount,
      marksScored: correctAnswers, // Assuming 1 mark per correct answer
      questionsAttempted,
      percentage,
      timeTaken,
      startedAt: startedAtDate,
      endedAt: endedAtDate,
      resultAvailable: true 
    });
   
    await testResult.save();

    res.status(201).json({ message: 'Test results saved successfully.' });
  } catch (error) {
    console.error('Error saving test results:', error);
    res.status(500).json({ message: 'Error saving test results.' });
  }
});

//fetch test results
router.post('/test-results', async (req, res) => {
  try {
    const { userId } = req.body; // Receiving userId from request body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Ensure userId is a valid ObjectId and convert it
    const objectId = new mongoose.Types.ObjectId(userId); 

    // Query the TestResult model to find if the result is available
    const testResult = await TestResult.findOne({ userId: objectId });

    // Respond based on whether the test result is found
    if (testResult) {
      return res.status(200).json(testResult);
    } else {
      return res.status(404).json({ error: 'Test result not found' });
    }
  
  } catch (error) {
    console.error('Error checking result status:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
