import React from 'react';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { EmailBisonWorkspace } from '../types/email-bison';

export const WorkspaceList: React.FC = () => {
  const { workspaces, loading, error, refetch } = useWorkspaces();

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-md shadow-md">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading workspaces...</span>
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

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="p-4 bg-white rounded-md shadow-md">
        <p className="text-gray-500 text-center py-8">No workspaces found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Email Bison Workspaces</h2>
        <p className="text-sm text-gray-500">{workspaces.length} workspaces available</p>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {workspaces.map((workspace) => (
          <WorkspaceItem key={workspace.id} workspace={workspace} />
        ))}
      </ul>
    </div>
  );
};

const WorkspaceItem: React.FC<{ workspace: EmailBisonWorkspace }> = ({ workspace }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800'
  };

  return (
    <li className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-medium text-gray-900">{workspace.name || 'Unnamed Workspace'}</h3>
          <p className="text-sm text-gray-500">ID: {workspace.id}</p>
        </div>
        
        <div className="flex items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[workspace.status]}`}>
            {workspace.status}
          </span>
          
          <div className="ml-4 flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">{workspace.inbox_count} inboxes</span>
            <span className="text-xs text-gray-500">
              {workspace.member_count} {workspace.member_count === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Owner: {workspace.owner_id}</span>
        <span>Created: {new Date(workspace.created_at).toLocaleDateString()}</span>
      </div>
    </li>
  );
};

export default WorkspaceList;
