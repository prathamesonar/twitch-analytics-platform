import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

const getTwitchImageUrl = (url) => {
  if (!url) return '';
  return url.replace('{width}', '440').replace('{height}', '248');
};

export default function Tournaments() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/tournaments');
        setStreams(data || []);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
      }
      setLoading(false);
    };
    fetchTournaments();
  }, []);

  return (
    <div className="container mx-auto">
      <h2 className="text-4xl font-bold mb-8">Live Tournaments</h2>
      
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading live tournaments...</p>
      ) : streams.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No major tournaments are live right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            // --- THIS IS THE FIX ---
            // The <a> tag now wraps the entire card, making it all clickable
            <a 
              key={stream.id} 
              href={`https://twitch.tv/${stream.user_login}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105"
            >
              <img 
                src={getTwitchImageUrl(stream.thumbnail_url)} 
                alt={stream.title}
                className="w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold truncate text-gray-900 dark:text-white">{stream.title}</h3>
                <p className="text-purple-500 font-semibold">{stream.user_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Playing: {stream.game_name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-red-500 font-bold">{stream.viewer_count.toLocaleString()} Viewers</span>
                  <span className="text-xs text-gray-500">
                    Live for {formatDistanceToNow(new Date(stream.started_at))}
                  </span>
                </div>
              </div>
            </a>
            // --- END FIX ---
          ))}
        </div>
      )}
    </div>
  );
}