import { useState, useEffect, useRef } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export const useWebSocket = (channelName) => {
  // We'll store different types of data in state
  const [sentimentMessages, setSentimentMessages] = useState([]);
  const [emoteCounts, setEmoteCounts] = useState({});
  const [communityEvents, setCommunityEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const ws = useRef(null);

  useEffect(() => {
    if (!channelName) return;

    // Reset states when channel changes
    setSentimentMessages([]);
    setEmoteCounts({});
    setCommunityEvents([]);
    
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log(`WebSocket connected for ${channelName}`);
      setIsConnected(true);
      ws.current.send(JSON.stringify({
        type: 'SUBSCRIBE',
        channel: channelName
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // --- NEW: Handle different message types ---
        switch (message.type) {
          case 'chat-sentiment':
            setSentimentMessages((prev) => [message.data, ...prev.slice(0, 50)]);
            break;
            
          case 'emote-usage':
            // This logic counts the emotes
            setEmoteCounts((prevCounts) => {
              const newCounts = { ...prevCounts };
              Object.keys(message.data.emotes).forEach(emoteId => {
                newCounts[emoteId] = (newCounts[emoteId] || 0) + message.data.emotes[emoteId].length;
              });
              return newCounts;
            });
            break;

          case 'community-event':
            setCommunityEvents((prev) => [message.data, ...prev.slice(0, 20)]);
            break;
            
          default:
            break;
        }

      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    ws.current.onclose = () => {
      console.log(`WebSocket disconnected for ${channelName}`);
      setIsConnected(false);
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    // Cleanup
    return () => {
      ws.current.close();
    };
  }, [channelName]);

  // Return all our new states
  return { 
    sentimentMessages, 
    emoteCounts, 
    communityEvents, 
    isConnected 
  };
};