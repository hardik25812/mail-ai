import apiClient from '../api-client';
import { Email, Thread, Inbox } from '../types';

export const EmailService = {
  // Inbox operations
  getInboxes: async (): Promise<Inbox[]> => {
    const { data } = await apiClient.get('/inboxes');
    return data;
  },

  getInbox: async (inboxId: string): Promise<Inbox> => {
    const { data } = await apiClient.get(`/inboxes/${inboxId}`);
    return data;
  },

  // Email operations
  getEmails: async (inboxId: string, params?: { page?: number; limit?: number }): Promise<Email[]> => {
    const { data } = await apiClient.get(`/emails`, { 
      params: { 
        inbox_id: inboxId,
        ...params
      } 
    });
    return data;
  },

  getEmail: async (emailId: string): Promise<Email> => {
    const { data } = await apiClient.get(`/emails/${emailId}`);
    return data;
  },

  // Thread operations
  getThreads: async (inboxId: string, params?: { page?: number; limit?: number }): Promise<Thread[]> => {
    const { data } = await apiClient.get(`/threads`, { 
      params: { 
        inbox_id: inboxId,
        ...params
      } 
    });
    return data;
  },

  getThread: async (threadId: string): Promise<Thread> => {
    const { data } = await apiClient.get(`/threads/${threadId}`);
    return data;
  },

  // AI Reply operations
  triggerAiReply: async (emailId: string): Promise<{ success: boolean; job_id: string }> => {
    const { data } = await apiClient.post('/trigger-ai-reply', { email_id: emailId });
    return data;
  },

  saveAiReply: async (emailId: string, content: string): Promise<{ success: boolean; email_id: string }> => {
    const { data } = await apiClient.post('/save-ai-reply', { 
      email_id: emailId, 
      content 
    });
    return data;
  },

  // Send operations
  sendEmail: async (params: {
    inbox_id: string;
    recipient: string;
    subject: string;
    body: string;
    thread_id?: string;
    cc?: string[];
    bcc?: string[];
  }): Promise<{ success: boolean; email_id: string }> => {
    const { data } = await apiClient.post('/send-email', params);
    return data;
  },

  // Webhook test (for development)
  testEmailWebhook: async (params: {
    inbox_id: string;
    sender?: string;
    subject?: string;
    body?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post('/test-email-webhook', params);
    return data;
  }
};

export default EmailService;
