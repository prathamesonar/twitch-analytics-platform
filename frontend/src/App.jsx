import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import api from './lib/api';

// Page Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GameTrends from './pages/GameTrends';
import Tournaments from './pages/Tournaments';
import Drops from './pages/Drops';
// --- NEW ALERT COMPONENTS ---
import { useGlobalWebSocket } from './hooks/useGlobalWebSocket';
import AlertToast from './components/common/AlertToast';

// Icons
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>;


function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // --- NEW: Listen for global alerts ---
  const { alerts, dismissAlert } = useGlobalWebSocket();

  // --- Theme Management ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // --- Auth Management ---
  useEffect(() => {
    // Check if user is logged in on app load
    const checkUser = async () => {
      try {
        const { data } = await api.get('/api/me');
        setUser(data);
      } catch (error) {
        console.log('Not authenticated');
        setUser(null);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-xl text-gray-900 dark:text-white">Loading...</p>
      </div>
    );
  }

  return (
    // --- UPDATED to add relative positioning ---
    <div className="relative flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      
      {/* Navbar */}
      <nav className="w-full bg-gray-100 dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            Twitch Monitor
          </h1>
          
          {/* --- UPDATED NAVIGATION LINKS --- */}
          {user && (
            <div className="flex items-center gap-4 text-lg">
              <Link to="/" className="font-semibold hover:text-purple-600 dark:hover:text-purple-400">
                Dashboard
              </Link>
              <Link to="/games" className="font-semibold hover:text-purple-600 dark:hover:text-purple-400">
                Game Trends
              </Link>
              <Link to="/tournaments" className="font-semibold hover:text-purple-600 dark:hover:text-purple-400">
                Tournaments
              </Link>
              <Link to="/drops" className="font-semibold hover:text-purple-600 dark:hover:text-purple-400">
                Drops
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-grow p-4 md:p-8">
        <Routes>
          <Route 
            path="/" 
            element={user ? <Dashboard user={user} /> : <Login />} 
          />
          <Route 
            path="/login" 
            element={<Login />} 
          />
          <Route 
            path="/games" 
            element={user ? <GameTrends /> : <Login />} 
          />
          {/* --- NEW ROUTES --- */}
          <Route 
            path="/tournaments" 
            element={user ? <Tournaments /> : <Login />} 
          />
          <Route 
            path="/drops" 
            element={user ? <Drops /> : <Login />} 
          />
        </Routes>
      </main>

      {/* --- NEW: Render the Alert Toasts --- */}
      <AlertToast alerts={alerts} onDismiss={dismissAlert} />
    </div>
  );
}

export default App;