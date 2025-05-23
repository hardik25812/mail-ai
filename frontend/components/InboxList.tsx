import React from 'react';
import { useInboxes } from '../hooks/useInboxes';
import type { EmailBisonInbox } from '../types/email-bison';

export const InboxList: React.FC = () => {
  const { inboxes, loading, error, refetch } = useInboxes();

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-md shadow-md">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading inboxes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-md shadow-md">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!inboxes || inboxes.length === 0) {
    return (
      <div className="p-4 bg-white rounded-md shadow-md">
        <p className="text-gray-500 text-center py-8">No inboxes found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Email Inboxes</h2>
        <p className="text-sm text-gray-500">{inboxes.length} inboxes available</p>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {inboxes.map((inbox) => (
          <InboxItem key={inbox.id} inbox={inbox} />
        ))}
      </ul>
    </div>
  );
};

const InboxItem: React.FC<{ inbox: EmailBisonInbox }> = ({ inbox }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <li className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-medium text-gray-900">{inbox.name || 'Unnamed Inbox'}</h3>
          <p className="text-sm text-gray-500">{inbox.email}</p>
        </div>
        
        <div className="flex items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[inbox.status]}`}>
            {inbox.status}
          </span>
          
          <div className="ml-4 flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">{inbox.total_count} emails</span>
            <span className="text-xs text-gray-500">
              {inbox.unread_count > 0 ? `${inbox.unread_count} unread` : 'No unread'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>ID: {inbox.id}</span>
        <span>Last updated: {new Date(inbox.last_sync_time).toLocaleString()}</span>
      </div>
    </li>
  );
};

export default InboxList;
