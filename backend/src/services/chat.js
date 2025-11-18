
// import tmi from 'tmi.js';
// import Sentiment from 'sentiment';
// import { broadcastToChannel } from './websocket.js';
// import pool from '../config/db.js'; // <-- IMPORT THE DATABASE

// // --- Sentiment Analyzer Setup ---
// const sentiment = new Sentiment();

// // --- TMI.js Client ---
// const client = new tmi.Client({
//   options: { debug: false }, // Set to true for spammy logs
//   connection: {
//     reconnect: true,
//     secure: true
//   },
//   // We connect anonymously (no need to chat, just listen)
// });

// // --- Channel Management ---
// const currentChannels = new Set();
// let isTmiConnected = false; // Flag to check connection status

// // --- PRIMARY EVENT LISTENER (RAIDS, SUBS, ETC.) ---
// client.on('usernotice', (channel, tags, msg) => {
//   const channelName = channel.replace('#', '');
//   const msgId = tags['msg-id'];

//   // ---- RAID ----
//   if (msgId === 'raid') {
//     const username = tags['msg-param-displayName'];
//     const viewers = Number(tags['msg-param-viewerCount'] || 0);

//     console.log(`RAID DETECTED: ${username} raided ${channelName} with ${viewers}`);

//     // Broadcast
//     broadcastToChannel(channelName, {
//       type: 'community-event',
//       channel: channelName,
//       data: { type: 'raid', username, viewers }
//     });

//     // DB insert
//     pool.query(
//       `INSERT INTO community_events (channel_login, event_type, username, viewer_count)
//        VALUES ($1, 'raid', $2, $3)`,
//       [channelName, username, viewers]
//     ).catch(err => console.error('DB raid log error:', err));
//   }

//   // ---- SUB (NEW & PRIME) ----
//   if (msgId === 'sub' || msgId === 'primesub') {
//     const eventType = msgId === 'primesub' ? 'primesub' : 'sub';
//     const username = tags['display-name'];
    
//     broadcastToChannel(channelName, {
//       type: 'community-event',
//       channel: channelName,
//       data: {
//         type: eventType,
//         username: username,
//         message: msg
//       }
//     });

//     // --- NEW: Log to DB ---
//     pool.query(
//       `INSERT INTO community_events (channel_login, event_type, username, message)
//        VALUES ($1, $2, $3, $4)`,
//       [channelName, eventType, username, msg]
//     ).catch(err => console.error('DB sub log error:', err));
//   }

//   // ---- GIFT SUB ----
//   if (msgId === 'subgift') {
//     const username = tags['display-name'];
//     const recipient = tags['msg-param-recipient-display-name'];
    
//     broadcastToChannel(channelName, {
//       type: 'community-event',
//       channel: channelName,
//       data: {
//         type: 'gift-sub',
//         username: username,
//         recipient: recipient
//       }
//     });

//     // --- NEW: Log to DB ---
//     pool.query(
//       `INSERT INTO community_events (channel_login, event_type, username, message)
//        VALUES ($1, 'gift-sub', $2, $3)`,
//       [channelName, username, `Gifted to ${recipient}`]
//     ).catch(err => console.error('DB subgift log error:', err));
//   }

//   // ---- RESUB ----
//   if (msgId === 'resub') {
//     const username = tags['display-name'];
//     const months = Number(tags['msg-param-cumulative-months'] || 1);
    
//     broadcastToChannel(channelName, {
//       type: 'community-event',
//       channel: channelName,
//       data: {
//         type: 'resub',
//         username: username,
//         months: months,
//         message: msg
//       }
//     });

//     // --- NEW: Log to DB ---
//     pool.query(
//       `INSERT INTO community_events (channel_login, event_type, username, viewer_count, message)
//        VALUES ($1, 'resub', $2, $3, $4)`,
//       [channelName, username, months, msg] // Storing months in viewer_count
//     ).catch(err => console.error('DB resub log error:', err));
//   }
// });


// // --- DELETED: client.on('raided', ...) ---
// // This is now handled by 'usernotice' above.


// // --- LISTEN FOR HOSTS ---
// // 'hosted' is not a 'usernotice' event, so we keep this listener.
// client.on('hosted', (channel, username, viewers, autohost) => {
//   if (autohost) return; // Ignore autohosts
  
//   const channelName = channel.replace('#', '');
//   console.log(`HOST DETECTED: ${username} hosted ${channelName} with ${viewers} viewers.`);

//   const payload = {
//     type: 'community-event',
//     channel: channelName,
//     data: { type: 'host', username, viewers }
//   };
//   broadcastToChannel(channelName, payload);

//   pool.query(
//     `INSERT INTO community_events (channel_login, event_type, username, viewer_count)
//      VALUES ($1, 'host', $2, $3)`,
//     [channelName, username, viewers]
//   ).catch(err => console.error('DB host log error:', err));
// });

// // --- CHAT MESSAGE LISTENER (SENTIMENT, EMOTES, BITS) ---
// client.on('message', (channel, tags, message, self) => {
//   if (self) return;

//   const channelName = channel.replace('#', '');

