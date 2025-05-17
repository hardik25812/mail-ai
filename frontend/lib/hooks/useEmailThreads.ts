import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import EmailService from '../services/email-service';
import { EmailThread, PaginatedResponse } from '../types/api-types';

interface UseEmailThreadsProps {
  inboxId?: string;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export const useEmailThreads = ({
  inboxId,
  page = 1,
  limit = 20,
  autoFetch = true
}: UseEmailThreadsProps = {}) => {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<EmailThread>['meta'], 'data'>>({
    total: 0,
    page,
    limit,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchThreads = useCallback(async (p = page, l = limit) => {
    if (!inboxId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await EmailService.getThreads(inboxId, p, l);
      
      setThreads(response.data);
      setPagination(response.meta);
    } catch (err) {
      console.error('Error fetching email threads:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch email threads'));
      toast.error('Failed to load email threads');
    } finally {
      setLoading(false);
    }
  }, [inboxId, page, limit]);

  const changePage = useCallback((newPage: number) => {
    fetchThreads(newPage, limit);
  }, [fetchThreads, limit]);

  const refetch = useCallback(() => {
    fetchThreads(pagination.page, pagination.limit);
  }, [fetchThreads, pagination.page, pagination.limit]);

  // Fetch threads on mount or when inbox changes
  useEffect(() => {
    if (autoFetch && inboxId) {
      fetchThreads();
    }
  }, [autoFetch, inboxId, fetchThreads]);

  return {
    threads,
    loading,
    error,
    pagination,
    refetch,
    changePage
  };
};

export default useEmailThreads;
