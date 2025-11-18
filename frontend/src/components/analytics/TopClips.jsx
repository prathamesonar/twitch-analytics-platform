import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function TopClips({ channelId }) {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId) return;
    
    const fetchClips = async () => {
      try {
        setLoading(true);
        // Note: The API route uses the channel's Twitch ID, not login name
        const { data } = await api.get(`/api/channels/${channelId}/clips`);
        setClips(data || []);
      } catch (err) {
        console.error('Error fetching clips:', err);
      }
      setLoading(false);
    };

    fetchClips();
  }, [channelId]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-full col-span-1 lg:col-span-3">
      <h3 className="text-xl font-bold mb-4">Top 5 Clips (Foundation for Virality)</h3>
      {loading ? (
        <p className="text-gray-500">Loading top clips...</p>
      ) : clips.length === 0 ? (
        <p className="text-sm text-gray-500">No clips found for this channel.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {clips.map(clip => (
            <a 
              key={clip.id} 
              href={clip.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden shadow">
                <img 
                  src={clip.thumbnail_url} 
                  alt={clip.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 p-2 w-full">
                  <p className="text-white text-xs font-bold truncate">{clip.title}</p>
                  <p className="text-gray-300 text-xs">
                    {clip.view_count.toLocaleString()} views • {formatDistanceToNow(new Date(clip.created_at))} ago
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}