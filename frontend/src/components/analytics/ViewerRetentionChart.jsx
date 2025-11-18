import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import api from '../../lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register all the Chart.js components we need
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function ViewerRetentionChart({ channelLogin }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/channels/${channelLogin}/metrics`);
        
        if (data && data.length > 0) {
          // Format the data for Chart.js
          const labels = data.map(metric => new Date(metric.created_at));
          const viewers = data.map(metric => metric.viewer_count);

          setChartData({
            labels: labels,
            datasets: [
              {
                label: 'Viewer Count',
                data: viewers,
                borderColor: 'rgb(168, 85, 247)', // Purple
                backgroundColor: 'rgba(168, 85, 247, 0.5)',
                tension: 0.1
              },
            ],
          });
        } else {
          setChartData(null); // No data to display
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
      setLoading(false);
    };

    fetchMetrics();
  }, [channelLogin]);

  // Chart styling options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // <-- Add this
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Viewer Retention (Last 24 Hours)',
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

  // --- NEW LOGIC TO EXPLAIN THE DOT ---
  let chartContent;
  if (loading) {
    chartContent = <p>Loading chart data...</p>;
  } else if (!chartData || chartData.labels.length < 2) {
    // This is the new check. If we have 0 or 1 points, show this.
    chartContent = (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">
          Collecting data... A line will appear once at least two data points (10+ minutes) are collected.
        </p>
      </div>
    );
  } else {
    chartContent = <Line options={options} data={chartData} />;
  }
  // --- END NEW LOGIC ---

  return (
    // --- UPDATED STYLING ---
    // We wrap the chart in a div with a fixed height to control the "bigness"
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-full col-span-1 lg:col-span-3">
      <h3 className="text-xl font-bold mb-4">Viewer Retention</h3>
      <div className="relative" style={{ height: '350px' }}>
        {chartContent}
      </div>
    </div>
  );
}