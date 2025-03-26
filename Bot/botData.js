const userPoints = {};  // { username: totalPoints }
const currentQuest = {
  emote: null,
  reward: 0,
  maxWinners: 0,
  winners: new Set(),
  isActive: false,
  timer: null
};

module.exports = {
  userPoints,
  currentQuest
};
