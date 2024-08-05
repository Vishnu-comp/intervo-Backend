import express from 'express';
import InterviewBatch from '../models/InterviewBatch.js';
import Interviewer from '../models/Interviewer.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.post('/get-new-batches', async (req, res) => {
  const { email } = req.body;

  try {
    const newBatches = await InterviewBatch.find();
    const interviewer = await Interviewer.findOne({ email });

    const batches = newBatches.filter(batch => {
      const isDomainMatch = batch.skills.some(domain => interviewer.domains.includes(domain));
      const isNew = !Object.keys(batch.interviewers).includes(email);
      return isDomainMatch && isNew;
    });
    res.status(200).json(batches);
  } catch (error) {
    console.error('Error fetching new batches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/get-batch', async (req, res) => {
  const { batchId, email } = req.body;

  try {
    let batch = await InterviewBatch.findOne({ batchId });
    const filePath = path.join(__dirname, batch.csvFile);
    const json = await csvToJson(filePath);
    batch = batch.toObject();
    batch.candidates = json;

    // Define the interviewer's available days and time slot
    const availableDays = ['Monday', 'Wednesday', 'Saturday'];
    const timeSlot = '09:00-11:00';

    // Define the list of interviewees with email and score
    const interviewees = [
      { "email": "Alice@gmail.com", "score": 50, "time": "" },
      { "email": "Bob@gmail.com", "score": 60, "time": "" },
      { "email": "Charlie@gmail.com", "score": 70, "time": "" },
      { "email": "David@gmail.com", "score": 80, "time": "" },
      { "email": "Eve@gmail.com", "score": 90, "time": "" },
      { "email": "Frank@gmail.com", "score": 55, "time": "" },
      { "email": "Grace@gmail.com", "score": 65, "time": "" },
      { "email": "Hannah@gmail.com", "score": 75, "time": "" },
      { "email": "Alice@gmail.com", "score": 50, "time": "" },
      { "email": "Bob@gmail.com", "score": 60, "time": "" },
      { "email": "Charlie@gmail.com", "score": 70, "time": "" },
      { "email": "David@gmail.com", "score": 80, "time": "" },
      { "email": "Eve@gmail.com", "score": 90, "time": "" },
      { "email": "Frank@gmail.com", "score": 55, "time": "" },
      { "email": "Grace@gmail.com", "score": 65, "time": "" },
      { "email": "Hannah@gmail.com", "score": 75, "time": "" },
      { "email": "Hannah@gmail.com", "score": 75, "time": "" },
      { "email": "Alice@gmail.com", "score": 50, "time": "" },
      { "email": "Bob@gmail.com", "score": 60, "time": "" },
      { "email": "Charlie@gmail.com", "score": 70, "time": "" },
      { "email": "David@gmail.com", "score": 80, "time": "" },
      { "email": "Eve@gmail.com", "score": 90, "time": "" },
      { "email": "Frank@gmail.com", "score": 55, "time": "" },
      { "email": "Grace@gmail.com", "score": 65, "time": "" },
      { "email": "Hannah@gmail.com", "score": 75, "time": "" },
    ];

    // Get the schedule
    const interviewSchedule = scheduleInterviews(availableDays, timeSlot, interviewees);

    console.log(JSON.stringify(interviewees, null, 2));
    console.log('=================================================================');


    res.status(200).json(batch);

  } catch (error) {
    console.error('Error fetching new batches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Function to add minutes to a time string
function addMinutes(time, minsToAdd) {
  let [hours, minutes] = time.split(':').map(Number);
  minutes += minsToAdd;
  hours += Math.floor(minutes / 60);
  minutes %= 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Function to get the ordered days starting from the current day
function getOrderedDays(days) {
  const todayIndex = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
  const dayMap = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  const orderedDays = days
    .map(day => ({ day, index: dayMap[day] }))
    .sort((a, b) => ((a.index - todayIndex + 7) % 7) - ((b.index - todayIndex + 7) % 7))
    .map(dayObj => dayObj.day);

  return orderedDays;
}

// Function to get the next date for a given day of the week
function getNextDateForDay(day, currentDate) {
  const dayMap = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  const currentDayIndex = currentDate.getDay();
  const targetDayIndex = dayMap[day];
  const daysUntilNext = (targetDayIndex - currentDayIndex + 7) % 7;

  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + daysUntilNext);

  return nextDate;
}

// Scheduler function
function scheduleInterviews(days, timeSlot, interviewees) {
  const orderedDays = getOrderedDays(days);
  const schedule = {};
  const interviewDuration = 15;
  const breakDuration = 5;

  let intervieweeIndex = 0;

  const today = new Date();

  while (intervieweeIndex < interviewees.length) {
    for (const day of orderedDays) {
      if (intervieweeIndex >= interviewees.length) break; // Stop if no more interviewees

      schedule[day] = schedule[day] || [];
      let [start, end] = timeSlot.split('-');

      while (start < end) {
        if (intervieweeIndex >= interviewees.length) break; // Stop if no more interviewees

        let nextSlot = addMinutes(start, interviewDuration);

        // Check if the next interview would end after the available end time
        if (nextSlot > end) break;

        // Get the next date for the current day
        let interviewDay = getNextDateForDay(day, today);

        // Schedule the interviewee and update their time field
        interviewees[intervieweeIndex].time = `${interviewDay.toISOString().split('T')[0]}T${start}`;

        schedule[day].push(interviewees[intervieweeIndex]);

        intervieweeIndex++;
        start = addMinutes(nextSlot, breakDuration); // Next slot starts after the break
      }
    }
    today.setDate(today.getDate() + 7); // Move to the next week
  }

  return schedule;
}

function csvToJson(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }

      const lines = data.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',');

      const result = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = headers.reduce((object, header, index) => {
          object[header.trim()] = values[index] ? values[index].trim() : null;
          return object;
        }, {});
        return obj;
      });

      resolve(JSON.stringify(result, null, 2));
    });
  });
}

export default router;