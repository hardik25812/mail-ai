import apiClient from '../api-client';

export interface BisonWorkspace {
  id: string;
  bison_workspace_id: string;
  name: string;
  status: string;
  bison_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface BisonEmailAccount {
  id: string;
  email: string;
  name: string;
  status: string;
  type: string;
  daily_limit: number;
  emails_sent: number;
  replied: number;
  opened: number;
  unsubscribed: number;
  bounced: number;
  unique_replies: number;
  unique_opens: number;
  total_leads_contacted: number;
  interested: number;
  created_at: string;
  updated_at: string;
}

export interface BisonLead {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  title: string;
  company: string;
  custom_variables: Array<{name: string, value: string}>;
  emails_sent: number;
  opens: number;
  unique_opens: number;
  replies: number;
  unique_replies: number;
  bounces: number;
}

export interface BisonCampaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BisonWebhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const BisonService = {
  // Workspace Management
  getWorkspaces: async () => {
    const { data } = await apiClient.get('/bison/workspaces');
    return data;
  },

  getWorkspaceDetails: async (workspaceId: string) => {
    const { data } = await apiClient.get(`/bison/workspaces/${workspaceId}`);
    return data;
  },

  connectWorkspace: async (bisonApiKey: string, workspaceId: string) => {
    const { data } = await apiClient.post('/bison/connect', { 
      api_key: bisonApiKey,
      workspace_id: workspaceId
    });
    return data;
  },

  disconnectWorkspace: async (workspaceId: string) => {
    const { data } = await apiClient.post(`/bison/disconnect/${workspaceId}`);
    return data;
  },

  // Email Accounts Management
  getEmailAccounts: async (workspaceId: string) => {
    const { data } = await apiClient.get('/bison/email-accounts', {
      params: { workspace_id: workspaceId }
    });
    return data;
  },

  getEmailAccountDetails: async (emailAccountId: string) => {
    const { data } = await apiClient.get(`/bison/email-accounts/${emailAccountId}`);
    return data;
  },

  // Webhook Management
  getWebhooks: async (workspaceId: string) => {
    const { data } = await apiClient.get('/bison/webhooks', {
      params: { workspace_id: workspaceId }
    });
    return data;
  },

  createWebhook: async (params: {
    workspace_id: string;
    url: string;
    events: string[];
  }) => {
    const { data } = await apiClient.post('/bison/webhooks', params);
    return data;
  },

  testWebhook: async (webhookId: string, eventType: string) => {
    const { data } = await apiClient.post(`/bison/webhooks/${webhookId}/test`, {
      event_type: eventType
    });
    return data;
  },

  deleteWebhook: async (webhookId: string) => {
    const { data } = await apiClient.delete(`/bison/webhooks/${webhookId}`);
    return data;
  },

  // Lead Management
  getLeads: async (workspaceId: string, page = 1, limit = 20) => {
    const { data } = await apiClient.get('/bison/leads', {
      params: { workspace_id: workspaceId, page, limit }
    });
    return data;
  },

  getLeadDetails: async (leadId: string) => {
    const { data } = await apiClient.get(`/bison/leads/${leadId}`);
    return data;
  },

  getLeadEmails: async (leadId: string) => {
    const { data } = await apiClient.get(`/bison/leads/${leadId}/emails`);
    return data;
  },

  // Campaign Management
  getCampaigns: async (workspaceId: string, page = 1, limit = 20) => {
    const { data } = await apiClient.get('/bison/campaigns', {
      params: { workspace_id: workspaceId, page, limit }
    });
    return data;
  },

  getCampaignDetails: async (campaignId: string) => {
    const { data } = await apiClient.get(`/bison/campaigns/${campaignId}`);
    return data;
  },

  // Statistics and Analytics
  getEmailStats: async (workspaceId: string, timeRange: string = 'last_30_days') => {
    const { data } = await apiClient.get('/bison/analytics/email-stats', {
      params: { workspace_id: workspaceId, time_range: timeRange }
    });
    return data;
  },

  getCampaignStats: async (campaignId: string) => {
    const { data } = await apiClient.get(`/bison/analytics/campaigns/${campaignId}`);
    return data;
  }
};

export default BisonService;
