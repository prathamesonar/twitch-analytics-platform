import express from 'express';
import passport from 'passport';
import { Strategy as TwitchStrategy } from 'passport-twitch-new';
import pool from '../config/db.js';

const router = express.Router();

// --- Passport Strategy Setup ---

/**
 * Called after a user is authenticated.
 * We save their twitch_id to the session.
 */
passport.serializeUser((user, done) => {
  // THE FIX: We must store the twitch_id, as it's our unique key
  done(null, user.twitch_id);
});

/**
 * Called on every subsequent request to get the user from the session.
 * We use the twitch_id from the session to find the user in our database.
 */
passport.deserializeUser(async (twitch_id, done) => {
  try {
    // Find the user by their twitch_id
    const { rows } = await pool.query('SELECT * FROM users WHERE twitch_id = $1', [twitch_id]);
    
    if (rows.length > 0) {
      done(null, rows[0]); // User found, return them
    } else {
      // This error means the user exists in the session but not the DB
      done(new Error('User not found during deserialization.'));
    }
  } catch (err) {
    done(err);
  }
});

/**
 * Configure the Twitch login strategy.
 * This is called when a user tries to log in.
 */
passport.use(
  new TwitchStrategy(
    {
      clientID: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      callbackURL: process.env.TWITCH_CALLBACK_URL,
      scope: 'user:read:email' // The permissions we ask for
    },
    async (accessToken, refreshToken, profile, done) => {
      // Twitch has authenticated the user, now we save them to our DB.
      const { id, login, display_name, email, profile_image_url } = profile;
      
      try {
        // "Upsert" query:
        // Try to INSERT a new user.
        // If the user (twitch_id) already exists, UPDATE them instead.
        const query = `
          INSERT INTO users (twitch_id, login, display_name, email, profile_image_url, access_token, refresh_token)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (twitch_id) DO UPDATE SET
            login = $2,
            display_name = $3,
            email = $4,
            profile_image_url = $5,
            access_token = $6,
            refresh_token = $7,
            last_login = NOW()
          RETURNING *;
        `;
        
        const values = [id, login, display_name, email, profile_image_url, accessToken, refreshToken];
        
        const { rows } = await pool.query(query, values);
        const user = rows[0];
        
        console.log(`User ${user.login} logged in or was created.`);
        return done(null, user); // Pass the user to passport

      } catch (err) {
        console.error('Error in Twitch strategy', err);
        return done(err);
      }
    }
  )
);

// --- Auth Routes ---

// 1. /auth/twitch
// The route the user visits to start the login process.
// It redirects them to Twitch.
router.get('/twitch', passport.authenticate('twitch'));

// 2. /auth/twitch/callback
// The route Twitch redirects the user back to after they log in.
// Passport handles the code exchange and runs our strategy.
router.get(
  '/twitch/callback',
  passport.authenticate('twitch', {
    // On success, redirect to the frontend dashboard
    successRedirect: process.env.FRONTEND_URL || 'http://localhost:5173/',
    // On failure, redirect back to some login/failure page
    failureRedirect: (process.env.FRONTEND_URL || 'http://localhost:5173/') + '/login?failed=true'
  })
);

// 3. /auth/logout
// The route for logging out.
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { 
      return next(err); 
    }
    // Destroy the session
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

export default router;