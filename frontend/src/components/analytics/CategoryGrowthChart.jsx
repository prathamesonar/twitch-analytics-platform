import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import api from '../../lib/api';
// We already registered Chart.js in the other chart component

// Helper to get random colors for the chart lines
const generateColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

export default function CategoryGrowthChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/games/trends');
        
        if (data && data.length > 0) {
          // Process the data from our SQL query
          const games = {}; // { game_id: { name: '...', data: [...] } }
          
          data.forEach(row => {
            if (!games[row.game_id]) {
              games[row.game_id] = {
                name: row.game_name,
                data: []
              };
            }
            games[row.game_id].data.push({
              x: new Date(row.hour),
              y: Math.round(row.avg_viewers)
            });
          });

          // Create Chart.js datasets
          const datasets = Object.values(games).map(game => {
            const color = generateColor(game.name);
            return {
              label: game.name,
              data: game.data,
              borderColor: color,
              backgroundColor: `${color}80`, // Add transparency
              tension: 0.1
            };
          });

          setChartData({ datasets });
        } else {
          setChartData(null);
        }
      } catch (err) {
        console.error('Error fetching game trends:', err);
      }
      setLoading(false);
    };
    fetchTrendData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#FFF' : '#000'
        }
      },
      title: {
        display: true,
        text: 'Top 5 Game Viewership (Last 3 Days)',
        color: document.documentElement.classList.contains('dark') ? '#FFF' : '#000'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          tooltipFormat: 'PPp'
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#FFF' : '#000'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#FFF' : '#000'
        }
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-full">
      <div className="relative" style={{ height: '400px' }}>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">Loading chart data...</p>
        ) : chartData ? (
          <Line options={options} data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Collecting data for game trends. Check back in an hour.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}