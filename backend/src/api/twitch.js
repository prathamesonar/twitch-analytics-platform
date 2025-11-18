import axios from 'axios';
import dotenv from 'dotenv';
import redisClient from '../config/redis.js';

dotenv.config();

// --- RESILIENT getAppAccessToken ---
const getAppAccessToken = async () => {
  const cacheKey = 'twitch-app-access-token';
  let token = null;
  try {
    token = await redisClient.get(cacheKey);
    if (token) return token;
  } catch (err) {
    console.warn('Redis failed to GET app token. Fetching new one.', err.message);
  }
  try {
    console.log('Fetching new App Token from Twitch');
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });
    const { access_token, expires_in } = response.data;
    try {
      await redisClient.set(cacheKey, access_token, { EX: expires_in - 300 });
    } catch (err) {
      console.warn('Redis failed to SET app token.', err.message);
    }
    return access_token;
  } catch (err) {
    console.error('CRITICAL: Error getting App Access Token', err.response?.data || err.message);
  }
};

// --- Twitch API Client (for Server-to-Server) ---
// We add 'export' so other services (like metrics.js) can use this
export const twitchApiClient = axios.create({
  baseURL: 'https://api.twitch.tv/helix'
});
twitchApiClient.interceptors.request.use(async (config) => {
  const token = await getAppAccessToken();
  config.headers['Client-ID'] = process.env.TWITCH_CLIENT_ID;
  config.headers['Authorization'] = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));


// --- RESILIENT getTopGames ---
export const getTopGames = async () => {
  const cacheKey = 'top-games';
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Serving top-games from cache');
      return JSON.parse(cachedData);
    }
  } catch (err) {
    console.warn('Redis failed to GET top games. Fetching new ones.', err.message);
  }
  try {
    console.log('Fetching top-games from OFFICIAL Twitch API');
    const response = await twitchApiClient.get('/games/top', {
      params: { first: '20' }
    });
    const gamesArray = response.data.data || [];
    try {
      await redisClient.set(cacheKey, JSON.stringify(gamesArray), {
        EX: 900
      });
    } catch (err) {
      console.warn('Redis failed to SET top games.', err.message);
    }
    return gamesArray;
  } catch (err) {
    console.error('Error fetching top games:', err.message);
    if (err.response) console.error('Error details:', err.response.data);
    return [];
  }
};

/**
 * Searches for a Twitch channel by its login name.
 */
export const getTwitchChannelByName = async (loginName) => {
  console.log(`[DEBUG] getTwitchChannelByName started for: ${loginName}`);
  if (!loginName || typeof loginName !== 'string') {
    console.log('[DEBUG] Invalid loginName, returning null');
    return null;
  }

  try {
    const response = await twitchApiClient.get('/search/channels', {
      params: {
        query: loginName,
        first: 1
      }
    });

    console.log('[DEBUG] Twitch API /search/channels response:', JSON.stringify(response.data, null, 2));

    const cleanLoginName = loginName.toLowerCase();
    
    const exactMatch = response.data.data.find(
      (channel) => channel.broadcaster_login && channel.broadcaster_login.toLowerCase() === cleanLoginName
    );
    
    console.log('[DEBUG] Exact match found:', exactMatch);
    return exactMatch;
  } catch (err) {
    console.error('[DEBUG] Error inside getTwitchChannelByName', err.message);
    return null;
  }
};

/**
 * --- NEW FUNCTION ---
 * Fetches live stream info (like viewer count, game) for a list of channels.
 */
export const getStreamsInfo = async (channelLogins) => {
  if (!channelLogins || channelLogins.length === 0) {
    return [];
  }

  try {
    // Build query parameters for the Twitch API
    // e.g., ?user_login=shroud&user_login=ninja
    const params = new URLSearchParams();
    channelLogins.forEach(login => params.append('user_login', login));

    const response = await twitchApiClient.get('/streams', { params });
    
    return response.data.data; // Returns an array of stream objects
  
  } catch (err) {
    console.error('Error fetching stream info:', err.message);
    return [];
  }
};
// --- END NEW FUNCTION ---
export const getDropsCampaigns = async () => {
  const cacheKey = 'drops-campaigns';
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Serving Drops campaigns from cache');
      return JSON.parse(cachedData);
    }
    
    console.log('Fetching Drops campaigns from Twitch API');
    const response = await twitchApiClient.get('/drops/campaigns');
    
    await redisClient.set(cacheKey, JSON.stringify(response.data.data), {
      EX: 3600 // Cache for 1 hour
    });
    return response.data.data;
  } catch (err) {
    console.error('Error fetching Drops campaigns:', err.message);
    return [];
  }
};

/**
 * --- NEW FUNCTION 2: Tournament Tracker ---
 * We will find tournaments by searching for live streams with the "Tournament" tag.
 */
export const getTournaments = async () => {
  const cacheKey = 'tournaments';
  const TOURNAMENT_TAG_ID = '6ea6bca4-4712-4ab9-a906-e3336a9e804c'; // Official Twitch Tag ID for "Tournament"
  
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Serving tournaments from cache');
      return JSON.parse(cachedData);
    }
    
    console.log('Fetching tournaments from Twitch API');
    const response = await twitchApiClient.get('/streams', {
      params: {
        tag_id: TOURNAMENT_TAG_ID,
        first: 20 // Get the top 20 live tournaments
      }
    });
    
    await redisClient.set(cacheKey, JSON.stringify(response.data.data), {
      EX: 600 // Cache for 10 minutes
    });
    return response.data.data;
  } catch (err) {
    console.error('Error fetching tournaments:', err.message);
    return [];
  }
};

/**
 * --- NEW FUNCTION 3: Top Clips Tracker ---
 * Gets the top clips for a specific broadcaster.
 */
export const getTopClips = async (broadcasterId) => {
  if (!broadcasterId) return [];
  
  const cacheKey = `top-clips:${broadcasterId}`;
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`Serving top clips for ${broadcasterId} from cache`);
      return JSON.parse(cachedData);
    }
    
    console.log(`Fetching top clips for ${broadcasterId} from Twitch API`);
    const response = await twitchApiClient.get('/clips', {
      params: {
        broadcaster_id: broadcasterId,
        first: 5 // Get the top 5 clips
      }
    });
    
    await redisClient.set(cacheKey, JSON.stringify(response.data.data), {
      EX: 3600 // Cache for 1 hour
    });
    return response.data.data;
  } catch (err) {
    console.error('Error fetching top clips:', err.message);
    return [];
  }
};

