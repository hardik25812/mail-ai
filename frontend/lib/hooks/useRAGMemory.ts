import { useState, useEffect, useCallback, useRef } from 'react';
import ragMemoryService, { 
  PastReply, 
  RAGPromptContext, 
  RAGGenerationResult 
} from '../services/rag-memory-service';
import { toast } from 'sonner';
import logger from '../logging-service';

/**
 * Hook to access and manage RAG memory past replies for an inbox
 */
export function usePastReplies(inboxId?: string, limit: number = 10) {
  const [pastReplies, setPastReplies] = useState<PastReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetchPastReplies = useCallback(async () => {
    if (!inboxId) return;
    
    try {
      setLoading(true);
      logger.info('Fetching past replies', { inboxId, limit });
      const data = await ragMemoryService.getPastReplies(inboxId, limit);
      
      if (isMounted.current) {
        setPastReplies(data);
        setError(null);
      }
    } catch (err) {
      logger.error('Error fetching past replies', { error: err, inboxId });
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch past replies'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [inboxId, limit]);

  // Delete a past reply
  const deletePastReply = useCallback(async (replyId: string) => {
    try {
      await ragMemoryService.deletePastReply(replyId);
      setPastReplies(current => current.filter(reply => reply.id !== replyId));
      toast.success('Reply removed from memory');
    } catch (err) {
      logger.error('Error deleting past reply', { error: err, replyId });
      toast.error('Failed to remove reply from memory');
    }
  }, []);

  // Save a new reply to memory
  const saveReplyToMemory = useCallback(async (params: {
    inbox_id: string;
    thread_id: string;
    email_id: string;
    reply_content: string;
  }) => {
    try {
      const savedReply = await ragMemoryService.saveReplyToMemory(params);
      setPastReplies(current => [savedReply, ...current].slice(0, limit));
      toast.success('Reply saved to memory');
      return savedReply;
    } catch (err) {
      logger.error('Error saving reply to memory', { error: err, params });
      toast.error('Failed to save reply to memory');
      throw err;
    }
  }, [limit]);

  useEffect(() => {
    if (inboxId) {
      fetchPastReplies();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [inboxId, fetchPastReplies]);

  return {
    pastReplies,
    loading,
    error,
    refetch: fetchPastReplies,
    deletePastReply,
    saveReplyToMemory
  };
}

/**
 * Hook to generate memory-enhanced AI replies
 */
export function useEnhancedReplies() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<RAGGenerationResult | null>(null);

  // Generate an enhanced reply using RAG memory
  const generateEnhancedReply = useCallback(async (emailId: string) => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Generating enhanced reply', { emailId });
      
      const perfEnd = logger.startPerformanceMeasurement('generate_enhanced_reply');
      const result = await ragMemoryService.generateEnhancedReply(emailId);
      perfEnd();
      
      setLastResult(result);
      return result;
    } catch (err) {
      logger.error('Error generating enhanced reply', { error: err, emailId });
      setError(err instanceof Error ? err : new Error('Failed to generate enhanced reply'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get similar replies for context without generating a new reply
  const getSimilarReplies = useCallback(async (params: {
    inbox_id: string;
    email_id?: string;
    thread_id?: string;
    query_text: string;
    limit?: number;
  }) => {
    try {
      logger.info('Getting similar replies', params);
      return await ragMemoryService.getSimilarReplies(params);
    } catch (err) {
      logger.error('Error getting similar replies', { error: err, params });
      return { past_replies: [] };
    }
  }, []);

  return {
    generateEnhancedReply,
    getSimilarReplies,
    loading,
    error,
    lastResult
  };
}

/**
 * Hook to get memory system statistics
 */
export function useMemoryStats(workspaceId?: string) {
  const [stats, setStats] = useState<{
    total_memories: number;
    memories_by_inbox: { inbox_id: string; count: number }[];
    average_similarity_score: number;
    memory_usage_bytes: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetchStats = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      setLoading(true);
      logger.info('Fetching memory stats', { workspaceId });
      const data = await ragMemoryService.getMemoryStats(workspaceId);
      
      if (isMounted.current) {
        setStats(data);
        setError(null);
      }
    } catch (err) {
      logger.error('Error fetching memory stats', { error: err, workspaceId });
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch memory stats'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      fetchStats();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [workspaceId, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}
