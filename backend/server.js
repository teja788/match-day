require('dotenv').config();
const express = require('express');
const cors = require('cors');
const scoresRouter = require('./routes/scores');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://matchday.vercel.app',
    'https://matchday.live',
  ],
}));

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Score routes
app.use('/api/scores', scoresRouter);

app.listen(PORT, () => {
  console.log(`MatchDay backend running on port ${PORT}`);
});
