import apiClient from '../api-client';
import { getCachedData, setCachedData } from '../cache-utils';

export interface Inbox {
  id: string;
  name: string;
  email: string;
  provider: string;
  connected: boolean;
  auto_reply_enabled: boolean;
  office_hours_enabled: boolean;
  office_hours_start: string;
  office_hours_end: string;
  created_at: string;
  updated_at: string;
}

export interface InboxCreateParams {
  name: string;
  email: string;
  provider: string;
  auto_reply_enabled?: boolean;
  office_hours_enabled?: boolean;
  office_hours_start?: string;
  office_hours_end?: string;
}

export interface InboxUpdateParams {
  name?: string;
  auto_reply_enabled?: boolean;
  office_hours_enabled?: boolean;
  office_hours_start?: string;
  office_hours_end?: string;
}

const CACHE_KEY_INBOXES = 'inboxes';

export const inboxService = {
  async getInboxes(): Promise<Inbox[]> {
    // Try to get from cache first
    const cachedData = getCachedData<Inbox[]>(CACHE_KEY_INBOXES);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await apiClient.get<Inbox[]>('/inboxes');
    setCachedData(CACHE_KEY_INBOXES, response.data);
    return response.data;
  },

  async getInbox(id: string): Promise<Inbox> {
    const response = await apiClient.get<Inbox>(`/inboxes/${id}`);
    return response.data;
  },

  async createInbox(params: InboxCreateParams): Promise<Inbox> {
    const response = await apiClient.post<Inbox>('/inboxes', params);
    return response.data;
  },

  async updateInbox(id: string, params: InboxUpdateParams): Promise<Inbox> {
    const response = await apiClient.put<Inbox>(`/inboxes/${id}`, params);
    return response.data;
  },

  async deleteInbox(inboxId: string): Promise<void> {
    await apiClient.delete(`/inboxes/${inboxId}`);
    
    // Remove from cache
    const cachedInboxes = getCachedData<Inbox[]>(CACHE_KEY_INBOXES);
    
    if (cachedInboxes) {
      const updatedInboxes = cachedInboxes.filter(inbox => inbox.id !== inboxId);
      setCachedData(CACHE_KEY_INBOXES, updatedInboxes);
    }
  },
  
  async importInboxesFromEmailBison(): Promise<Inbox[]> {
    const { data } = await apiClient.post<Inbox[]>('/inboxes/import-from-email-bison');
    
    // Update cache
    setCachedData(CACHE_KEY_INBOXES, data);
    
    return data;
  }
};
