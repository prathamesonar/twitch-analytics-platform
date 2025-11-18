import React, { useMemo } from 'react';

// ... (getSentimentColor helper function)
const getSentimentColor = (score) => {
  if (score > 0) return 'text-green-500';
  if (score < 0) return 'text-red-500';
  return 'text-gray-500 dark:text-gray-400';
};

export default function ChatSentiment({ sentimentMessages, isConnected }) {
  // Calculate average sentiment
  const averageScore = useMemo(() => {
    if (sentimentMessages.length === 0) return 0;
    const recentMessages = sentimentMessages.slice(0, 20);
    const totalScore = recentMessages.reduce((acc, msg) => acc + msg.score, 0);
    return (totalScore / recentMessages.length).toFixed(2);
  }, [sentimentMessages]);

  const lastMessages = useMemo(() => sentimentMessages.slice(0, 3), [sentimentMessages]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Chat Sentiment</h3>
        <span className={`flex items-center gap-2 text-sm font-semibold ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {isConnected ? 'LIVE' : 'DISCONNECTED'}
        </span>
      </div>
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Average Sentiment (Last 20 Msgs)</p>
        <p className={`text-6xl font-bold ${getSentimentColor(averageScore)}`}>
          {averageScore}
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Live Chat Feed</h4>
        <div className="space-y-2 h-48 overflow-y-auto pr-2">
  {sentimentMessages.length === 0 && (
    <p className="text-sm text-gray-500 dark:text-gray-400">Waiting for chat messages...</p>
  )}
  {lastMessages.map((msg, index) => (
    <div key={index} className="text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded">
      <span className={`font-bold ${getSentimentColor(msg.score)}`}>{msg.user}:</span>
      <span className="ml-1 text-gray-800 dark:text-gray-200 truncate">{msg.message}</span>
    </div>
  ))}
</div>

      </div>
    </div>
  );
}