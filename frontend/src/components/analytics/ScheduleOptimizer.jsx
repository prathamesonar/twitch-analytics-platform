import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import api from '../../lib/api';
// --- THIS IS THE FIX ---
// We need to import and register the components for a Bar chart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register all the Chart.js components we need
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
// --- END FIX ---

export default function ScheduleOptimizer({ channelLogin }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/channels/${channelLogin}/schedule-optimizer`);
        
        if (data && data.length > 0) {
          // Process data to find average viewers by hour (0-23)
          const hourlyViewers = new Array(24).fill(0);
          const hourlyCounts = new Array(24).fill(0);
          
          data.forEach(row => {
            const hour = parseInt(row.hour_of_day, 10);
            hourlyViewers[hour] += row.avg_viewers;
            hourlyCounts[hour]++;
          });

          const labels = hourlyViewers.map((_, i) => `${i}:00`);
          const averages = hourlyViewers.map((total, i) => {
            return hourlyCounts[i] > 0 ? total / hourlyCounts[i] : 0;
          });

          setChartData({
            labels: labels,
            datasets: [
              {
                label: 'Average Viewers by Hour',
                data: averages,
                backgroundColor: 'rgba(168, 85, 247, 0.5)',
                borderColor: 'rgb(168, 85, 247)',
                borderWidth: 1
              },
            ],
          });
        } else {
          setChartData(null);
        }
      } catch (err) {
        console.error('Error fetching schedule data:', err);
      }
      setLoading(false);
    };

    fetchScheduleData();
  }, [channelLogin]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Best Time to Stream (Avg. Viewers by Hour, Last 30 Days)',
        color: document.documentElement.classList.contains('dark') ? '#FFF' : '#000'
      },
    },
    scales: {
      x: {
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
  
  let chartContent;
  if (loading) {
    chartContent = <p className="text-gray-500 text-center">Loading optimizer data...</p>;
  } else if (chartData) {
    chartContent = <Bar options={options} data={chartData} />;
  } else {
    chartContent = (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">
          Not enough data yet. Let the app run for a few hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold mb-4">Stream Schedule Optimizer</h3>
      <div className="relative" style={{ height: '350px' }}>
        {chartContent}
      </div>
    </div>
  );
}