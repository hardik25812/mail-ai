import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import EmailService from '../services/email-service';
import { Inbox } from '../types/api-types';

interface UseInboxesProps {
  workspaceId?: string;
  autoFetch?: boolean;
}

export const useInboxes = ({
  workspaceId,
  autoFetch = true
}: UseInboxesProps = {}) => {
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInboxes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await EmailService.getInboxes(workspaceId);
      setInboxes(data);
    } catch (err) {
      console.error('Error fetching inboxes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch inboxes'));
      toast.error('Failed to load inboxes');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const refetch = useCallback(() => {
    fetchInboxes();
  }, [fetchInboxes]);

  // Fetch inboxes on mount or when workspace changes
  useEffect(() => {
    if (autoFetch) {
      fetchInboxes();
    }
  }, [autoFetch, fetchInboxes]);

  return {
    inboxes,
    loading,
    error,
    refetch
  };
};

export default useInboxes;
