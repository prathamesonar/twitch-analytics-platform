import { useState, useEffect, useRef } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export const useGlobalWebSocket = () => {
  const [alerts, setAlerts] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => console.log('Global WebSocket connected');
    ws.current.onclose = () => console.log('Global WebSocket disconnected');
    ws.current.onerror = (err) => console.error('Global WebSocket error:', err);

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Listen for new trend alerts
        if (message.type === 'game-trend-alert') {
          console.log('NEW GAME TREND ALERT:', message.data);
          
          // --- THIS IS THE FIX ---
          // We make the ID more unique by combining the time with the game name.
          const newAlert = { 
            ...message.data, 
            id: `${Date.now()}-${message.data.game_name}` 
          };
          // --- END FIX ---

          setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
        }
      } catch (err) {
        console.error('Failed to parse global WS message', err);
      }
    };

    // Cleanup
    return () => {
      ws.current.close();
    };
  }, []);

  const dismissAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== id));
  };

  return { alerts, dismissAlert };
};