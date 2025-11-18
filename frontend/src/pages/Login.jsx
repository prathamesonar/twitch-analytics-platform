import React from 'react';

// A simple Twitch icon
const TwitchIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM4.714 0 3.428 2.571v17.143h5.143V24l2.571-4.286h3.429l6.001-6V0H4.714zm15.429 13.714-3.429 3.429h-3.429l-2.571 2.571v-2.571H6.857V2.143h13.286v11.571z" />
  </svg>
);

// --- NEW: Feature Card Component ---
const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-left">
    <div className="flex items-center gap-3 mb-3">
      <span className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
        {icon}
      </span>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

// --- NEW: Icons for Feature Cards ---
const LiveIcon = () => <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const TrendIcon = () => <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const OptimizeIcon = () => <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 0a2 2 0 100-4m0 4a2 2 0 110-4m-6 0a2 2 0 100-4m0 4a2 2 0 110-4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 0a2 2 0 100-4m0 4a2 2 0 110-4" /></svg>;


export default function Login() {
  
  // This function redirects the user to our backend auth route
  const handleLogin = () => {
    // The backend will then redirect to Twitch
    window.location.href = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/auth/twitch';
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      
      {/* --- Main Login Prompt --- */}
      <h2 className="text-4xl font-bold mb-4">Welcome to Twitch Monitor</h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-lg">
        Please log in with your Twitch account to access your personalized analytics dashboard.
      </p>
      <button
        onClick={handleLogin}
        className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all"
      >
        <TwitchIcon />
        Log In with Twitch
      </button>

      {/* --- NEW: Features Section --- */}
      <div className="w-full max-w-5xl mt-24">
        <h2 className="text-3xl font-bold mb-8">All Your Analytics in One Place</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Live Data"
            description="Track chat sentiment, emote usage, raids, and subscriptions as they happen."
            icon={<LiveIcon />}
          />
          <FeatureCard 
            title="Historical Trends"
            description="Analyze viewer retention, category performance, and game trends over time."
            icon={<TrendIcon />}
          />
          <FeatureCard 
            title="Growth Tools"
            description="Optimize your stream schedule, test your titles, and track your channel growth."
            icon={<OptimizeIcon />}
          />
        </div>
      </div>
    </div>
  );
}