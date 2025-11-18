import React from 'react';

// Icons
const TrendIcon = () => <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const XIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function AlertToast({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-24 right-4 z-50 space-y-3 w-80">
      {alerts.map((alert) => (
        <div key={alert.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border-l-4 border-green-500">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <TrendIcon />
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-gray-900 dark:text-white">New Game Trend!</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{alert.game_name}</span> is trending!
              </p>
              <p className="text-xs text-gray-500">
                {alert.current_avg.toLocaleString()} viewers (up from {alert.past_avg.toLocaleString()})
              </p>
            </div>
            <button onClick={() => onDismiss(alert.id)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <XIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}