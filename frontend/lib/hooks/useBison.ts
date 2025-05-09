import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import BisonService, { 
  BisonWorkspace, 
  BisonEmailAccount,
  BisonLead,
  BisonCampaign,
  BisonWebhook
} from '../services/bison-service';

// Hook for managing Bison workspace connection
export const useWorkspaceConnection = (workspaceId?: string) => {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('API Call: Getting workspace details for workspace ID:', workspaceId);
      const { data } = await BisonService.getWorkspaceDetails(workspaceId);
      console.log('API Response: Workspace details:', data);
      setConnected(data?.bison_connected || false);
    } catch (err: any) {
      setError(err.message || 'Failed to check connection status');
      console.error('Error checking Bison connection:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const connectWorkspace = useCallback(async (apiKey: string) => {
    if (!workspaceId) {
      setError('Workspace ID is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('API Call: Connecting workspace to Email Bison:', { workspaceId });
      await BisonService.connectWorkspace(apiKey, workspaceId);
      console.log('API Response: Successfully connected workspace to Email Bison');
      setConnected(true);
      toast.success('Successfully connected to Email Bison');
    } catch (err: any) {
      setError(err.message || 'Failed to connect workspace');
      toast.error('Failed to connect to Email Bison');
      console.error('Error connecting to Bison:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const disconnectWorkspace = useCallback(async () => {
    if (!workspaceId) {
      setError('Workspace ID is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('API Call: Disconnecting workspace from Email Bison:', { workspaceId });
      await BisonService.disconnectWorkspace(workspaceId);
      console.log('API Response: Successfully disconnected workspace from Email Bison');
      setConnected(false);
      toast.success('Successfully disconnected from Email Bison');
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect workspace');
      toast.error('Failed to disconnect from Email Bison');
      console.error('Error disconnecting from Bison:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      checkConnection();
    }
  }, [workspaceId, checkConnection]);

  return {
    loading,
    connected,
    error,
    connectWorkspace,
    disconnectWorkspace,
    checkConnection
  };
};

// Hook for managing Bison email accounts
export const useEmailAccounts = (workspaceId?: string) => {
  const [loading, setLoading] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<BisonEmailAccount[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchEmailAccounts = useCallback(async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('API Call: Fetching Email Bison email accounts for workspace:', workspaceId);
      const { data } = await BisonService.getEmailAccounts(workspaceId);
      console.log('API Response: Email accounts:', data);
      setEmailAccounts(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch email accounts');
      console.error('Error fetching Bison email accounts:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      fetchEmailAccounts();
    }
  }, [workspaceId, fetchEmailAccounts]);

  return {
    loading,
    emailAccounts,
    error,
    refetch: fetchEmailAccounts
  };
};

// Hook for managing Bison webhooks
export const useWebhooks = (workspaceId?: string) => {
  const [loading, setLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<BisonWebhook[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('API Call: Fetching Email Bison webhooks for workspace:', workspaceId);
      const { data } = await BisonService.getWebhooks(workspaceId);
      console.log('API Response: Webhooks:', data);
      setWebhooks(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch webhooks');
      console.error('Error fetching Bison webhooks:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const createWebhook = useCallback(async (url: string, events: string[]) => {
    if (!workspaceId) {
      setError('Workspace ID is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await BisonService.createWebhook({
        workspace_id: workspaceId,
        url,
        events
      });
      toast.success('Webhook created successfully');
      fetchWebhooks(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create webhook');
      toast.error('Failed to create webhook');
      console.error('Error creating Bison webhook:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, fetchWebhooks]);

  const deleteWebhook = useCallback(async (webhookId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await BisonService.deleteWebhook(webhookId);
      toast.success('Webhook deleted successfully');
      fetchWebhooks(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to delete webhook');
      toast.error('Failed to delete webhook');
      console.error('Error deleting Bison webhook:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchWebhooks]);

  const testWebhook = useCallback(async (webhookId: string, eventType: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await BisonService.testWebhook(webhookId, eventType);
      toast.success('Test webhook triggered successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to test webhook');
      toast.error('Failed to test webhook');
      console.error('Error testing Bison webhook:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (workspaceId) {
      fetchWebhooks();
    }
  }, [workspaceId, fetchWebhooks]);

  return {
    loading,
    webhooks,
    error,
    createWebhook,
    deleteWebhook,
    testWebhook,
    refetch: fetchWebhooks
  };
};

// Hook for managing Bison leads
export const useLeads = (workspaceId?: string, page = 1, limit = 20) => {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<BisonLead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (pageNum = page, pageLimit = limit) => {
    if (!workspaceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, meta } = await BisonService.getLeads(workspaceId, pageNum, pageLimit);
      setLeads(data || []);
      setTotalLeads(meta?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads');
      console.error('Error fetching Bison leads:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, page, limit]);

  useEffect(() => {
    if (workspaceId) {
      fetchLeads();
    }
  }, [workspaceId, page, limit, fetchLeads]);

  return {
    loading,
    leads,
    totalLeads,
    error,
    refetch: fetchLeads
  };
};

// Hook for managing Bison campaigns
export const useCampaigns = (workspaceId?: string, page = 1, limit = 20) => {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<BisonCampaign[]>([]);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async (pageNum = page, pageLimit = limit) => {
    if (!workspaceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, meta } = await BisonService.getCampaigns(workspaceId, pageNum, pageLimit);
      setCampaigns(data || []);
      setTotalCampaigns(meta?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns');
      console.error('Error fetching Bison campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, page, limit]);

  useEffect(() => {
    if (workspaceId) {
      fetchCampaigns();
    }
  }, [workspaceId, page, limit, fetchCampaigns]);

  return {
    loading,
    campaigns,
    totalCampaigns,
    error,
    refetch: fetchCampaigns
  };
};

// Hook for getting Email Bison analytics
export const useEmailStats = (workspaceId?: string, timeRange: string = 'last_30_days') => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (range = timeRange) => {
    if (!workspaceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await BisonService.getEmailStats(workspaceId, range);
      setStats(data || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch email stats');
      console.error('Error fetching Bison email stats:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, timeRange]);

  useEffect(() => {
    if (workspaceId) {
      fetchStats();
    }
  }, [workspaceId, timeRange, fetchStats]);

  return {
    loading,
    stats,
    error,
    refetch: fetchStats
  };
};
