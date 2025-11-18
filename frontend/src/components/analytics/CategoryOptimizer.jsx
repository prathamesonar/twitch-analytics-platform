import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

const StarIcon = () => <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.28-.662 1.601 0l1.67 3.431 3.687.528c.731.104 1.022.99.494 1.508l-2.69 2.603.644 3.65c.124.708-.636 1.25-1.29.914L10 13.347l-3.308 1.722c-.654.336-1.414-.206-1.29-.914l.644-3.65-2.69-2.603c-.528-.518-.237-1.404.494-1.508l3.687-.528 1.67-3.431z" clipRule="evenodd" /></svg>;

export default function CategoryOptimizer({ channelLogin }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/channels/${channelLogin}/category-optimization`);
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching category data:', err);
      }
      setLoading(false);
    };

    fetchCategories();
  }, [channelLogin]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold mb-4">Category Performance</h3>
      <div className="space-y-3 h-64 overflow-y-auto pr-2">
        {loading ? (
          <p className="text-gray-500">Optimizing categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500">
            Not enough data yet. (Needs 30 days of metrics)
          </p>
        ) : (
          categories.map((cat, index) => (
            <div key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-lg truncate flex items-center gap-2">
                  {index === 0 && <StarIcon />}
                  {cat.game_name}
                </p>
                <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                  {cat.avg_viewers.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> avg</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Peak: {cat.peak_viewers.toLocaleString()} viewers
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}