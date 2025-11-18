import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

// --- IMPORT ALL OUR MODULES ---
import { initWebSocketServer } from './services/websocket.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { initDb } from './config/db.js';
import pool from './config/db.js';
import redisClient from './config/redis.js';
import { connectChatClient } from './services/chat.js';
import { startMetricsPoller } from './services/metrics.js'; // <-- IMPORT NEW SERVICE

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json()); // <-- Body parser for POST requests

// --- NEW DEBUGGER ---
// This will log EVERY request that hits your backend
app.use((req, res, next) => {
  console.log(`[DEBUG] Request received: ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[DEBUG] Request Body:`, req.body);
  }
  next();
});
// --- END DEBUGGER ---

// --- Session Store (Postgres) ---
const PgStore = connectPgSimple(session);
// ... (rest of session store code)
app.use(session({
  store: new PgStore({ pool: pool, tableName: 'user_sessions', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// --- Passport Middleware ---
app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---
app.use('/auth', authRoutes);
app.use('/api', apiRoutes); // <-- This registers all /api routes

// Health check
app.get('/', (req, res) => {
  res.send('Twitch Monitor Backend is running!');
});

// --- Server & WebSocket Setup ---
const server = http.createServer(app);
initWebSocketServer(server);

// --- Start Server ---
const startServer = async () => {
  await initDb();
  await connectChatClient();
  startMetricsPoller(); // <-- START OUR NEW POLLER
  
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
};

startServer().catch(console.error);