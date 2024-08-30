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

router.post('/get-accepted-batches', async (req, res) => {
  const { email } = req.body;

  try {
    const allBatches = await InterviewBatch.find();
    const interviewer = await Interviewer.findOne({ email });

    const batches = allBatches.filter(batch => {
      const isDomainMatch = batch.skills.some(domain => interviewer.domains.includes(domain));
      const isAccepted = Object.keys(batch.interviewers).includes(email);
      return isDomainMatch && isAccepted;
    });

    res.status(200).json(batches);
  } catch (error) {
    console.error('Error fetching accepted batches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/get-batch', async (req, res) => {
  const { batchId, email } = req.body;
  console.log(batchId, email);

  try {
    let batch = await InterviewBatch.findOne({ batchId });
    const candidates = batch.candidates;
    // console.log(batch.candidates);
    let interviewer = await Interviewer.findOne({ email });
    const filePath = path.join(__dirname, batch.csvFile);
    const json = await csvToJson(filePath);
    batch = batch.toObject();
    batch.tableData = json;
    
    // Define the interviewer's available days and time slot
    // const availableDays = ['Monday', 'Wednesday', 'Saturday'];
    const timeSlot = `${interviewer.timeFrom}-${interviewer.timeTo}`;
    
    // Get the schedule
    const interviewSchedule = scheduleInterviews(interviewer.days, timeSlot, batch.candidates);
    
    // console.log(JSON.stringify(interviewSchedule, null, 2));
    console.log('=================================================================');
    
    batch.schedule = JSON.stringify(interviewSchedule, null, 2);
    // console.log(batch);
    
    batch.candidates = candidates;
    // console.log(candidates);
    res.status(200).json(batch);

  } catch (error) {
    console.error('Error fetching new batches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/accept-batch', async (req, res) => {
  const { batchId, email, schedule } = req.body;

  try {
    let batch = await InterviewBatch.findOne({ batchId });
    let interviewer = await Interviewer.findOne({ email });

    interviewer.batchIds.push(batchId);
    batch.interviewers[email] = interviewer;
    batch.schedule = JSON.parse(schedule);

    await interviewer.save();
    await batch.save();

    res.status(200).json({ message: 'Batch accepted successfully' });

  } catch (error) {
    console.error('Error accepting batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

router.post('/save-ratings', async (req, res) => {
  const { batchId, email, techSkill, softSkill, culturalFit, analyticalSkill, note } = req.body;

  try {
    // Find the batch with the given batchId
    console.log("ASRTGVH");
    let batch = await InterviewBatch.findOne({ batchId });

    if (!batch) {
      return res.status(404).send({ error: 'Batch not found' });
    }

    // Find the candidate with the given email
    let candidate = batch.candidates.find(candidate => candidate.email === email);

    if (!candidate) {
      return res.status(404).send({ error: 'Candidate not found' });
    }

    // Update the interviewScore for the found candidate
    candidate.interviewScore = {
      techSkill,
      softSkill,
      culturalFit,
      analyticalSkill,
      note
    };  

    // Save the updated batch document
    await batch.save();

    console.log("QWERTY");  
    res.status(200).send({ message: 'Ratings saved successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
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

        const filtered = interviewees[intervieweeIndex];
        delete filtered.interviewScore;
        delete filtered.testScore;
        schedule[day].push(filtered);

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