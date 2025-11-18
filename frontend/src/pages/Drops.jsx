import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';

export default function Drops() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrops = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/drops');
        setCampaigns(data || []);
      } catch (err) {
        console.error('Error fetching drops:', err);
      }
      setLoading(false);
    };
    fetchDrops();
  }, []);

  return (
    <div className="container mx-auto">
      <h2 className="text-4xl font-bold mb-8">Active Drops Campaigns</h2>
      
      {loading ? (
        <p>Loading active drops...</p>
      ) : campaigns.length === 0 ? (
        <p>No Drops campaigns are active right now.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Game</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Campaign</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Ends At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="p-4">
                    <img src={campaign.game.box_art_url.replace('{width}x{height}', '50x70')} alt={campaign.game.name} />
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">{campaign.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.status}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                    {format(new Date(campaign.end_time), 'PPp')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}