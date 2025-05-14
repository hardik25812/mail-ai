import apiClient from '../api-client';
import { toast } from 'sonner';

export interface PastReply {
  id: string;
  inbox_id: string;
  thread_id: string;
  email_id: string;
  reply_content: string;
  embedding_vector?: number[];
  created_at: string;
  updated_at: string;
}

export interface RAGPromptContext {
  past_replies: PastReply[];
  similarity_scores?: number[];
}

export interface RAGGenerationResult {
  reply_text: string;
  memory_enhanced: boolean;
  context_used?: RAGPromptContext;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

class RAGMemoryService {
  /**
   * Get past replies for a specific inbox
   */
  async getPastReplies(inboxId: string, limit: number = 10): Promise<PastReply[]> {
    try {
      const { data } = await apiClient.get<PastReply[]>('/rag-memory/past-replies', {
        params: { inbox_id: inboxId, limit }
      });
      return data;
    } catch (error) {
      console.error('Error fetching past replies:', error);
      return [];
    }
  }

  /**
   * Get similar past replies for an email or thread
   */
  async getSimilarReplies(params: {
    inbox_id: string;
    email_id?: string;
    thread_id?: string;
    query_text: string;
    limit?: number;
  }): Promise<RAGPromptContext> {
    try {
      const { data } = await apiClient.post<RAGPromptContext>('/rag-memory/similar-replies', params);
      return data;
    } catch (error) {
      console.error('Error fetching similar replies:', error);
      return { past_replies: [] };
    }
  }

  /**
   * Generate AI reply using RAG memory enhancement
   */
  async generateEnhancedReply(emailId: string): Promise<RAGGenerationResult> {
    try {
      toast.loading('Generating AI reply with memory enhancement...');
      const { data } = await apiClient.post<RAGGenerationResult>('/rag-memory/generate-reply', {
        email_id: emailId
      });
      toast.success('AI reply generated successfully');
      return data;
    } catch (error) {
      console.error('Error generating enhanced reply:', error);
      toast.error('Failed to generate AI reply');
      throw error;
    }
  }

  /**
   * Save a new reply to the memory system
   */
  async saveReplyToMemory(params: {
    inbox_id: string;
    thread_id: string;
    email_id: string;
    reply_content: string;
  }): Promise<PastReply> {
    try {
      const { data } = await apiClient.post<PastReply>('/rag-memory/save-reply', params);
      return data;
    } catch (error) {
      console.error('Error saving reply to memory:', error);
      throw error;
    }
  }

  /**
   * Delete a past reply from memory
   */
  async deletePastReply(replyId: string): Promise<void> {
    try {
      await apiClient.delete(`/rag-memory/past-replies/${replyId}`);
    } catch (error) {
      console.error('Error deleting past reply:', error);
      throw error;
    }
  }

  /**
   * Get memory system statistics
   */
  async getMemoryStats(workspaceId: string): Promise<{
    total_memories: number;
    memories_by_inbox: { inbox_id: string; count: number }[];
    average_similarity_score: number;
    memory_usage_bytes: number;
  }> {
    try {
      const { data } = await apiClient.get(`/rag-memory/stats`, {
        params: { workspace_id: workspaceId }
      });
      return data;
    } catch (error) {
      console.error('Error fetching memory stats:', error);
      throw error;
    }
  }
}

export const ragMemoryService = new RAGMemoryService();
export default ragMemoryService;
