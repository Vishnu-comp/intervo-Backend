import express from 'express';
import jwt from 'jsonwebtoken';
import InterviewBatch from '../models/InterviewBatch.js';

const router = express.Router();

router.post('/getAuthKey', (req, res) => {
  try {
    const API_KEY = '76b0317a-7d29-4823-8694-351b513fb296';
    const SECRET = '24c366883381e5d923d60d24689057102e826bb14ed742f69f0a95d8a5acb1df';

    const options = {
      expiresIn: '120m',
      algorithm: 'HS256'
    };
    const payload = {
      apikey: API_KEY,
      permissions: [`allow_join`], // `ask_join` || `allow_mod`
      // version: 2, //OPTIONAL
      // roomId: `2kyv-gzay-64pg`, //OPTIONAL
      // participantId: `lxvdplwt`, //OPTIONAL
      // roles: ['crawler', 'rtc'], //OPTIONAL
    };

    const token = jwt.sign(payload, SECRET, options);
    console.log(token);
    res.status(201).send(token);

  } catch (error) {
    console.log(error);
  }
});

router.post('/getMeetingId', async (req, res) => {
  const {batchId, email} = req.body;
  // console.log("");
  try {
    const batch = await InterviewBatch.findOne({ batchId });
    if (batch.meetingId !== null && batch.meetingId !== "") 
      res.status(200).json({ meetingId: batch.meetingId });
    else 
      res.status(200).json({ message: 'MeetingId not set' });

  } catch (error) {
    console.log(error);
  }
});

router.post('/setMeetingId', async (req, res) => {
  const {batchId, meetingId} = req.body;

  try {
    const batch = await InterviewBatch.findOne({ batchId });
    batch.meetingId = meetingId;
    await batch.save();
    res.status(201).json({ message: 'MeetingId set' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
