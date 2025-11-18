
import express from 'express';
import pool from '../config/db.js';
import { isAuthenticated } from '../middleware/auth.js';
import { getTopGames, 
  getTwitchChannelByName, 
  getStreamsInfo,
  getDropsCampaigns,
  getTournaments,
  getTopClips } from '../api/twitch.js';
import { joinChannel, partChannel } from '../services/chat.js';

const router = express.Router();

router.get('/drops', isAuthenticated, async (req, res) => {
  try {
    const drops = await getDropsCampaigns();
    res.json(drops);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/tournaments', isAuthenticated, async (req, res) => {
  try {
    const tournaments = await getTournaments();
    res.json(tournaments);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- DEBUG LOGGER ---
router.use((req, res, next) => {
  console.log(`[DEBUG] Request received: ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[DEBUG] Request Body:`, req.body);
  }
  next();
});
// --- END DEBUG LOGGER ---


// === Auth Routes ===
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// === Game Routes ===
router.get('/top-games', async (req, res) => {
  try {
    const games = await getTopGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game data' });
  }
});

router.get('/games/trends', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH ranked_games AS (
        SELECT 
          game_id, 
          game_name, 
          SUM(viewer_count) as total_viewers
        FROM game_metrics
        WHERE created_at >= NOW() - INTERVAL '3 days'
        GROUP BY game_id, game_name
        ORDER BY total_viewers DESC
        LIMIT 5
      ),
      hourly_data AS (
        SELECT 
          game_id,
          DATE_TRUNC('hour', created_at) as hour,
          AVG(viewer_count) as avg_viewers
        FROM game_metrics
        WHERE game_id IN (SELECT game_id FROM ranked_games)
        AND created_at >= NOW() - INTERVAL '3 days'
        GROUP BY game_id, hour
      )
      SELECT 
        h.game_id,
        r.game_name,
        h.hour,
        h.avg_viewers
      FROM hourly_data h
      JOIN ranked_games r ON h.game_id = r.game_id
      ORDER BY h.hour ASC;
    `);
    
    res.json(rows);
  } catch (err) {
    console.error('[DEBUG] CRITICAL ERROR in GET /api/games/trends:', err.message);
    res.status(500).send('Server Error');
  }
});


// === CHANNEL MANAGEMENT ROUTES ===

router.get('/channels', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tracked_channels WHERE user_id = $1 ORDER BY added_at ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/channels', isAuthenticated, async (req, res) => {
  console.log('[DEBUG] /api/channels POST route handler was HIT.');
  const { channelName } = req.body;
  
  if (!channelName) {
    return res.status(400).json({ message: 'Channel name is required' });
  }

  try {
    const channel = await getTwitchChannelByName(channelName);
    
    if (!channel) {
      return res.status(404).json({ message: `Channel "${channelName}" not found on Twitch.` });
    }

    const { 
      id: channelTwitchId, 
      broadcaster_login,
      display_name, 
      thumbnail_url 
    } = channel;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO tracked_channels 
        (user_id, channel_twitch_id, channel_login, channel_display_name, channel_profile_image_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, channel_twitch_id) DO NOTHING
       RETURNING *`,
      [userId, channelTwitchId, broadcaster_login, display_name, thumbnail_url]
    );

    if (rows.length === 0) {
      return res.status(409).json({ message: `You are already tracking ${display_name}.` });
    }
    
    joinChannel(broadcaster_login);
    console.log(`[DEBUG] Successfully added ${channelName}.`);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error('[DEBUG] CRITICAL ERROR in /api/channels:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/channels/:login/metrics', isAuthenticated, async (req, res) => {
  const { login } = req.params;
  
  try {
    const { rows } = await pool.query(
      `SELECT viewer_count, game_name, title, created_at 
       FROM stream_metrics
       WHERE channel_login = $1 
       AND created_at >= NOW() - INTERVAL '24 hours'
       ORDER BY created_at ASC`,
      [login]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('[DEBUG] CRITICAL ERROR in GET /api/channels/:login/metrics:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/channels/:login/schedule-optimizer', isAuthenticated, async (req, res) => {
  const { login } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT 
         EXTRACT(ISODOW FROM created_at) as day_of_week, 
         EXTRACT(HOUR FROM created_at) as hour_of_day, 
         AVG(viewer_count)::int as avg_viewers
       FROM stream_metrics
       WHERE channel_login = $1 
       AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY day_of_week, hour_of_day
       ORDER BY day_of_week, hour_of_day`,
      [login]
    );
    res.json(rows);
  } catch (err) {
    console.error('[DEBUG] CRITICAL ERROR in GET /api/channels/:login/schedule-optimizer:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/channels/:login/category-migration', isAuthenticated, async (req, res) => {
  const { login } = req.params;
  try {
    const { rows } = await pool.query(
      `WITH game_changes AS (
         SELECT 
           game_name,
           LAG(game_name) OVER (ORDER BY created_at) as prev_game_name,
           viewer_count,
           LAG(viewer_count) OVER (ORDER BY created_at) as prev_viewer_count,
           created_at
         FROM stream_metrics
         WHERE channel_login = $1 
         AND created_at >= NOW() - INTERVAL '7 days'
       )
       SELECT * FROM game_changes
       WHERE game_name IS NOT NULL 
       AND prev_game_name IS NOT NULL 
       AND game_name != prev_game_name
       ORDER BY created_at DESC
       LIMIT 10`,
      [login]
    );
    res.json(rows);
  } catch (err) {
    console.error('[DEBUG] CRITICAL ERROR in GET /api/channels/:login/category-migration:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/channels/:login/category-optimization', isAuthenticated, async (req, res) => {
  const { login } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT 
         game_name,
         AVG(viewer_count)::int as avg_viewers,
         MAX(viewer_count) as peak_viewers,
         COUNT(*) as data_points
       FROM stream_metrics
       WHERE channel_login = $1
       AND game_name IS NOT NULL
       AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY game_name
       ORDER BY avg_viewers DESC
       LIMIT 10`,
      [login]
    );
    res.json(rows);
  } catch (err) {
    console.error('[DEBUG] CRITICAL ERROR in GET /api/channels/:login/category-optimization:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/channels/:login/title-testing', isAuthenticated, async (req, res) => {
  const { login } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT 
         title,
         AVG(viewer_count)::int as avg_viewers,
         MAX(viewer_count) as peak_viewers,
         COUNT(*) as data_points
       FROM stream_metrics
       WHERE channel_login = $1
       AND title IS NOT NULL
       AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY title
       ORDER BY avg_viewers DESC
       LIMIT 10`,
      [login]
    );
    res.json(rows);
  } catch (err) {
    console.error('[DEBUG] CRITICAL ERROR in GET /api/channels/:login/title-testing:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * --- NEW ROUTE ---
 * GET: Fetches data for the "Growth Projections" widget
 */
router.get('/channels/:login/growth-stats', isAuthenticated, async (req, res) => {
  const { login } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT 
         AVG(viewer_count) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int as avg_7_days,
         AVG(viewer_count) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int as avg_30_days,
         MAX(viewer_count) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as peak_30_days
       FROM stream_metrics
       WHERE channel_login = $1`,
      [login]
    );
    res.json(rows[0]); // Send the single row of data
  } catch (err) {
    console.error('[DEBUG] CRITICAL ERROR in GET /api/channels/:login/growth-stats:', err.message);
    res.status(500).send('Server Error');
  }
});


/**
 * DELETE: Stop tracking a channel
 */
router.delete('/channels/:channel_id', isAuthenticated, async (req, res) => {
  console.log('[DEBUG] /api/channels/:channel_id DELETE route handler was HIT.');
  try {
    const { channel_id } = req.params;
    const userId = req.user.id;
    const { rows } = await pool.query(
      'SELECT channel_login FROM tracked_channels WHERE id = $1 AND user_id = $2',
      [channel_id, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Channel not found or you do not have permission.' });
    }
    const channelLogin = rows[0].channel_login;
    await pool.query(
      'DELETE FROM tracked_channels WHERE id = $1 AND user_id = $2',
      [channel_id, userId]
    );
    partChannel(channelLogin);
    console.log(`[DEBUG] Successfully deleted channel ${channelLogin}.`);
    res.status(200).json({ message: 'Channel unfollowed successfully.' });
  } catch (err) {
    console.error('[DEBUG] CRITICAL ERROR in DELETE /api/channels:', err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/channels/:id/clips', isAuthenticated, async (req, res) => {
  const { id } = req.params; // Using channel ID (e.g., 37402112 for shroud)
  try {
    const clips = await getTopClips(id);
    res.json(clips);
  } catch (err) {
    console.error('[DEBUG] CRITICAL ERROR in GET /api/channels/:id/clips:', err.message);
    res.status(500).send('Server Error');
  }
});

export default router;