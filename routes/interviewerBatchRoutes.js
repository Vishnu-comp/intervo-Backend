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

    const availableDays = ['Monday', 'Wednesday', 'Friday'];
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
      { "email": "Hannah@gmail.com", "score": 75, "time": "" }
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


// Utility function to add minutes to a datetime string in YYYY-MM-DDTHH:MM format
function addMinutes(datetime, minutes) {
  const date = new Date(datetime);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString().slice(0, 16); // Return datetime in YYYY-MM-DDTHH:MM format
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

// Scheduler function
function scheduleInterviews(days, timeSlot, interviewees) {
  const orderedDays = getOrderedDays(days);
  const schedule = {};
  const interviewDuration = 15; // in minutes
  const breakDuration = 5; // in minutes

  let intervieweeIndex = 0;

  for (const day of orderedDays) {
    if (intervieweeIndex >= interviewees.length) break; // Stop if no more interviewees

    schedule[day] = [];
    let [startTime, endTime] = timeSlot.split('-');
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const currentDate = String(new Date().getDate()).padStart(2, '0');

    // Create a base date for the current day
    let baseDate = `${currentYear}-${currentMonth}-${currentDate}`;

    // Set the start and end datetime for the current day
    let startDateTime = `${baseDate}T${startTime}`;
    const endDateTime = `${baseDate}T${endTime}`;

    // Loop to schedule interviews within the time slot
    while (startDateTime < endDateTime && intervieweeIndex < interviewees.length) {
      let nextSlotDateTime = addMinutes(startDateTime, interviewDuration);

      // Check if the next interview would end after the available end time
      if (nextSlotDateTime > endDateTime) break;

      // Schedule the interviewee and update their time field
      interviewees[intervieweeIndex].time = startDateTime;

      schedule[day].push(interviewees[intervieweeIndex]);

      intervieweeIndex++;
      startDateTime = addMinutes(nextSlotDateTime, breakDuration); // Update startDateTime after the break
    }
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