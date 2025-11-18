# Twitch Gaming Trend Monitor

This project is a gaming-focused trend analysis platform for Twitch. It tracks live streaming trends, game popularity, and viewer behavior patterns by collecting and analyzing real-time data from the official Twitch API.
This platform was built to satisfy the requirements of a project assignment, testing the ability to analyze live streaming data and gaming communities.


---

##  Screenshots


| Home Page                                    | Dashboard                                    |
| ---------------------------------------------------- | ------------------------------------------------------ |
| ![Home Page](https://github.com/user-attachments/assets/4903bad5-3bc8-429c-8be7-a61c964c4b80) | ![dashboard Page](https://github.com/user-attachments/assets/16b838ff-2e98-4aa2-803b-873dc06c524c) |

| Game Category and analysis                                      | Live tournaments                                      |
| ------------------------------------------------- | ------------------------------------------------------ |
| ![category Page](https://github.com/user-attachments/assets/dd199136-087a-4dde-a49b-841f64adbd24) | ![tournaments](https://github.com/user-attachments/assets/9b0c8c80-b160-475f-949c-f502bf4b6573) |

---

## 📂 File Structure

The project is organized into two main parts: a React frontend and a Node.js backend.

```plaintext
twitch-monitor/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── twitch.js           // Logic for official Twitch API calls (Clips, Tournaments, etc.)
│   │   ├── config/
│   │   │   ├── db.js               // PostgreSQL connection and table initialization
│   │   │   └── redis.js            // Redis client connection
│   │   ├── middleware/
│   │   │   └── auth.js             // Checks if a user is authenticated
│   │   ├── routes/
│   │   │   ├── auth.js             // Handles Twitch OAuth login/logout routes
│   │   │   └── api.js              // All data routes for the application
│   │   ├── services/
│   │   │   ├── analytics.js        // (Placeholder for custom analytics)
│   │   │   ├── chat.js             // TMI.js client for live chat, sentiment, and events
│   │   │   ├── metrics.js          // Background "poller" to collect historical data
│   │   │   └── websocket.js        // WebSocket server logic for live data
│   │   └── server.js               // Main Node.js/Express server
│   ├── .env.example                // Environment variable template
│   ├── .gitignore
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── analytics/          // All 10+ analytics widgets (Charts, Lists, etc.)
    │   │   ├── common/             // Reusable components (Alerts)
    │   │   └── layout/             // (Placeholder for Navbar/Sidebar)
    │   ├── hooks/
    │   │   ├── useGlobalWebSocket.js // Listens for global alerts (e.g., game trends)
    │   │   └── useWebSocket.js       // Manages per-channel live data connection
    │   ├── lib/
    │   │   └── api.js              // Axios client for backend API
    │   ├── pages/
    │   │   ├── Dashboard.jsx       // Main dashboard, holds all analytics
    │   │   ├── GameTrends.jsx      // Page for Top Games and Category Growth
    │   │   ├── Login.jsx           // Landing/Login page
    │   │   └── Tournaments.jsx     // Page for live tournaments
    │   ├── styles/
    │   │   └── index.css           // Main Tailwind CSS file
    │   ├── App.jsx                 // Main React app, handles routing and layout
    │   └── main.jsx                // React entry point
    ├── .env.local                  // Environment variable for WebSocket URL
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    └── tailwind.config.js
```

-----

##  Features

#### 🌟 Streamer Dashboard

  * **Twitch OAuth Authentication:** Full login/logout flow using Passport.js.
  * **Multi-channel Tracking:** Users can add, view, and remove channels from their dashboard.
  * **Stream Schedule Optimizer:** A bar chart analyzes 30 days of data to find the best time to stream.
  * **Viewer Retention Analysis:** A line chart displays viewer counts over the last 24 hours.

#### 📈 Game Trend Analysis

  * **Top Games Tracking:** A live-updating list of the Top 20 games on Twitch, (using the official API, not RapidAPI).
  * **Category Growth Detection:** A line chart shows viewership trends for the top 5 games over 3 days.
  * **Viewer Migration Patterns:** A widget shows when a streamer switches games and the viewer gain/loss.
  * **New Game Trend Alerts:** A real-time toast alert pops up when a game shows \>3x growth.

#### 📊 Community Insights

  * **Chat Sentiment Analysis:** A live-updating widget shows the average sentiment score and a live chat feed.
  * **Emote Usage Trends:** A widget shows the most-used emotes in real-time.
  * **Raid/Host Networks:** The "Live Community Events" widget tracks all incoming raids and hosts.
  * **Subscriber Patterns:** The "Live Community Events" widget also tracks new subs, resubs, gift subs, and bit cheers.

####  Performance Metrics

  * **Title/Thumbnail Testing:** A widget ranks the streamer's recent stream titles by average viewers.
  * **Category Optimization:** A widget ranks the streamer's most-played games by average viewers.
  * **Growth Projections:** A "Growth Stats" widget compares 7-day vs. 30-day average viewer data.
  * **Stream Quality Impact:** (Not Feasible) The official Twitch API does not provide data on bitrate or dropped frames.

###  Bonus Features 

  * **Tournament Tracker:** A dedicated page that shows all live streams currently tagged as a "Tournament."
  * **Clip Virality Prediction:** Implemented as a **"Top Clips Tracker"** on the dashboard, showing a channel's top 5 clips.
 

-----

## 🛠️ Technical Specifications

This project uses the exact tech stack specified in the requirements.

| Component | Technology | File(s) |
| :--- | :--- | :--- |
| **Frontend** | **React 19 (Vite)**, Tailwind CSS | `frontend/` |
| **Backend** | **Node.js (ESM)**, Express | `backend/` |
| **Real-time** | **WebSocket (`ws`)**, `tmi.js` | `backend/src/services/websocket.js`, `backend/src/services/chat.js` |
| **Database** | **PostgreSQL (OnRender)** | `backend/src/config/db.js` |
| **Cache** | **Redis (OnRender)** | `backend/src/config/redis.js` |
| **Analytics** | **Custom SQL Queries**, `Chart.js` | `backend/src/routes/api.js`, `frontend/src/components/analytics/` |
| **Auth** | **Passport.js** (Twitch Strategy) | `backend/src/routes/auth.js` |

-----

## 📖 API Integration & Setup 

To run this project, you must set up API keys in the backend's `.env` file.

**File:** `backend/.env` 

```plaintext
# Server Config
PORT=8080
FRONTEND_URL=http://localhost:5173

# OnRender PostgreSQL Connection String
# Get this from your OnRender dashboard
DATABASE_URL=...

# Redis Config (OnRender)
# Get this from your OnRender Redis dashboard
REDIS_URL=...

# Twitch Application Credentials
# Get these from https://dev.twitch.tv/console
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...

# IMPORTANT: Must match your Twitch app dashboard
# For local dev:
TWITCH_CALLBACK_URL=http://localhost:8080/auth/twitch/callback

# Session Secret (create a long, random password)
SESSION_SECRET=...
```

### Twitch Developer Setup

1.  Go to the [Twitch Developer Console](https://dev.twitch.tv/console).
2.  Create a new application.
3.  Set the **Name** to "Twitch Monitor" (or any unique name without "Twitch").
4.  Set the **Client Type** to `Confidential`.
5.  Add an **OAuth Redirect URL**: `http://localhost:8080/auth/twitch/callback`
6.  Click **"Manage"** and copy the `Client ID` and `Client Secret` into your `.env` file.

-----

##  Local Installation & Setup

You will need two separate terminals to run this project.

### Terminal 1: Run the Backend

1.  Navigate to the backend folder: `cd backend`
2.  Install all dependencies: `npm install`
3.  Create the `backend/.env` file and add your API keys (see above).
4.  Start the server: `npm run dev`
      * The server will start on `http://localhost:8080`.
      * You will see logs confirming connection to PostgreSQL, Redis, and TMI.js.

### Terminal 2: Run the Frontend

1.  Navigate to the frontend folder: `cd frontend`
2.  Install all dependencies: `npm install`
3.  (Optional) Create a `frontend/.env.local` file and add `VITE_WS_URL=ws://localhost:8080`.
4.  Start the client: `npm run dev`
5.  Open your browser to `http://localhost:5173`.
