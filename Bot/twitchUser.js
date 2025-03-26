async function getTwitchUserId(username, oauthToken, clientId) {
  try {
    const res = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
      headers: {
        'Authorization': `Bearer ${oauthToken.replace('oauth:', '')}`,
        'Client-Id': clientId
      }
    });

    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      throw new Error(`User not found: ${username}`);
    }

    return data.data[0].id;
  } catch (err) {
    console.error('[Twitch User ID Error]', err);
    return null;
  }
}

module.exports = { getTwitchUserId };
