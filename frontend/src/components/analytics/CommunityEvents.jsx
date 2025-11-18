import React from 'react';

// --- ICONS ---
const RaidIcon = () => <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M18 9.25a.75.75 0 00-1.5 0V11h-2.14l-2-4h4.28a.75.75 0 000-1.5H12l3 6h-3l-3 6-3-6H3l3-6H1.75a.75.75 0 000 1.5h4.28l-2 4H2V9.25a.75.75 0 00-1.5 0V11A.75.75 0 001.25 11h.039l2 4A.75.75 0 004 15.75V17h-.75a.75.75 0 000 1.5H10v-1.5H9.25a.75.75 0 00-.6-.333L6.4 12.5h7.2l-2.25 4.667a.75.75 0 00-.6.333H9v1.5h6.75a.75.75 0 000-1.5H15v-1.25a.75.75 0 00.711-.75l2-4h.039A.75.75 0 0018 11V9.25z"/></svg>;
const HostIcon = () => <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6.25 8.75a.75.75 0 000-1.5h-3.5a.75.75 0 000 1.5h3.5zM17.25 8.75a.75.75 0 000-1.5h-3.5a.75.75 0 000 1.5h3.5zM18 17.25V13A.75.75 0 0017.25 13H2.75A.75.75 0 002 13v4.25A.75.75 0 002.75 18h14.5A.75.75 0 0018 17.25zM12.75 5.5a.75.75 0 01-.75-.75V2.75a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v1.999a.75.75 0 01-1.5 0V2.75C6 1.784 6.784 1 7.75 1h3a.75.75 0 01.75.75V4.75a.75.75 0 01-.75.75z"/></svg>;
const SubIcon = () => <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2.5c-1.31 0-2.427.8-2.83 1.905A3.5 3.5 0 004.5 1.5.75.75 0 003 1.5v.44A3.5 3.5 0 00.5 5.5.75.75 0 00.5 7h4a.75.75 0 000-1.5H1.94A2 2 0 013.5 4.102 2.001 2.001 0 015.5 5c0 .69.355 1.296.857 1.638a.75.75 0 001.286-.966A2 2 0 015.5 4.103v-.002c0-1.104.896-2 2-2h.001a2 2 0 012 2v.002a2 2 0 01-2.143 1.549.75.75 0 00-1.286.966A3.501 3.501 0 0010 7c1.933 0 3.5-1.567 3.5-3.5v-.44a.75.75 0 00-1.5 0A3.5 3.5 0 009.5 5.5.75.75 0 009.5 7h4a.75.75 0 000-1.5h-3.06a2 2 0 011.56-1.398A2 2 0 0114.5 5c0 .69-.355 1.296-.857 1.638a.75.75 0 001.286.966A3.501 3.501 0 0018.5 5.5c0-1.933-1.567-3.5-3.5-3.5v-.44a.75.75 0 00-1.5 0A3.5 3.5 0 0011 4.405C10.593 3.3 9.477 2.5 8 2.5h-.001C7.3 2.5 6.66 2.768 6.13 3.252A3.483 3.483 0 008 3.5h.001a3.5 3.5 0 003.5-3.5.75.75 0 00-1.5 0v.44A3.5 3.5 0 006.5 5.5a.75.75 0 000 1.5h4a.75.75 0 000-1.5H7.94A2 2 0 019.5 4.102 2 2 0 0111.5 5c0 .69-.355 1.296-.857 1.638a.75.75 0 001.286.966A3.501 3.501 0 0015.5 5.5c0-1.933-1.567-3.5-3.5-3.5v-.44a.75.75 0 00-1.5 0c.268.95.83 1.758 1.56 2.33A2 2 0 0110 5.5V5c0-1.104-.896-2-2-2h-.001a2 2 0 00-2 2v.002a2 2 0 00-2.143 1.549.75.75 0 00-1.286-.966A3.501 3.501 0 002.5 5.5c0-1.933-1.567-3.5-3.5-3.5A.75.75 0 00-1.5 2v4.25c0 .966.784 1.75 1.75 1.75h1.5a.75.75 0 000-1.5H.25a.25.25 0 01-.25-.25V2.75c0-.138.112-.25.25-.25A1.75 1.75 0 012 4.25v2a.75.75 0 001.5 0V3.75a.25.25 0 01.25-.25h.5a.25.25 0 01.25.25v4a.75.75 0 001.5 0V2.25A.25.25 0 016.25 2h1.5a.25.25 0 01.25.25v4.25a.75.75 0 001.5 0V3.75a.25.25 0 01.25-.25h.5a.25.25 0 01.25.25v4a.75.75 0 001.5 0V2.25a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25v4.25a.75.75 0 001.5 0V4.25A1.75 1.75 0 0118 2.5a.25.25 0 01.25.25V6.5a.25.25 0 01-.25.25h-1.5a.75.75 0 000 1.5h1.5c.966 0 1.75-.784 1.75-1.75V2a.75.75 0 00-1.5 0v.44a3.5 3.5 0 00-3.5-3.5c-1.933 0-3.5 1.567-3.5 3.5v.44a.75.75 0 00-1.5 0z" clipRule="evenodd"/></svg>;
const BitsIcon = () => <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M8.22 5.22a.75.75 0 011.06 0l1.25 1.25a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 01-1.06 0L7 7.56l-1.22 1.22a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 010-1.06l1.25-1.25a.75.75 0 011.06 0l1.22 1.22L8.22 5.22zM6.94 9.06a.75.75 0 011.06 0l1.25 1.25a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 01-1.06 0L5.72 11.4l-1.22 1.22a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 010-1.06l1.25-1.25a.75.75 0 011.06 0l1.22 1.22L6.94 9.06zM11.75 7.5a.75.75 0 010-1.06l1.25-1.25a.75.75 0 011.06 0l1.25 1.25a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 01-1.06 0L12 7.56l-1.22 1.22a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 010-1.06l1.25-1.25a.75.75 0 011.06 0l1.22 1.22L11.75 7.5zM13.06 9.06a.75.75 0 011.06 0l1.25 1.25a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 01-1.06 0L11.84 11.4l-1.22 1.22a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 010-1.06l1.25-1.25a.75.75 0 011.06 0l1.22 1.22L13.06 9.06z"/></svg>;


