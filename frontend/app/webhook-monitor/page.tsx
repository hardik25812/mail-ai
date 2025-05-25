'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';

interface WebhookStats {
  totalReceived: number;
  newEmailsReceived: number;
  repliesSent: number;
  errors: number;
  lastWebhookAt: string | null;
  emailsStored: number;
}

interface Email {
  messageId: string;
  subject: string;
  sender: string;
  status: string;
  receivedAt: string;
  storedAt: string;
  updatedAt?: string;
}

export default function WebhookMonitorPage() {
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Fetch webhook stats
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:4001/webhook/email-bison/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching webhook stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch webhook statistics',
        variant: 'destructive',
      });
    }
  };

  // Fetch stored emails (this would be implemented in your API)
  const fetchEmails = async () => {
    // This is a placeholder - in production, you would have an API endpoint to fetch emails
    try {
      // This is mocked for demo purposes
      // In production, make a real API call: 
      // const response = await fetch('http://localhost:4001/api/emails');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockEmails: Email[] = [
        {
          messageId: 'msg_123456',
          subject: 'Meeting tomorrow',
          sender: 'john@example.com',
          status: 'replied',
          receivedAt: new Date(Date.now() - 3600000).toISOString(),
          storedAt: new Date(Date.now() - 3590000).toISOString(),
          updatedAt: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          messageId: 'msg_789012',
          subject: 'Project update',
          sender: 'sarah@example.com',
          status: 'received',
          receivedAt: new Date(Date.now() - 7200000).toISOString(),
          storedAt: new Date(Date.now() - 7190000).toISOString(),
        },
        {
          messageId: 'msg_345678',
          subject: 'Weekly report',
          sender: 'team@example.com',
          status: 'no_reply_needed',
          receivedAt: new Date(Date.now() - 86400000).toISOString(),
          storedAt: new Date(Date.now() - 86390000).toISOString(),
          updatedAt: new Date(Date.now() - 86380000).toISOString(),
        },
      ];
      
      setEmails(mockEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch emails',
        variant: 'destructive',
      });
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchEmails()]);
    setLoading(false);
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
    
    // Set up polling every 30 seconds
    const interval = setInterval(refreshData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'replied':
        return <Badge className="bg-green-500">Replied</Badge>;
      case 'received':
        return <Badge className="bg-blue-500">Received</Badge>;
      case 'read':
        return <Badge className="bg-purple-500">Read</Badge>;
      case 'no_reply_needed':
        return <Badge className="bg-yellow-500">No Reply Needed</Badge>;
      case 'reply_failed':
        return <Badge className="bg-red-500">Reply Failed</Badge>;
      case 'processing_error':
        return <Badge className="bg-red-700">Error</Badge>;
      case 'user_replied':
        return <Badge className="bg-indigo-500">User Replied</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Email Bison Webhook Monitor</h1>
        <Button 
          onClick={refreshData} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Tabs 
        defaultValue="overview" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Statistics Overview</TabsTrigger>
          <TabsTrigger value="emails">Email Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total Webhooks</CardTitle>
                  <CardDescription>All webhook events received</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.totalReceived}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Last received: {stats.lastWebhookAt ? new Date(stats.lastWebhookAt).toLocaleString() : 'Never'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">New Emails</CardTitle>
                  <CardDescription>Incoming email events</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.newEmailsReceived}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Total stored: {stats.emailsStored}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">AI Replies</CardTitle>
                  <CardDescription>Automated responses sent</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.repliesSent}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Reply rate: {stats.newEmailsReceived > 0 
                      ? `${((stats.repliesSent / stats.newEmailsReceived) * 100).toFixed(1)}%` 
                      : '0%'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Errors</CardTitle>
                  <CardDescription>Processing failures</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.errors}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Error rate: {stats.totalReceived > 0 
                      ? `${((stats.errors / stats.totalReceived) * 100).toFixed(1)}%` 
                      : '0%'}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">
                {loading ? 'Loading statistics...' : 'No statistics available'}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="emails" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Events</CardTitle>
              <CardDescription>
                Showing the latest emails processed through webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Subject</th>
                        <th className="text-left py-3 px-4">From</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Received</th>
                        <th className="text-left py-3 px-4">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emails.map((email) => (
                        <tr key={email.messageId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{email.subject}</td>
                          <td className="py-3 px-4">{email.sender}</td>
                          <td className="py-3 px-4">{getStatusBadge(email.status)}</td>
                          <td className="py-3 px-4">{new Date(email.receivedAt).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            {email.updatedAt 
                              ? new Date(email.updatedAt).toLocaleString() 
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">
                    {loading ? 'Loading emails...' : 'No emails available'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
