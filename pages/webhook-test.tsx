import React, { useState, useEffect } from 'react';
import { useWebhooks, getWebhookUrl } from './webhook-utils';
import { toast, Toaster } from 'sonner';

export default function WebhookTestPage() {
  // For testing purposes, we'll use a hardcoded workspace ID
  // In production, you would get this from your authentication context
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [inputWorkspaceId, setInputWorkspaceId] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  
  // Initialize the webhook hook
  const {
    webhookEvents,
    webhookStats,
    loading,
    statsLoading,
    error,
    totalEvents,
    fetchWebhookEvents,
    fetchWebhookStats
  } = useWebhooks({
    workspaceId,
    enableRealTimeUpdates: true
  });
  
  // Handle setting workspace ID
  const handleSetWorkspace = () => {
    if (inputWorkspaceId) {
      setWorkspaceId(inputWorkspaceId);
      setShowResults(true);
      toast.success(`Set workspace ID to: ${inputWorkspaceId}`);
    } else {
      toast.error('Please enter a workspace ID');
    }
  };
  
  // Fetch data when workspace ID changes
  useEffect(() => {
    if (workspaceId && showResults) {
      fetchWebhookEvents();
      fetchWebhookStats();
    }
  }, [workspaceId, showResults, fetchWebhookEvents, fetchWebhookStats]);
  
  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Email Bison Webhook Test</h1>
      
      {/* Workspace ID Input */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">1. Set Workspace ID</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputWorkspaceId}
            onChange={(e) => setInputWorkspaceId(e.target.value)}
            placeholder="Enter workspace ID"
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={handleSetWorkspace}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Set Workspace
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Enter a workspace ID to fetch webhook events. This should be a UUID from your database.
        </p>
      </div>
      
      {/* Webhook URL Information */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">2. Webhook URL</h2>
        <p>Your webhook URL for Email Bison is:</p>
        <code className="block p-2 mt-2 bg-gray-800 text-white rounded">
          {typeof window !== 'undefined' ? `${window.location.origin}/api/email-bison-webhook` : '/api/email-bison-webhook'}
        </code>
        <p className="mt-2">
          Use this URL in Email Bison's webhook configuration. If using ngrok, check the ngrok web interface 
          at <a href="http://localhost:4040" target="_blank" className="text-blue-500 hover:underline">http://localhost:4040</a> to 
          get your public URL.
        </p>
      </div>
      
      {showResults && (
        <>
          {/* Webhook Events */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">3. Webhook Events</h2>
              <button
                onClick={() => fetchWebhookEvents()}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {error && (
              <div className="p-4 mb-4 bg-red-100 text-red-800 rounded">
                Error: {error}
              </div>
            )}
            
            {loading ? (
              <div className="p-4 text-center">Loading webhook events...</div>
            ) : webhookEvents.length > 0 ? (
              <div className="border rounded overflow-hidden">
                <div className="bg-gray-100 p-3 border-b font-medium">
                  Total Events: {totalEvents}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {webhookEvents.map((event) => (
                    <div key={event.id} className="p-3 border-b">
                      <div className="font-medium text-blue-600">{event.event_type}</div>
                      <div className="text-sm text-gray-600 mb-1">
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                      {event.lead_email && (
                        <div className="text-sm">
                          <span className="font-medium">Lead:</span> {event.lead_name} ({event.lead_email})
                        </div>
                      )}
                      {event.email_subject && (
                        <div className="text-sm">
                          <span className="font-medium">Subject:</span> {event.email_subject}
                        </div>
                      )}
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            const el = document.getElementById(`data-${event.id}`);
                            if (el) el.classList.toggle('hidden');
                          }}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Toggle Raw Data
                        </button>
                        <pre
                          id={`data-${event.id}`}
                          className="hidden mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto"
                        >
                          {JSON.stringify(event.event_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center border rounded">
                No webhook events found. Send a webhook from Email Bison to see data here.
              </div>
            )}
          </div>
          
          {/* Webhook Stats */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">4. Webhook Stats</h2>
              <button
                onClick={() => fetchWebhookStats()}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                disabled={statsLoading}
              >
                {statsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {statsLoading ? (
              <div className="p-4 text-center">Loading webhook stats...</div>
            ) : webhookStats ? (
              <div className="border rounded overflow-hidden">
                <div className="bg-gray-100 p-3 border-b font-medium">
                  Total Events: {webhookStats.totalEvents}
                </div>
                <div className="p-3">
                  <h3 className="font-medium mb-2">Events by Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(webhookStats.eventsByType || {}).map(([type, count]) => (
                      <div key={type} className="p-2 bg-gray-50 rounded">
                        <span className="font-medium">{type}:</span> {count}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center border rounded">
                No webhook stats available.
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Manual Test Section */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">5. Test Manually</h2>
        <p className="mb-2">
          You can test the webhook by sending a POST request to your webhook URL. Example using fetch:
        </p>
        <button 
          onClick={() => {
            const testEndpoint = '/api/email-bison-webhook';
            toast.loading('Sending test webhook...');
            fetch(testEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-email-bison-signature': 'test-signature'
              },
              body: JSON.stringify({
                "event": {
                  "type": "EMAIL_SENT",
                  "name": "Email Sent",
                  "workspace_id": workspaceId,
                  "workspace_name": "Test Workspace"
                },
                "data": {
                  "scheduled_email": {
                    "id": 4,
                    "email_subject": "Test Subject",
                    "email_body": "<p>Test Body</p>",
                    "status": "sent"
                  },
                  "lead": {
                    "id": 1,
                    "email": "test@example.com",
                    "first_name": "Test",
                    "last_name": "User"
                  },
                  "campaign": {
                    "id": 2,
                    "name": "Test Campaign"
                  },
                  "sender_email": {
                    "id": 3,
                    "name": "Sender",
                    "email": "sender@example.com"
                  }
                }
              })
            })
            .then(response => response.json())
            .then(data => {
              console.log('Response:', data);
              toast.success('Test webhook sent successfully');
              // Refresh the data after a short delay
              setTimeout(() => {
                fetchWebhookEvents();
                fetchWebhookStats();
              }, 1000);
            })
            .catch(error => {
              console.error('Error:', error);
              toast.error('Failed to send test webhook');
            });
          }}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Send Test Webhook
        </button>
        
        <p className="mb-2">
          You can also test manually using fetch in the browser console:
        </p>
        <pre className="p-3 bg-gray-800 text-white text-sm rounded overflow-x-auto">
{`fetch('/api/email-bison-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-email-bison-signature': 'test-signature'
  },
  body: JSON.stringify({
    "event": {
      "type": "EMAIL_SENT",
      "name": "Email Sent",
      "workspace_id": 1,
      "workspace_name": "Test Workspace"
    },
    "data": {
      "scheduled_email": {
        "id": 4,
        "email_subject": "Test Subject",
        "email_body": "<p>Test Body</p>",
        "status": "sent"
      },
      "lead": {
        "id": 1,
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User"
      },
      "campaign": {
        "id": 2,
        "name": "Test Campaign"
      },
      "sender_email": {
        "id": 3,
        "name": "Sender",
        "email": "sender@example.com"
      }
    }
  })
})
.then(response => response.json())
.then(data => console.log('Response:', data))
.catch(error => console.error('Error:', error));`}
        </pre>
      </div>
    </div>
  );
}
