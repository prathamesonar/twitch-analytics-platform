import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for OnRender
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// This function will run on server start
export const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    
    // 1. Create 'users' table
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        twitch_id VARCHAR(255) UNIQUE NOT NULL,
        login VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        email VARCHAR(255),
        profile_image_url TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await client.query(createUsersTableQuery);
    console.log('Table "users" is ready');

    // 2. Create 'tracked_channels' table
    const createChannelsTableQuery = `
      CREATE TABLE IF NOT EXISTS tracked_channels (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        channel_twitch_id VARCHAR(255) NOT NULL,
        channel_login VARCHAR(255) NOT NULL,
        channel_display_name VARCHAR(255),
        channel_profile_image_url TEXT,
        added_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, channel_twitch_id)
      );
    `;
    await client.query(createChannelsTableQuery);
    console.log('Table "tracked_channels" is ready');

    // 3. Create 'community_events' table
    const createEventsTableQuery = `
      CREATE TABLE IF NOT EXISTS community_events (
        id SERIAL PRIMARY KEY,
        channel_login VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL, -- 'raid', 'host', 'subscription', 'cheer'
        username VARCHAR(255), -- The user who did the action
        viewer_count INT, -- For raids/hosts
        message TEXT, -- For subs
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await client.query(createEventsTableQuery);
    console.log('Table "community_events" is ready');
    
    // 4. Create 'stream_metrics' table
    const createMetricsTableQuery = `
      CREATE TABLE IF NOT EXISTS stream_metrics (
        id SERIAL PRIMARY KEY,
        channel_login VARCHAR(255) NOT NULL,
        viewer_count INT NOT NULL,
        game_id VARCHAR(255),
        game_name TEXT,
        title TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      -- Create an index for faster queries
      CREATE INDEX IF NOT EXISTS idx_stream_metrics_channel_time 
      ON stream_metrics (channel_login, created_at DESC);
    `;
    await client.query(createMetricsTableQuery);
    console.log('Table "stream_metrics" is ready');

    // --- 5. NEW TABLE ---
    const createGameMetricsTableQuery = `
      CREATE TABLE IF NOT EXISTS game_metrics (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(255) NOT NULL,
        game_name TEXT NOT NULL,
        viewer_count INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      -- Create an index for faster queries
      CREATE INDEX IF NOT EXISTS idx_game_metrics_game_time 
      ON game_metrics (game_id, created_at DESC);
    `;
    await client.query(createGameMetricsTableQuery);
    console.log('Table "game_metrics" is ready');
    // --- END NEW TABLE ---

    client.release();
  } catch (err) {
    console.error('Error initializing database', err.stack);
  }
};

export default pool;