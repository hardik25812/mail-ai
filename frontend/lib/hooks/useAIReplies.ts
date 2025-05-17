import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import apiClient from '../api-client';
import { AIReply, ApiResponse } from '../types/api-types';

interface GenerateReplyParams {
  emailId: string;
  threadId: string;
  inboxId: string;
  prompt?: string;
  model?: string;
}

interface UpdateReplyParams {
  replyId: string;
  content?: string;
  status?: 'draft' | 'sent' | 'failed';
}

export const useAIReplies = () => {
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState<AIReply[]>([]);
  const [selectedReply, setSelectedReply] = useState<AIReply | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Fetch replies for a specific thread
  const fetchRepliesForThread = useCallback(async (threadId: string) => {
    if (!threadId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await apiClient.get<ApiResponse<AIReply[]>>('/ai-replies', { 
        params: { threadId } 
      });
      
      setReplies(data.data);
    } catch (err) {
      console.error('Error fetching AI replies:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch AI replies'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate a new AI reply
  const generateReply = useCallback(async ({ emailId, threadId, inboxId, prompt, model = 'gpt-4' }: GenerateReplyParams) => {
    if (!emailId || !threadId || !inboxId) {
      toast.error('Missing required parameters for generating AI reply');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      toast.loading('Generating AI reply...');
      
      const { data } = await apiClient.post<ApiResponse<AIReply>>('/ai-replies', {
        emailId,
        threadId,
        inboxId,
        prompt,
        model
      });
      
      toast.success('AI reply generation started');
      
      // Add the new reply to the list and select it
      setReplies(prev => [data.data, ...prev]);
      setSelectedReply(data.data);
      
      return data.data;
    } catch (err) {
      console.error('Error generating AI reply:', err);
      setError(err instanceof Error ? err : new Error('Failed to generate AI reply'));
      toast.error('Failed to generate AI reply');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing AI reply
  const updateReply = useCallback(async ({ replyId, content, status }: UpdateReplyParams) => {
    if (!replyId) {
      toast.error('Reply ID is required for updating');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await apiClient.put<ApiResponse<AIReply>>(`/ai-replies/${replyId}`, {
        content,
        status
      });
      
      // Update the reply in the list
      setReplies(prev => prev.map(reply => 
        reply.id === replyId ? data.data : reply
      ));
      
      // Update selected reply if it's the one being edited
      if (selectedReply?.id === replyId) {
        setSelectedReply(data.data);
      }
      
      if (status === 'sent') {
        toast.success('Email reply sent successfully');
      } else {
        toast.success('Reply updated successfully');
      }
      
      return data.data;
    } catch (err) {
      console.error('Error updating AI reply:', err);
      setError(err instanceof Error ? err : new Error('Failed to update AI reply'));
      toast.error('Failed to update reply');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedReply]);

  // Fetch a specific reply by ID
  const fetchReply = useCallback(async (replyId: string) => {
    if (!replyId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await apiClient.get<ApiResponse<AIReply>>(`/ai-replies/${replyId}`);
      setSelectedReply(data.data);
      return data.data;
    } catch (err) {
      console.error(`Error fetching AI reply ${replyId}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to fetch AI reply'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    replies,
    selectedReply,
    error,
    fetchRepliesForThread,
    generateReply,
    updateReply,
    fetchReply,
    setSelectedReply
  };
};

export default useAIReplies;
