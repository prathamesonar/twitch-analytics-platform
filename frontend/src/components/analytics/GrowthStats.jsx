import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

const ArrowUpIcon = () => <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.03 9.83a.75.75 0 01-1.06-1.06l5.5-5.5a.75.75 0 011.06 0l5.5 5.5a.75.75 0 11-1.06 1.06L10.75 5.612V16.25a.75.75 0 01-.75.75z" clipRule="evenodd" /></svg>;
const ArrowDownIcon = () => <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l4.22-4.22a.75.75 0 111.06 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-5.5-5.5a.75.75 0 111.06-1.06L9.25 14.388V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>;

const StatCard = ({ title, value, change }) => {
  const isGain = change >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
      {change != null && !isNaN(change) && (
        <p className={`flex items-center text-sm font-semibold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
          {isGain ? <ArrowUpIcon /> : <ArrowDownIcon />}
          {change.toFixed(1)}%
          <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">vs 30-day avg</span>
        </p>
      )}
    </div>
  );
};

export default function GrowthStats({ channelLogin }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/channels/${channelLogin}/growth-stats`);
        setStats(data);
      } catch (err) {
        console.error('Error fetching growth stats:', err);
      }
      setLoading(false);
    };

    fetchStats();
  }, [channelLogin]);

  if (loading) {
    return <p className="text-gray-500">Loading growth stats...</p>;
  }

  if (!stats || !stats.avg_30_days) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="7-Day Avg Viewers" value={0} change={0} />
        <StatCard title="30-Day Avg Viewers" value={0} />
        <StatCard title="30-Day Peak Viewers" value={0} />
      </div>
    );
  }

  // Calculate 7-day vs 30-day change
  const change = ((stats.avg_7_days - stats.avg_30_days) / stats.avg_30_days) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard 
        title="7-Day Avg Viewers" 
        value={stats.avg_7_days || 0}
        change={change}
      />
      <StatCard 
        title="30-Day Avg Viewers" 
        value={stats.avg_30_days}
      />
      <StatCard 
        title="30-Day Peak Viewers" 
        value={stats.peak_30_days || 0}
      />
    </div>
  );
}