//   // --- SENTIMENT ---
//   const sentimentResult = sentiment.analyze(message);
//   const score = sentimentResult.score;
//   broadcastToChannel(channelName, {
//     type: 'chat-sentiment',
//     channel: channelName,
//     data: { score, user: tags['display-name'], message }
//   });

//   // --- EMOTES ---
//   if (tags.emotes) {
//     broadcastToChannel(channelName, {
//       type: 'emote-usage',
//       channel: channelName,
//       data: { emotes: tags.emotes, user: tags['display-name'] }
//     });
//   }

//   // --- BITS (CHEER EVENTS) ---
//   if (tags.bits) {
//     const bits = Number(tags.bits);
//     broadcastToChannel(channelName, {
//       type: 'community-event',
//       channel: channelName,
//       data: {
//         type: 'bits',
//         username: tags['display-name'],
//         bits: bits,
//         message
//       }
//     });

//     // Save bits to DB (using viewer_count for bit amount)
//     pool.query(
//       `INSERT INTO community_events (channel_login, event_type, username, viewer_count)
//        VALUES ($1, 'bits', $2, $3)`,
//       [channelName, tags['display-name'], bits]
//     ).catch(err => console.error('DB bits log error:', err));
//   }
// });


// // --- TMI Connection Listeners ---
// client.on('connected', (addr, port) => {
//   console.log(`TMI.js connected to ${addr}:${port}`);
//   isTmiConnected = true; // SET FLAG
// });
// client.on('disconnected', (reason) => {
//   console.log(`TMI.js disconnected: ${reason}`);
//   isTmiConnected = false; // UNSET FLAG
// });

// // --- Main function to start the TMI client ---
// export const connectChatClient = async () => {
//   try {
//     await client.connect();
//   } catch (err) {
//     console.error('Error connecting TMI.js client', err);
//   }
// };

// // --- Connects to a specific Twitch channel's chat ---
// export const joinChannel = (channelName) => {
//   if (!client || !channelName || currentChannels.has(channelName)) {
//     return;
//   }
//   if (!isTmiConnected) {
//     console.warn(`TMI.js not connected. Retrying join for ${channelName} in 3 seconds...`);
//     setTimeout(() => joinChannel(channelName), 3000); // Try again
//     return;
//   }
//   client.join(channelName)
//     .then(() => {
//       currentChannels.add(channelName);
//       console.log(`Joined chat for: ${channelName}`);
//     })
//     .catch((err) => {
//       console.error(`Failed to join channel ${channelName}`, err);
//     });
// };

// // --- Leaves a specific Twitch channel's chat ---
// export const partChannel = (channelName) => {
//   if (!client || !channelName || !currentChannels.has(channelName)) {
//     return;
//   }
//   client.part(channelName)
//     .then(() => {
//       currentChannels.delete(channelName);
//       console.log(`Left chat for: ${channelName}`);
//     })
//     .catch((err) => {
//       console.error(`Failed to part channel ${channelName}`, err);
//     });
// };
import tmi from 'tmi.js';
import Sentiment from 'sentiment';
import { broadcastToChannel } from './websocket.js';
import pool from '../config/db.js'; // <-- IMPORT THE DATABASE

// --- Sentiment Analyzer Setup ---
const sentiment = new Sentiment();

// --- TMI.js Client ---
const client = new tmi.Client({
  options: { debug: false }, // Set to true for spammy logs
  connection: {
    reconnect: true,
    secure: true
  },
  // We connect anonymously (no need to chat, just listen)
});

// --- Channel Management ---
const currentChannels = new Set();
let isTmiConnected = false; // Flag to check connection status

// --- PRIMARY EVENT LISTENER (RAIDS, SUBS, ETC.) ---
client.on('usernotice', (channel, tags, msg) => {
  const channelName = channel.replace('#', '');
  const msgId = tags['msg-id'];

  // ---- RAID ----
  if (msgId === 'raid') {
    const username = tags['msg-param-displayName'];
    const viewers = Number(tags['msg-param-viewerCount'] || 0);

    console.log(`RAID DETECTED: ${username} raided ${channelName} with ${viewers}`);

    // Broadcast
    broadcastToChannel(channelName, {
      type: 'community-event',
      channel: channelName,
      data: { type: 'raid', username, viewers }
    });

    // DB insert
    pool.query(
      `INSERT INTO community_events (channel_login, event_type, username, viewer_count)
       VALUES ($1, 'raid', $2, $3)`,
      [channelName, username, viewers]
    ).catch(err => console.error('DB raid log error:', err));
  }

  // ---- SUB (NEW & PRIME) ----
  if (msgId === 'sub' || msgId === 'primesub') {
    const eventType = msgId === 'primesub' ? 'primesub' : 'sub';
    const username = tags['display-name'];
    
    broadcastToChannel(channelName, {
      type: 'community-event',
      channel: channelName,
      data: {
        type: eventType,
        username: username,
        message: msg
      }
    });

    // --- Log to DB ---
    pool.query(
      `INSERT INTO community_events (channel_login, event_type, username, message)
       VALUES ($1, $2, $3, $4)`,
      [channelName, eventType, username, msg]
    ).catch(err => console.error('DB sub log error:', err));
  }

  // ---- GIFT SUB ----
  if (msgId === 'subgift') {
    const username = tags['display-name'];
    const recipient = tags['msg-param-recipient-display-name'];
    
    broadcastToChannel(channelName, {
      type: 'community-event',
      channel: channelName,
      data: {
        type: 'gift-sub',
        username: username,
        recipient: recipient
      }
    });

    // --- Log to DB ---
    pool.query(
      `INSERT INTO community_events (channel_login, event_type, username, message)
       VALUES ($1, 'gift-sub', $2, $3)`,
      [channelName, username, `Gifted to ${recipient}`]
    ).catch(err => console.error('DB subgift log error:', err));
  }

  // ---- RESUB ----
  if (msgId === 'resub') {
    const username = tags['display-name'];
    const months = Number(tags['msg-param-cumulative-months'] || 1);
    
    broadcastToChannel(channelName, {
      type: 'community-event',
      channel: channelName,
      data: {
        type: 'resub',
        username: username,
        months: months,
        message: msg
      }
    });

    // --- Log to DB ---
    pool.query(
      `INSERT INTO community_events (channel_login, event_type, username, viewer_count, message)
       VALUES ($1, 'resub', $2, $3, $4)`,
      [channelName, username, months, msg] // Storing months in viewer_count
    ).catch(err => console.error('DB resub log error:', err));
  }
});

