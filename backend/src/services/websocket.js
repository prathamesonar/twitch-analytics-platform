import { WebSocketServer, WebSocket } from 'ws'; // <-- THIS IS THE FIX

let wss;

export const initWebSocketServer = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // ws.channel will store which channel the user is watching
    ws.channel = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('WebSocket message received:', data);

        // When frontend sends a "subscribe" message
        if (data.type === 'SUBSCRIBE' && data.channel) {
          // Store which channel this client wants data for
          ws.channel = data.channel.toLowerCase();
          console.log(`Client subscribed to channel: ${ws.channel}`);
        }

      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });

    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to Twitch Monitor' }));
  });

  console.log('WebSocket server initialized');
};

// Function to broadcast data to all connected clients
export const broadcast = (data) => {
  if (!wss) return;
  
  const jsonData = JSON.stringify(data);
  wss.clients.forEach((client) => {
    // We use WebSocket.OPEN here, which is why we need the import
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonData);
    }
  });
};

/**
 * Function to send data to specific clients
 * (e.g., all clients watching "shroud")
 */
export const broadcastToChannel = (channelName, data) => {
  if (!wss || !channelName) return;

  const channel = channelName.toLowerCase();
  const jsonData = JSON.stringify(data);

  wss.clients.forEach((client) => {
    // We use WebSocket.OPEN here, which is why we need the import
    if (client.channel === channel && client.readyState === WebSocket.OPEN) {
      client.send(jsonData);
    }
  });
};