// Mock data for development and testing
import { Inbox, Email, EmailThread, Workspace } from './api';

// Mock workspaces
export const mockWorkspaces: Workspace[] = [
  {
    id: 'workspace-1',
    name: 'Default Workspace',
    is_connected: true,
    bison_workspace_id: 'bison-ws-1',
    bison_workspace_name: 'Bison Workspace 1'
  }
];

// Mock inboxes
export const mockInboxes: Inbox[] = [
  {
    id: 'outlook',
    name: 'Outlook',
    email: 'outlook@example.com',
    workspace_id: 'workspace-1',
    active: true,
    email_count: 24,
    unread_count: 5,
    ai_reply_count: 10,
    response_rate: 85
  },
  {
    id: 'gmail',
    name: 'Gmail',
    email: 'gmail@example.com',
    workspace_id: 'workspace-1',
    active: true,
    email_count: 42,
    unread_count: 8,
    ai_reply_count: 15,
    response_rate: 78
  }
];

// Mock email threads
export const mockEmailThreads: Record<string, EmailThread[]> = {
  'outlook': [
    {
      id: 'thread-1',
      subject: 'Meeting Request - Project Updates',
      latest_email: {
        id: 'email-1',
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
        body: 'Hi there, just following up on our last meeting. When can we schedule the next one?',
        received_at: '2025-05-01T14:32:00Z'
      },
      email_count: 3,
      has_unread: true
    },
    {
      id: 'thread-2',
      subject: 'Product Inquiry',
      latest_email: {
        id: 'email-2',
        senderName: 'Sarah Smith',
        senderEmail: 'sarah@company.com',
        body: 'I would like to know more about your product offerings. Do you have a catalog?',
        received_at: '2025-05-02T10:15:00Z'
      },
      email_count: 1,
      has_unread: true
    }
  ],
  'gmail': [
    {
      id: 'thread-3',
      subject: 'Invoice #12345',
      latest_email: {
        id: 'email-3',
        senderName: 'Billing Department',
        senderEmail: 'billing@supplier.com',
        body: 'Please find attached the invoice for your recent purchase.',
        received_at: '2025-05-01T09:45:00Z'
      },
      email_count: 1,
      has_unread: false
    }
  ]
};

// Mock emails in threads
export const mockEmails: Record<string, Email[]> = {
  'thread-1': [
    {
      id: 'email-1-1',
      thread_id: 'thread-1',
      subject: 'Meeting Request - Project Updates',
      body: '<p>Hello,</p><p>I wanted to follow up on our project status. Can we schedule a meeting for next week?</p><p>Best regards,<br/>John</p>',
      sender: 'John Doe <john@example.com>',
      received_at: '2025-04-29T11:20:00Z',
      is_inbound: true,
      is_ai_reply: false
    },
    {
      id: 'email-1-2',
      thread_id: 'thread-1',
      subject: 'Re: Meeting Request - Project Updates',
      body: '<p>Hi John,</p><p>Thanks for reaching out. I\'ll be available next Tuesday at 10 AM. Does that work for you?</p><p>Regards,<br/>AI Assistant</p>',
      sender: 'Your Name <outlook@example.com>',
      received_at: '2025-04-30T09:15:00Z',
      is_inbound: false,
      is_ai_reply: true
    },
    {
      id: 'email-1-3',
      thread_id: 'thread-1',
      subject: 'Re: Meeting Request - Project Updates',
      body: '<p>Hi there,</p><p>Tuesday works perfectly. Just following up on our last meeting. When can we schedule the next one?</p><p>Thanks,<br/>John</p>',
      sender: 'John Doe <john@example.com>',
      received_at: '2025-05-01T14:32:00Z',
      is_inbound: true,
      is_ai_reply: false
    }
  ]
};

// Helper function to get mock data based on the environment
export const usesMockData = (): boolean => {
  // Always return false to force using real API data
  return false;
};
