import { useState, useEffect, useCallback } from 'react';
import api, { Workspace, Inbox, Email, EmailThread } from '../api';
import { toast } from 'sonner';

// Generic hook for API calls with loading, error, and data states
export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialArgs?: any[],
  executeOnMount: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(executeOnMount);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunction(...(args.length ? args : initialArgs || []));
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, initialArgs?.toString()]
  );

  useEffect(() => {
    if (executeOnMount) {
      execute(...(initialArgs || [])).catch((err) => {
        console.error('Error in useApiCall:', err);
      });
    }
  }, [execute, executeOnMount]);

  return { data, loading, error, execute, setData };
}

// Specialized hooks for specific API endpoints
export function useWorkspaces() {
  const { 
    data: workspaces, 
    loading, 
    error, 
    execute: refetch 
  } = useApiCall<Workspace[]>(api.workspaces.getAll);

  return { workspaces, loading, error, refetch };
}

export function useWorkspace(id: string) {
  const { 
    data: workspace, 
    loading, 
    error, 
    execute: refetch 
  } = useApiCall<Workspace>(api.workspaces.getById, [id]);

  return { workspace, loading, error, refetch };
}

export function useWorkspaceStatus(id: string) {
  const { 
    data: status, 
    loading, 
    error, 
    execute: refetch 
  } = useApiCall(api.workspaces.getStatus, [id]);

  return { status, loading, error, refetch };
}

export function useConnectBison() {
  const [connecting, setConnecting] = useState(false);
  
  const connectBison = async (workspaceId: string, apiKey: string) => {
    setConnecting(true);
    try {
      const result = await api.workspaces.connectBison(workspaceId, apiKey);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      return result;
    } catch (error) {
      toast.error('Failed to connect to Email Bison');
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  return { connectBison, connecting };
}

export function useEmailThreads(inboxId?: string) {
  const { 
    data: threads, 
    loading, 
    error, 
    execute: refetch 
  } = useApiCall<EmailThread[]>(api.emails.getThreads, inboxId ? [inboxId] : []);

  return { threads, loading, error, refetch };
}

export function useEmailThread(threadId: string) {
  const { 
    data: emails, 
    loading, 
    error, 
    execute: refetch 
  } = useApiCall<Email[]>(api.emails.getThread, [threadId]);

  return { emails, loading, error, refetch };
}

export function useTriggerAIReply() {
  const [generating, setGenerating] = useState(false);
  
  const triggerReply = async (emailId: string) => {
    setGenerating(true);
    try {
      toast.loading('Generating AI reply...');
      const result = await api.emails.triggerAIReply(emailId);
      toast.dismiss();
      toast.success('AI reply generated successfully');
      return result;
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate AI reply');
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  return { triggerReply, generating };
}

export function useInboxes() {
  const { 
    data: inboxes, 
    loading, 
    error, 
    execute: refetch 
  } = useApiCall<Inbox[]>(api.inboxes.getAll);

  return { inboxes, loading, error, refetch };
}

export function useInbox(id: string) {
  const { 
    data: inbox, 
    loading, 
    error, 
    execute: refetch 
  } = useApiCall<Inbox>(api.inboxes.getById, [id]);

  return { inbox, loading, error, refetch };
}
