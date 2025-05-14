import { useState, useEffect, useCallback, useRef } from 'react';
import { EmailService, Thread, EmailFilter } from '../services/email-service';
import { toast } from 'sonner';
import { PaginatedResponse } from '../api-client';

export function useThreads(inboxId: string, workspaceId?: string) {
  const [threadsData, setThreadsData] = useState<PaginatedResponse<Thread>>({ 
    data: [], 
    meta: { total: 0, page: 1, limit: 25, totalPages: 0 } 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<EmailFilter>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const isMounted = useRef(true);

  // Function to fetch threads with pagination and filters
  const fetchThreads = useCallback(async (pageNum = page, pageLimit = limit, threadFilters = filters) => {
    if (!inboxId) return;
    
    try {
      setLoading(true);
      const data = await EmailService.getThreads(inboxId, pageNum, pageLimit, threadFilters);
      
      if (isMounted.current) {
        setThreadsData(data);
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch threads'));
        console.error('Error fetching threads:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [inboxId, page, limit, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: EmailFilter) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  // Update pagination
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!inboxId || !workspaceId) return;
    
    // Set up WebSocket for real-time updates
    const cleanup = EmailService.setupRealTimeUpdates(workspaceId, inboxId, () => fetchThreads());
    
    return () => {
      cleanup();
    };
  }, [inboxId, workspaceId, fetchThreads]);

  // Initial fetch
  useEffect(() => {
    if (inboxId) {
      fetchThreads(page, limit, filters);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [inboxId, page, limit, filters, fetchThreads]);

  return { 
    threads: threadsData.data, 
    meta: threadsData.meta,
    loading, 
    error, 
    filters,
    updateFilters,
    goToPage,
    changeLimit,
    refetch: fetchThreads 
  };
}

export function useThread(threadId: string, workspaceId?: string) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  // Function to fetch a single thread
  const fetchThread = useCallback(async () => {
    if (!threadId) return;

    try {
      setLoading(true);
      const data = await EmailService.getThread(threadId);
      if (isMounted.current) {
        setThread(data);
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch thread'));
        console.error('Error fetching thread:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [threadId]);
  
  // Function to send a reply in this thread
  const replyToThread = async (params: {
    subject?: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    attachments?: File[];
  }) => {
    if (!thread || !thread.emails || thread.emails.length === 0) {
      throw new Error('Cannot reply to an empty thread');
    }
    
    // Get the most recent email to determine recipients
    const latestEmail = thread.emails[thread.emails.length - 1];
    const inboxId = latestEmail.inbox_id;
    const recipient = latestEmail.is_inbound ? latestEmail.sender : latestEmail.recipient;
    
    try {
      const result = await EmailService.sendEmail({
        inbox_id: inboxId,
        thread_id: threadId,
        recipient,
        subject: params.subject || `Re: ${thread.subject}`,
        ...params
      });
      
      // Refresh thread data after sending
      fetchThread();
      return result;
    } catch (err) {
      console.error('Error replying to thread:', err);
      throw err;
    }
  };
  
  // Function to trigger AI reply for the latest email in the thread
  const triggerThreadAiReply = async () => {
    if (!thread || !thread.emails || thread.emails.length === 0) {
      throw new Error('Cannot generate AI reply for an empty thread');
    }
    
    // Get the most recent email ID
    const latestEmail = thread.emails[thread.emails.length - 1];
    
    try {
      const result = await EmailService.triggerAiReply(latestEmail.id);
      // Refresh thread data
      fetchThread();
      return result;
    } catch (err) {
      console.error('Error triggering AI reply for thread:', err);
      throw err;
    }
  };

  // Setup WebSocket for real-time updates to this thread
  useEffect(() => {
    if (!threadId || !workspaceId) return;
    
    const cleanup = EmailService.setupRealTimeUpdates(workspaceId, undefined, fetchThread);
    
    return () => {
      cleanup();
    };
  }, [threadId, workspaceId, fetchThread]);

  // Initial fetch
  useEffect(() => {
    if (threadId) {
      fetchThread();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [threadId, fetchThread]);

  return { 
    thread, 
    loading, 
    error, 
    refetch: fetchThread,
    replyToThread,
    triggerAiReply: triggerThreadAiReply
  };
}
