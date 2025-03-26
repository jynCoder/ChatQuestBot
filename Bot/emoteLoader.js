async function get7TVEmotesForChannel(twitchUserId) {
  try {
    const userRes = await fetch(`https://7tv.io/v3/users/twitch/${twitchUserId}`);
    const userData = await userRes.json();

    const emoteSetId = userData.emote_set.id;

    const emoteRes = await fetch(`https://7tv.io/v3/emote-sets/${emoteSetId}`);
    const emoteData = await emoteRes.json();

    const emoteNames = emoteData.emotes.map(e => e.name);
    return emoteNames;
  } catch (err) {
    console.error('[7TV ERROR]', err);
    return [];
  }
}

module.exports = { get7TVEmotesForChannel };
