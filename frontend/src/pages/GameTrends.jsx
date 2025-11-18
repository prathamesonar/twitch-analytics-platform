import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import CategoryGrowthChart from '../components/analytics/CategoryGrowthChart';

// Helper function to format Twitch image URLs
const getTwitchImageUrl = (url, width, height) => {
  if (!url) return 'https://via.placeholder.com/285x380';
  return url
    .replace('{width}', width)
    .replace('{height}', height);
};

export default function GameTrends() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data } = await api.get('/api/top-games');
        
        if (isMounted) {
          if (Array.isArray(data)) {
            setGames(data);
          } else {
            console.warn('Unexpected API response structure, expected array:', data);
            setGames([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching games', err);
          setError('Failed to load game trends. The API might be down.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGames();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container mx-auto space-y-8">
      
      {/* --- Category Growth Chart --- */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-8">Game Category Trends</h2>
        <CategoryGrowthChart />
      </div>

      {/* --- Top 20 Live Games --- */}
      <div>
        <h2 className="text-4xl font-bold mb-8">Top 20 Live Games</h2>
        {loading ? (
          <div className="text-center text-xl">Loading Top Games...</div>
        ) : error ? (
          <div className="text-center text-xl text-red-500">{error}</div>
        ) : !games || games.length === 0 ? (
          <div className="text-center text-xl">No top games found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              // --- THIS IS THE FIX ---
              // Wrap the card in an <a> tag
              <a 
                key={game.id}
                // We URL-encode the game name to make it a valid link
                href={`https://www.twitch.tv/directory/category/${encodeURIComponent(game.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105"
              >
                <img 
                  src={getTwitchImageUrl(game.box_art_url, '285', '380')} 
                  alt={game.name}
                  className="w-full h-[380px] object-cover"
                />
                <div className="p-4">
                  <h3 className="text-2xl font-bold truncate text-gray-900 dark:text-white">{game.name}</h3>
                </div>
              </a>
              // --- END FIX ---
            ))}
          </div>
        )}
      </div>
    </div>
  );
}