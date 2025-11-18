import pool from '../config/db.js';
import { getStreamsInfo, twitchApiClient } from '../api/twitch.js';
import { broadcast } from './websocket.js'; // <-- IMPORT GLOBAL BROADCAST

// How often to poll for new data (in milliseconds)
// 5 minutes = 5 * 60 * 1000 = 300,000ms
const POLL_INTERVAL = 300000; 

/**
 * Polls viewer counts for *specific tracked channels*
 */
const pollStreamData = async () => {
  console.log('[MetricsPoller] Polling tracked stream data...');
  try {
    // 1. Get all unique channels tracked by *all* users
    const { rows } = await pool.query(
      `SELECT DISTINCT channel_login FROM tracked_channels`
    );

    const channelLogins = rows.map(r => r.channel_login);
    if (channelLogins.length === 0) {
      console.log('[MetricsPoller] No channels tracked. Skipping stream poll.');
      return;
    }

    // 2. Get live stream info from Twitch
    const liveStreams = await getStreamsInfo(channelLogins);
    
    // 3. Prepare a database query to log the data
    const insertQuery = `
      INSERT INTO stream_metrics (channel_login, viewer_count, game_id, game_name, title)
      VALUES ($1, $2, $3, $4, $5)
    `;

    // 4. Loop over the live streams and save them
    let streamsLogged = 0;
    for (const stream of liveStreams) {
      const { user_login, viewer_count, game_id, game_name, title } = stream;
      await pool.query(insertQuery, [
        user_login, 
        viewer_count, 
        game_id, 
        game_name, 
        title
      ]);
      streamsLogged++;
    }

    console.log(`[MetricsPoller] Logged data for ${streamsLogged} live channels.`);

  } catch (err) {
    console.error('[MetricsPoller] Error during stream polling:', err);
  }
};

/**
 * Polls viewer counts for *top games*
 */
const pollGameData = async () => {
  console.log('[MetricsPoller] Polling top game data...');
  try {
    // 1. Fetch top 100 live streams from Twitch (the max per request)
    // We do this to calculate total viewers per game
    const { data } = await twitchApiClient.get('/streams', { params: { first: 100 } });
    const liveStreams = data.data || [];

    // 2. Aggregate viewer counts by game
    const gameViewers = {};
    liveStreams.forEach(stream => {
      if (stream.game_id && stream.game_name) {
        if (!gameViewers[stream.game_id]) {
          gameViewers[stream.game_id] = {
            game_name: stream.game_name,
            viewer_count: 0
          };
        }
        gameViewers[stream.game_id].viewer_count += stream.viewer_count;
      }
    });

    // 3. Save to database
    const insertQuery = `
      INSERT INTO game_metrics (game_id, game_name, viewer_count)
      VALUES ($1, $2, $3)
    `;
    
    let gamesLogged = 0;
    for (const gameId in gameViewers) {
      const game = gameViewers[gameId];
      await pool.query(insertQuery, [gameId, game.game_name, game.viewer_count]);
      gamesLogged++;
    }
    console.log(`[MetricsPoller] Logged data for ${gamesLogged} games.`);
    
  } catch (err) {
    console.error('[MetricsPoller] Error during game polling:', err);
  }
};

/**
 * --- NEW FUNCTION ---
 * Analyzes game metrics to find new trends and sends alerts
 */
const analyzeGameTrends = async () => {
  console.log('[MetricsPoller] Analyzing game trends...');
  try {
    // Find games that are popular now AND have grown > 3x in 24h
    const { rows } = await pool.query(`
      WITH
        CurrentTrends AS (
          SELECT game_id, game_name, AVG(viewer_count) as current_avg
          FROM game_metrics
          WHERE created_at >= NOW() - INTERVAL '1 hour'
          GROUP BY game_id, game_name
        ),
        PastTrends AS (
          SELECT game_id, AVG(viewer_count) as past_avg
          FROM game_metrics
          WHERE created_at BETWEEN (NOW() - INTERVAL '25 hours') AND (NOW() - INTERVAL '23 hours')
          GROUP BY game_id
        )
      SELECT 
        c.game_name, 
        c.current_avg::int, 
        COALESCE(p.past_avg, 1)::int as past_avg
      FROM CurrentTrends c
      LEFT JOIN PastTrends p ON c.game_id = p.game_id
      WHERE 
        c.current_avg > 10000 -- Only alert for games with > 10k viewers
        AND c.current_avg > COALESCE(p.past_avg, 1) * 3; -- And 3x growth
    `);

    if (rows.length > 0) {
      console.log(`[MetricsPoller] FOUND ${rows.length} NEW GAME TRENDS!`);
      // Send an alert for each trend
      for (const trend of rows) {
        broadcast({
          type: 'game-trend-alert',
          data: trend
        });
      }
    }

  } catch (err) {
    console.error('[MetricsPoller] Error during game trend analysis:', err);
  }
};

/**
 * Starts the poller.
 */
export const startMetricsPoller = () => {
  console.log(`[MetricsPoller] Starting poller, will run every ${POLL_INTERVAL / 1000} seconds.`);
  
  // Run all pollers immediately
  pollStreamData();
  pollGameData();
  analyzeGameTrends();
  
  // Then run them on an interval
  setInterval(() => {
    pollStreamData();
    pollGameData();
    analyzeGameTrends(); // <-- Add trend analysis to the interval
  }, POLL_INTERVAL);
};