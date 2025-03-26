require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const botData = require('../Bot/botData');
const { userPoints } = require('../Bot/botData');
require('../Bot/bot');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/leaderboard', (req, res) => {
  const sorted = Object.entries(userPoints)
    .sort((a, b) => b[1] - a[1])
    .map(([user, points]) => ({ user, points }));

  res.json(sorted);
});


app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});
