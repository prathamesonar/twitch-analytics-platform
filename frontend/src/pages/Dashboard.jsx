import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import ChatSentiment from '../components/analytics/ChatSentiment';
import EmoteTracker from '../components/analytics/EmoteTracker';
import CommunityEvents from '../components/analytics/CommunityEvents';
import { useWebSocket } from '../hooks/useWebSocket';
import ViewerRetentionChart from '../components/analytics/ViewerRetentionChart';
import ScheduleOptimizer from '../components/analytics/ScheduleOptimizer';
import CategoryMigration from '../components/analytics/CategoryMigration';
import CategoryOptimizer from '../components/analytics/CategoryOptimizer';
import TitleTester from '../components/analytics/TitleTester';
import GrowthStats from '../components/analytics/GrowthStats';
import TopClips from '../components/analytics/TopClips';

// Simple X-icon
const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- ChannelAnalytics sub-component ---
// This component is unchanged. It just displays analytics for the channel it's given.
function ChannelAnalytics({ channel }) {
  const { 
    sentimentMessages, 
    emoteCounts, 
    communityEvents, 
    isConnected 
  } = useWebSocket(channel.channel_login);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-inner">
      <h3 className="text-2xl font-bold mb-4 capitalize">{channel.channel_display_name}</h3>
      
      {/* Growth Stats */}
      <div className="mb-6">
        <GrowthStats channelLogin={channel.channel_login} />
      </div>

      {/* Top row for live widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChatSentiment 
          sentimentMessages={sentimentMessages} 
          isConnected={isConnected} 
        />
        <EmoteTracker 
          emoteCounts={emoteCounts} 
        />
        <CommunityEvents 
          events={communityEvents} 
        />
      </div>

      {/* Second row for retention chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ViewerRetentionChart 
          channelLogin={channel.channel_login} 
        />
      </div>

      {/* Third row for optimizer and migration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ScheduleOptimizer 
          channelLogin={channel.channel_login} 
        />
        <CategoryMigration 
          channelLogin={channel.channel_login} 
        />
      </div>

      {/* Fourth row for performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CategoryOptimizer 
          channelLogin={channel.channel_login} 
        />
        <TitleTester 
          channelLogin={channel.channel_login} 
        />
      </div>
      
      {/* Fifth row for Clips */}
      <div className="grid grid-cols-1">
        <TopClips 
          channelId={channel.channel_twitch_id}
        />
      </div>
    </div>
  );
}

// --- Main Dashboard Component ---
export default function Dashboard({ user }) {
  const [newChannel, setNewChannel] = useState('');
  const [trackedChannels, setTrackedChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- NEW STATE ---
  // This will store which channel we are currently viewing
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Fetch Tracked Channels on Load
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/channels');
        setTrackedChannels(data);
        
        // --- NEW ---
        // Automatically select the first channel in the list
        if (data.length > 0) {
          setSelectedChannel(data[0]);
        }
      } catch (err) {
        setError('Could not fetch tracked channels.');
      }
      setLoading(false);
    };
    fetchChannels();
  }, []);

  // Handle Add Channel
  const handleAddChannel = async (e) => {
    e.preventDefault();
    if (!newChannel) return;
    setError(null);
    try {
      const { data: addedChannel } = await api.post('/api/channels', {
        channelName: newChannel
      });
      const newChannelList = [...trackedChannels, addedChannel];
      setTrackedChannels(newChannelList);
      setSelectedChannel(addedChannel); // --- NEW: Automatically select the new channel
      setNewChannel('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add channel.');
    }
  };

  // Handle Remove Channel
  const handleRemoveChannel = async (e, channelIdToRemove) => {
    e.stopPropagation(); // --- NEW: Stop the click from selecting the channel
    try {
      await api.delete(`/api/channels/${channelIdToRemove}`);
      
      const newChannelList = trackedChannels.filter((channel) => channel.id !== channelIdToRemove);
      setTrackedChannels(newChannelList);

      // --- NEW: If we just deleted the selected channel, clear selection or pick first
      if (selectedChannel && selectedChannel.id === channelIdToRemove) {
        setSelectedChannel(newChannelList.length > 0 ? newChannelList[0] : null);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove channel.');
    }
  };

  return (
    <div className="container mx-auto space-y-8">
      
      {/* User Welcome */}
      <div className="flex items-center gap-4">
        <img 
          src={user.profile_image_url} 
          alt={user.display_name}
          className="w-20 h-20 rounded-full border-4 border-purple-500" 
        />
        <div>
          <h2 className="text-4xl font-bold">Welcome, {user.display_name}!</h2>
        </div>
      </div>
      
      {/* Channel Management */}
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold mb-4">Tracked Channels</h3>
        <form onSubmit={handleAddChannel} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            placeholder="Enter a Twitch channel name (e.g., 'shroud')"
            className="flex-grow p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Track Channel
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* --- UPDATED CHANNEL LIST --- */}
        {/* This is now a clickable list to select a channel */}
        <div className="space-y-3">
          {loading && <p>Loading channels...</p>}
          {trackedChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setSelectedChannel(channel)} // --- NEW: Click to select
              className={`flex items-center justify-between p-4 rounded-lg shadow cursor-pointer
                         ${selectedChannel?.id === channel.id 
                           ? 'bg-purple-100 dark:bg-purple-900 border-2 border-purple-500' 
                           : 'bg-white dark:bg-gray-700'
                         }`}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={channel.channel_profile_image_url} 
                  alt={channel.channel_display_name}
                  className="w-12 h-12 rounded-full"
                />
                <span className="text-lg font-semibold">{channel.channel_display_name}</span>
              </div>
              <button
                onClick={(e) => handleRemoveChannel(e, channel.id)} // --- UPDATED
                className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-gray-600 z-10"
                aria-label={`Stop tracking ${channel.channel_display_name}`}
              >
                <XIcon />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* --- UPDATED ANALYTICS SECTION --- */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Analytics</h2>
        {loading && <p>Loading analytics...</p>}
        
        {/* If no channels are tracked */}
        {trackedChannels.length === 0 && !loading && (
          <p className="text-gray-600 dark:text-gray-400">
            Add a channel above to see its analytics.
          </p>
        )}
        
        {/* If a channel is selected, show its analytics */}
        {selectedChannel && (
          <ChannelAnalytics key={selectedChannel.id} channel={selectedChannel} />
        )}
      </div>
    </div>
  );
}