import { useState, useEffect, useCallback, useRef } from 'react';
import { EmailService, Email, Inbox, Thread, EmailFilter } from '../services/email-service';
import { toast } from 'sonner';
import { PaginatedResponse } from '../api-client';

export function useInboxes(workspaceId?: string) {
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Function to fetch inboxes
  const fetchInboxes = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      setLoading(true);
      const data = await EmailService.getInboxes(workspaceId);
      setInboxes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch inboxes'));
      console.error('Error fetching inboxes:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Function to trigger inbox sync
  const syncInbox = useCallback(async (inboxId: string) => {
    try {
      setSyncInProgress(true);
      await EmailService.syncInbox(inboxId);
      await fetchInboxes(); // Refresh inboxes after sync
    } catch (err) {
      console.error('Error syncing inbox:', err);
      toast.error('Failed to sync inbox');
    } finally {
      setSyncInProgress(false);
    }
  }, [fetchInboxes]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!workspaceId) return;
    
    // Set up WebSocket for real-time updates
    const cleanup = EmailService.setupRealTimeUpdates(workspaceId, undefined, fetchInboxes);
    
    return () => {
      cleanup();
    };
  }, [workspaceId, fetchInboxes]);

  // Initial fetch
  useEffect(() => {
    if (workspaceId) {
      fetchInboxes();
    }
  }, [workspaceId, fetchInboxes]);

  return { 
    inboxes, 
    loading, 
    error, 
    syncInbox, 
    syncInProgress, 
    refetch: fetchInboxes 
  };
}

export function useEmails(inboxId: string, workspaceId?: string) {
  const [emailsData, setEmailsData] = useState<PaginatedResponse<Email>>({ 
    data: [], 
    meta: { total: 0, page: 1, limit: 25, totalPages: 0 } 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<EmailFilter>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const isMounted = useRef(true);

  // Function to fetch emails with pagination and filters
  const fetchEmails = useCallback(async (pageNum = page, pageLimit = limit, emailFilters = filters) => {
    if (!inboxId) return;
    
    try {
      setLoading(true);
      const data = await EmailService.getEmails(inboxId, pageNum, pageLimit, emailFilters);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setEmailsData(data);
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch emails'));
        console.error('Error fetching emails:', err);
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

  // Function to trigger AI reply
  const triggerAiReply = async (emailId: string) => {
    try {
      const result = await EmailService.triggerAiReply(emailId);
      // Refresh emails after generating AI reply
      fetchEmails();
      return result;
    } catch (err) {
      console.error('Error triggering AI reply:', err);
      throw err;
    }
  };

  // Function to send an email
  const sendEmail = async (params: {
    recipient: string;
    subject: string;
    body: string;
    thread_id?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: File[];
  }) => {
    try {
      const result = await EmailService.sendEmail({
        inbox_id: inboxId,
        ...params
      });
      // Refresh emails after sending
      fetchEmails();
      return result;
    } catch (err) {
      console.error('Error sending email:', err);
      throw err;
    }
  };
  
  // Function to mark email as read/unread
  const markEmailReadStatus = async (emailId: string, isRead: boolean) => {
    try {
      await EmailService.markEmailReadStatus(emailId, isRead);
      // Update local state to avoid refetching
      setEmailsData(prev => {
        const updatedEmails = prev.data.map(email => 
          email.id === emailId ? { ...email, is_read: isRead } : email
        );
        return { ...prev, data: updatedEmails };
      });
    } catch (err) {
      console.error(`Error marking email as ${isRead ? 'read' : 'unread'}:`, err);
      throw err;
    }
  };
  
  // Function to flag/unflag email
  const toggleEmailFlag = async (emailId: string, isFlagged: boolean) => {
    try {
      await EmailService.toggleEmailFlag(emailId, isFlagged);
      // Update local state
      fetchEmails();
    } catch (err) {
      console.error(`Error ${isFlagged ? 'flagging' : 'unflagging'} email:`, err);
      throw err;
    }
  };

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!inboxId || !workspaceId) return;
    
    // Set up WebSocket for real-time updates
    const cleanup = EmailService.setupRealTimeUpdates(workspaceId, inboxId, () => fetchEmails());
    
    return () => {
      cleanup();
    };
  }, [inboxId, workspaceId, fetchEmails]);

  // Initial fetch
  useEffect(() => {
    if (inboxId) {
      fetchEmails(page, limit, filters);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [inboxId, page, limit, filters, fetchEmails]);

  return { 
    emails: emailsData.data, 
    meta: emailsData.meta,
    loading, 
    error, 
    triggerAiReply, 
    sendEmail,
    markEmailReadStatus,
    toggleEmailFlag,
    filters,
    updateFilters,
    goToPage,
    changeLimit,
    refetch: fetchEmails 
  };
}

export function useEmail(emailId: string, workspaceId?: string) {
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  // Function to fetch a single email
  const fetchEmail = useCallback(async () => {
    if (!emailId) return;

    try {
      setLoading(true);
      const data = await EmailService.getEmail(emailId);
      if (isMounted.current) {
        setEmail(data);
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch email'));
        console.error('Error fetching email:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [emailId]);

  // Function to trigger AI reply for the current email
  const triggerAiReply = async () => {
    if (!emailId) return null;
    
    try {
      const result = await EmailService.triggerAiReply(emailId);
      // Refresh email data
      fetchEmail();
      return result;
    } catch (err) {
      console.error('Error triggering AI reply:', err);
      throw err;
    }
  };
  
  // Mark email as read/unread
  const markReadStatus = async (isRead: boolean) => {
    if (!emailId) return;
    
    try {
      await EmailService.markEmailReadStatus(emailId, isRead);
      if (email) {
        setEmail({ ...email, is_read: isRead });
      }
    } catch (err) {
      console.error(`Error marking email as ${isRead ? 'read' : 'unread'}:`, err);
      throw err;
    }
  };

  // Setup WebSocket for real-time updates to this email
  useEffect(() => {
    if (!emailId || !workspaceId) return;
    
    const cleanup = EmailService.setupRealTimeUpdates(workspaceId, undefined, fetchEmail);
    
    return () => {
      cleanup();
    };
  }, [emailId, workspaceId, fetchEmail]);

  // Initial fetch
  useEffect(() => {
    if (emailId) {
      fetchEmail();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [emailId, fetchEmail]);

  return { 
    email, 
    loading, 
    error, 
    refetch: fetchEmail,
    triggerAiReply,
    markReadStatus
  };
}
