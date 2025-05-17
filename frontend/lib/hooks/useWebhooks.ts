import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import apiClient from '../api-client';
import { Webhook, ApiResponse } from '../types/api-types';

interface UseWebhooksProps {
  workspaceId?: string;
  autoFetch?: boolean;
}

export const useWebhooks = ({
  workspaceId,
  autoFetch = true
}: UseWebhooksProps = {}) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchWebhooks = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await apiClient.get<ApiResponse<Webhook[]>>('/webhooks', { 
        params: { workspaceId } 
      });
      
      setWebhooks(data.data);
    } catch (err) {
      console.error('Error fetching webhooks:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch webhooks'));
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);
  
  const createWebhook = useCallback(async (url: string, event: string, secret?: string) => {
    if (!workspaceId) {
      toast.error('Workspace ID is required');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await apiClient.post<ApiResponse<Webhook>>('/webhooks', {
        workspaceId,
        url,
        event,
        secret
      });
      
      // Add the new webhook to the list
      setWebhooks(prev => [...prev, data.data]);
      toast.success('Webhook created successfully');
      
      return data.data;
    } catch (err) {
      console.error('Error creating webhook:', err);
      setError(err instanceof Error ? err : new Error('Failed to create webhook'));
      toast.error('Failed to create webhook');
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);
  
  const updateWebhook = useCallback(async (webhookId: string, updates: {
    url?: string;
    event?: string;
    isActive?: boolean;
    secret?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await apiClient.put<ApiResponse<Webhook>>(`/webhooks/${webhookId}`, updates);
      
      // Update the webhook in the list
      setWebhooks(prev => prev.map(webhook => 
        webhook.id === webhookId ? data.data : webhook
      ));
      
      toast.success('Webhook updated successfully');
      return data.data;
    } catch (err) {
      console.error(`Error updating webhook ${webhookId}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to update webhook'));
      toast.error('Failed to update webhook');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const deleteWebhook = useCallback(async (webhookId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.delete(`/webhooks/${webhookId}`);
      
      // Remove the webhook from the list
      setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
      
      toast.success('Webhook deleted successfully');
      return true;
    } catch (err) {
      console.error(`Error deleting webhook ${webhookId}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to delete webhook'));
      toast.error('Failed to delete webhook');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const testWebhook = useCallback(async (webhookId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await apiClient.post<ApiResponse<any>>(`/webhooks/${webhookId}/test`);
      
      toast.success('Webhook tested successfully');
      return data.data;
    } catch (err) {
      console.error(`Error testing webhook ${webhookId}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to test webhook'));
      toast.error('Failed to test webhook');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);
  
  // Fetch webhooks on mount or when workspace changes
  useEffect(() => {
    if (autoFetch && workspaceId) {
      fetchWebhooks();
    }
  }, [autoFetch, workspaceId, fetchWebhooks]);
  
  return {
    webhooks,
    loading,
    error,
    refetch,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook
  };
};

export default useWebhooks;
