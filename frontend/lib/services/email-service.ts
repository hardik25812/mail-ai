import apiClient from '../api-client';

export interface Email {
  id: string;
  inbox_id: string;
  message_id: string;
  thread_id: string;
  subject: string;
  body: string;
  body_html: string | null;
  sender: string;
  recipient: string;
  cc: string[];
  bcc: string[];
  status: string;
  is_draft: boolean;
  is_sent: boolean;
  is_inbound: boolean;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: string;
  subject: string;
  emails: Email[];
}

export interface Inbox {
  id: string;
  name: string;
  email_address: string;
  active: boolean;
  last_synced_at: string | null;
}

export const EmailService = {
  // Get all inboxes
  getInboxes: async () => {
    const { data } = await apiClient.get('/inboxes');
    return data;
  },

  // Get emails for a specific inbox
  getEmails: async (inboxId: string) => {
    const { data } = await apiClient.get('/emails', { params: { inbox_id: inboxId } });
    return data;
  },

  // Get a specific email by ID
  getEmail: async (emailId: string) => {
    const { data } = await apiClient.get(`/emails/${emailId}`);
    return data;
  },

  // Get a thread with all its emails
  getThread: async (threadId: string) => {
    const { data } = await apiClient.get(`/threads/${threadId}`);
    return data;
  },

  // Trigger AI reply for an email
  triggerAiReply: async (emailId: string) => {
    const { data } = await apiClient.post('/trigger-ai-reply', { email_id: emailId });
    return data;
  },

  // Send an email
  sendEmail: async (params: {
    inbox_id: string;
    thread_id?: string;
    recipient: string;
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
  }) => {
    const { data } = await apiClient.post('/send-email', params);
    return data;
  }
};

export default EmailService;
