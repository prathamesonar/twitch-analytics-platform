import React, { useMemo } from 'react';

const getEmoteUrl = (emoteId) =>
  `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`;

export default function EmoteTracker({ emoteCounts }) {
  
  const topEmotes = useMemo(() => {
    return Object.entries(emoteCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5);
  }, [emoteCounts]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold mb-4">Top Emotes</h3>
      {topEmotes.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Waiting for emotes...</p>
      ) : (
        <div className="space-y-3">
          {topEmotes.map(([emoteId, count]) => (
            <div key={emoteId} className="flex items-center justify-between">
              <img
                src={getEmoteUrl(emoteId)}
                alt={`Emote ${emoteId}`}
                className="w-8 h-8"
              />
              <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
