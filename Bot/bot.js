require('dotenv').config();
const tmi = require('tmi.js');
const { userPoints, currentQuest } = require('./botData');
const { getTwitchUserId } = require('./twitchUser');
const { get7TVEmotesForChannel } = require('./emoteLoader');

const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH
  },
  channels: [process.env.TWITCH_CHANNEL]
});

//quest code
function getMaxWinners(){
    return Math.floor(Math.random() * 15) + 1; // 1–15
}

function getScaledRewardPoints(maxWinners) {
    const minReward = 100;
    const maxReward = 6000;
    const maxPossibleWinners = 15;
  
    // Calculate scaling factor
    const scale = (maxPossibleWinners - maxWinners) / (maxPossibleWinners - 1);
    const scaledReward = Math.round(scale * (maxReward - minReward) + minReward);
  
    // Round to nearest 100
    return Math.round(scaledReward / 100) * 100;
  }
  
function postRandomQuest(client, channel) {
    const randomEmote = dynamicQuestEmotes[Math.floor(Math.random() * dynamicQuestEmotes.length)];
    const maxWinners = getMaxWinners();
    const randomExp = getScaledRewardPoints(maxWinners);

    Object.assign(currentQuest, {
        emote: randomEmote,
        reward: randomExp,
        maxWinners,
        winners: new Set(),
        isActive: true,
        timer: null
      });      

    const quest = `⚔️ QUEST: First ${maxWinners} chatters to type ${randomEmote} claim ${randomExp} points!`;
    client.say(channel, quest);
    console.log(`[QUEST] ${quest}`);

    // Set the quest timer based on max winners
    const durationInSeconds = maxWinners * 3;
    console.log(`[QUEST TIMER SET] Will expire in ${durationInSeconds}s`);
    currentQuest.timer = setTimeout(() => {
    if (currentQuest.isActive) {
        currentQuest.isActive = false;
        client.say(channel, `⌛ QUEST EXPIRED. Not enough chatters stepped up.`);
        console.log('[QUEST EXPIRED]', currentQuest);
     }
    }, durationInSeconds * 1000);
}
  
function scheduleNextQuest(client, channel) {
    const delay = Math.floor(Math.random() * (7 - 3 + 1) + 3) * 60 * 1000; // random 3–7 min
    console.log(delay);

    setTimeout(() => {
        postRandomQuest(client, channel);
        scheduleNextQuest(client, channel); // schedule the next one
    }, delay);
  }

//client connect code aka code that connects to a twitch chat
client.connect();
  
client.on('connected', () => {
    console.log(`✅ Connected to #${process.env.TWITCH_CHANNEL}`);

    (async () => {
    const twitchUsername = process.env.TWITCH_CHANNEL;

    const twitchUserId = await getTwitchUserId(
        twitchUsername,
        process.env.TWITCH_OAUTH,
        process.env.TWITCH_CLIENT_ID
    );

    if (!twitchUserId) {
      console.error('❌ Could not fetch Twitch user ID. Aborting quest setup.');
      return;
    }

    dynamicQuestEmotes = await get7TVEmotesForChannel(twitchUserId);
    console.log('[7TV Emotes Loaded]', dynamicQuestEmotes);

    //start quest loop
    scheduleNextQuest(client, process.env.TWITCH_CHANNEL);
    })();
});
  
client.on('message', (channel, tags, message, self) => {
    if (self) return;

    const username = tags['display-name'] || tags.username;

    // Check if quest is active
    if (currentQuest?.isActive && message.includes(currentQuest.emote)) {
        if (!currentQuest.winners.has(username)) {
        currentQuest.winners.add(username);

        userPoints[username] = (userPoints[username] || 0) + currentQuest.reward;

        client.say(channel, `🎉 ${username} earned ${currentQuest.reward} points! (${currentQuest.winners.size}/${currentQuest.maxWinners})`);

        // If quest is now complete
        if (currentQuest.winners.size >= currentQuest.maxWinners) {
            currentQuest.isActive = false;
            clearTimeout(currentQuest.timer);
            client.say(channel, `✅ QUEST COMPLETE!`);
            console.log('[QUEST COMPLETE]', currentQuest);
        }
      }
    }
  });
  