// --- LISTEN FOR HOSTS ---
// 'hosted' is not a 'usernotice' event, so we keep this listener.
client.on('hosted', (channel, username, viewers, autohost) => {
  if (autohost) return; // Ignore autohosts
  
  const channelName = channel.replace('#', '');
  console.log(`HOST DETECTED: ${username} hosted ${channelName} with ${viewers} viewers.`);

  const payload = {
    type: 'community-event',
    channel: channelName,
    data: { type: 'host', username, viewers }
  };
  broadcastToChannel(channelName, payload);

  pool.query(
    `INSERT INTO community_events (channel_login, event_type, username, viewer_count)
     VALUES ($1, 'host', $2, $3)`,
    [channelName, username, viewers]
  ).catch(err => console.error('DB host log error:', err));
});

// --- CHAT MESSAGE LISTENER (SENTIMENT, EMOTES, BITS) ---
client.on('message', (channel, tags, message, self) => {
  if (self) return;

  const channelName = channel.replace('#', '');

  // --- SENTIMENT ---
  const sentimentResult = sentiment.analyze(message);
  const score = sentimentResult.score;
  broadcastToChannel(channelName, {
    type: 'chat-sentiment',
    channel: channelName,
    data: { score, user: tags['display-name'], message }
  });

  // --- EMOTES ---
  if (tags.emotes) {
    broadcastToChannel(channelName, {
      type: 'emote-usage',
      channel: channelName,
      data: { emotes: tags.emotes, user: tags['display-name'] }
    });
  }

  // --- BITS (CHEER EVENTS) ---
  if (tags.bits) {
    const bits = Number(tags.bits);
    broadcastToChannel(channelName, {
      type: 'community-event',
      channel: channelName,
      data: {
        type: 'bits',
        username: tags['display-name'],
        bits: bits,
        message: message
      }
    });

    // Save bits to DB (using viewer_count for bit amount)
    pool.query(
      `INSERT INTO community_events (channel_login, event_type, username, viewer_count, message)
       VALUES ($1, 'bits', $2, $3, $4)`,
      [channelName, tags['display-name'], bits, message]
    ).catch(err => console.error('DB bits log error:', err));
  }
});


// --- TMI Connection Listeners ---
client.on('connected', (addr, port) => {
  console.log(`TMI.js connected to ${addr}:${port}`);
  isTmiConnected = true; // SET FLAG
});
client.on('disconnected', (reason) => {
  console.log(`TMI.js disconnected: ${reason}`);
  isTmiConnected = false; // UNSET FLAG
});

// --- Main function to start the TMI client ---
export const connectChatClient = async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Error connecting TMI.js client', err);
  }
};

// --- Connects to a specific Twitch channel's chat ---
export const joinChannel = (channelName) => {
  if (!client || !channelName || currentChannels.has(channelName)) {
    return;
  }
  if (!isTmiConnected) {
    console.warn(`TMI.js not connected. Retrying join for ${channelName} in 3 seconds...`);
    setTimeout(() => joinChannel(channelName), 3000); // Try again
    return;
  }
  client.join(channelName)
    .then(() => {
      currentChannels.add(channelName);
      console.log(`Joined chat for: ${channelName}`);
    })
    .catch((err) => {
      console.error(`Failed to join channel ${channelName}`, err);
    });
};

// --- Leaves a specific Twitch channel's chat ---
export const partChannel = (channelName) => {
  if (!client || !channelName || !currentChannels.has(channelName)) {
    return;
  }
  client.part(channelName)
    .then(() => {
      currentChannels.delete(channelName);
      console.log(`Left chat for: ${channelName}`);
    })
    .catch((err) => {
      console.error(`Failed to part channel ${channelName}`, err);
    });
};