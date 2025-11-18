import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

// Icon for viewer gain/loss
const ArrowUpIcon = () => <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.03 9.83a.75.75 0 01-1.06-1.06l5.5-5.5a.75.75 0 011.06 0l5.5 5.5a.75.75 0 11-1.06 1.06L10.75 5.612V16.25a.75.75 0 01-.75.75z" clipRule="evenodd" /></svg>;
const ArrowDownIcon = () => <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l4.22-4.22a.75.75 0 111.06 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-5.5-5.5a.75.75 0 111.06-1.06L9.25 14.388V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>;

const ViewerChange = ({ change }) => {
  const isGain = change >= 0;
  return (
    <span className={`flex items-center font-bold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
      {isGain ? <ArrowUpIcon /> : <ArrowDownIcon />}
      {change.toLocaleString()}
    </span>
  );
};

export default function CategoryMigration({ channelLogin }) {
  const [migrations, setMigrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMigrations = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/channels/${channelLogin}/category-migration`);
        setMigrations(data || []);
      } catch (err) {
        console.error('Error fetching migration data:', err);
      }
      setLoading(false);
    };

    fetchMigrations();
  }, [channelLogin]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold mb-4">Category Migration</h3>
      <div className="space-y-3 h-64 overflow-y-auto pr-2">
        {loading ? (
          <p className="text-gray-500">Loading migration data...</p>
        ) : migrations.length === 0 ? (
          <p className="text-sm text-gray-500">
            No game-changes detected in the last 7 days.
          </p>
        ) : (
          migrations.map((event, index) => (
            <div key={index} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(event.created_at))} ago
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="font-semibold truncate">{event.prev_game_name}</p>
                <span className="mx-2">→</span>
                <p className="font-semibold truncate">{event.game_name}</p>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span>Viewer Change:</span>
                <ViewerChange change={event.viewer_count - event.prev_viewer_count} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}