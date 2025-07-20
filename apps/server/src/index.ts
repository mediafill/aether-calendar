import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './api/auth';
import { eventsRouter } from './api/events';
import { chatRouter } from './api/chat';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/chat', chatRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});