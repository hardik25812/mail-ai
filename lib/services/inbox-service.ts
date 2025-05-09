import axios from 'axios';

export interface Inbox {
  id: string;
  email: string;
  name?: string;
  bison_inbox_id?: string;
  connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  subject: string;
  from: string;
  sender: string;
  status: 'replied' | 'pending' | 'failed';
  receivedAt: string;
  body?: string;
  message_id?: string;
}

class InboxService {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  
  async getInboxes(): Promise<Inbox[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/inboxes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inboxes:', error);
      
      // Return mock data for development
      return [
        {
          id: '1',
          email: 'sales@company.com',
          name: 'Sales Inbox',
          bison_inbox_id: 'bison-sales-123',
          connected: true,
          created_at: '2025-04-01T00:00:00Z',
          updated_at: '2025-04-28T00:00:00Z'
        },
        {
          id: '2',
          email: 'support@company.com',
          name: 'Support Inbox',
          bison_inbox_id: 'bison-support-456',
          connected: true,
          created_at: '2025-04-01T00:00:00Z',
          updated_at: '2025-04-28T00:00:00Z'
        },
        {
          id: '3',
          email: 'info@company.com',
          name: 'Info Inbox',
          bison_inbox_id: 'bison-info-789',
          connected: true,
          created_at: '2025-04-01T00:00:00Z',
          updated_at: '2025-04-28T00:00:00Z'
        }
      ];
    }
  }
  
  async getInboxById(id: string): Promise<Inbox | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/inboxes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching inbox ${id}:`, error);
      
      // Return mock data for development
      const mockInboxes = [
        {
          id: '1',
          email: 'sales@company.com',
          name: 'Sales Inbox',
          bison_inbox_id: 'bison-sales-123',
          connected: true,
          created_at: '2025-04-01T00:00:00Z',
          updated_at: '2025-04-28T00:00:00Z'
        },
        {
          id: '2',
          email: 'support@company.com',
          name: 'Support Inbox',
          bison_inbox_id: 'bison-support-456',
          connected: true,
          created_at: '2025-04-01T00:00:00Z',
          updated_at: '2025-04-28T00:00:00Z'
        },
        {
          id: '3',
          email: 'info@company.com',
          name: 'Info Inbox',
          bison_inbox_id: 'bison-info-789',
          connected: true,
          created_at: '2025-04-01T00:00:00Z',
          updated_at: '2025-04-28T00:00:00Z'
        }
      ];
      
      return mockInboxes.find(inbox => inbox.id === id) || null;
    }
  }
  
  async getEmailsForInbox(inboxId: string): Promise<Email[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/inboxes/${inboxId}/emails`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching emails for inbox ${inboxId}:`, error);
      
      // Return mock data for development
      return [
        { 
          id: '1', 
          subject: 'Inquiry about your services', 
          from: 'John Smith',
          sender: 'john@example.com', 
          status: 'replied',
          receivedAt: '2025-04-28T10:30:00Z'
        },
        { 
          id: '2', 
          subject: 'Pricing information request', 
          from: 'Emily Johnson',
          sender: 'emily@example.com', 
          status: 'pending',
          receivedAt: '2025-04-28T11:15:00Z'
        },
        { 
          id: '3', 
          subject: 'Support ticket #12345', 
          from: 'David Brown',
          sender: 'david@example.com', 
          status: 'replied',
          receivedAt: '2025-04-28T09:45:00Z'
        },
        { 
          id: '4', 
          subject: 'Partnership Opportunity', 
          from: 'Sarah Wilson',
          sender: 'sarah@example.com', 
          status: 'pending',
          receivedAt: '2025-04-28T14:20:00Z'
        },
        { 
          id: '5', 
          subject: 'Technical Issue with Account', 
          from: 'Michael Davis',
          sender: 'michael@example.com', 
          status: 'failed',
          receivedAt: '2025-04-28T08:10:00Z'
        }
      ];
    }
  }
  
  async importFromEmailBison(): Promise<boolean> {
    try {
      await axios.post(`${this.apiUrl}/inboxes/import-from-email-bison`);
      return true;
    } catch (error) {
      console.error('Error importing from Email Bison:', error);
      return false;
    }
  }
}

export const inboxService = new InboxService();