/**
 * A helper component to render a single event item.
 * This keeps the main component clean.
 */
const EventItem = ({ event }) => {
  switch (event.type) {
    case 'raid':
      return (
        <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <RaidIcon />
          <p className="text-sm">
            <span className="font-bold">{event.username}</span>
            {' raided with '}
            <span className="font-bold">{event.viewers}</span> viewers!
          </p>
        </div>
      );
    case 'host':
      return (
        <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <HostIcon />
          <p className="text-sm">
            <span className="font-bold">{event.username}</span>
            {' hosted with '}
            <span className="font-bold">{event.viewers}</span> viewers!
          </p>
        </div>
      );
    case 'sub':
    case 'primesub':
      return (
        <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <SubIcon />
          <p className="text-sm">
            <span className="font-bold">{event.username}</span>
            {' just subscribed!'}
            {event.message && <em className="ml-2 italic opacity-75 truncate">"{event.message}"</em>}
          </p>
        </div>
      );
    case 'resub':
      return (
        <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <SubIcon />
          <p className="text-sm">
            <span className="font-bold">{event.username}</span>
            {' resubscribed for '}
            <span className="font-bold">{event.months}</span> months!
            {event.message && <em className="ml-2 italic opacity-75 truncate">"{event.message}"</em>}
          </p>
        </div>
      );
    case 'gift-sub':
      return (
        <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <SubIcon />
          <p className="text-sm">
            <span className="font-bold">{event.username}</span>
            {' gifted a sub to '}
            <span className="font-bold">{event.recipient}</span>!
          </p>
        </div>
      );
    case 'bits':
      return (
        <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <BitsIcon />
          <p className="text-sm">
            <span className="font-bold">{event.username}</span>
            {' cheered '}
            <span className="font-bold">{event.bits}</span> bits!
          </p>
        </div>
      );
    default:
      return null;
  }
};

/**
 * Main component to display the list of events
 */
export default function CommunityEvents({ events }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold mb-4">Live Community Events</h3>
      <div className="space-y-3 h-64 overflow-y-auto pr-2">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Waiting for events...</p>
        ) : (
          events.map((event, index) => (
            <EventItem key={index} event={event} />
          ))
        )}
      </div>
    </div>
  );
}