import apiClient from '../api-client';
import { toast } from 'sonner';

export interface OpenAIConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAICompletionRequest {
  messages: OpenAIMessage[];
  config?: Partial<OpenAIConfig>;
}

export interface OpenAICompletionResponse {
  reply: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason: string;
  model_used: string;
}

export interface OpenAIEmailTemplate {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  example_input?: string;
  example_output?: string;
  default_config: Partial<OpenAIConfig>;
  created_at: string;
  updated_at: string;
}

class OpenAIService {
  /**
   * Generate a completion using the OpenAI API
   */
  async generateCompletion(request: OpenAICompletionRequest): Promise<OpenAICompletionResponse> {
    try {
      const { data } = await apiClient.post<OpenAICompletionResponse>('/ai/completions', request);
      return data;
    } catch (error) {
      console.error('Error generating OpenAI completion:', error);
      throw error;
    }
  }

  /**
   * Generate an email reply for a specific email using OpenAI
   */
  async generateEmailReply(emailId: string, options?: {
    template_id?: string;
    custom_instructions?: string;
    config?: Partial<OpenAIConfig>;
  }): Promise<OpenAICompletionResponse> {
    try {
      toast.loading('Generating AI email reply...');
      const { data } = await apiClient.post<OpenAICompletionResponse>('/ai/generate-email-reply', {
        email_id: emailId,
        ...options
      });
      toast.success('AI reply generated successfully');
      return data;
    } catch (error) {
      console.error('Error generating email reply:', error);
      toast.error('Failed to generate email reply');
      throw error;
    }
  }

  /**
   * Generate a summary of an email thread
   */
  async generateThreadSummary(threadId: string): Promise<OpenAICompletionResponse> {
    try {
      toast.loading('Generating thread summary...');
      const { data } = await apiClient.post<OpenAICompletionResponse>('/ai/thread-summary', {
        thread_id: threadId
      });
      toast.success('Thread summary generated');
      return data;
    } catch (error) {
      console.error('Error generating thread summary:', error);
      toast.error('Failed to generate thread summary');
      throw error;
    }
  }

  /**
   * Get all available email templates
   */
  async getEmailTemplates(): Promise<OpenAIEmailTemplate[]> {
    try {
      const { data } = await apiClient.get<OpenAIEmailTemplate[]>('/ai/email-templates');
      return data;
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  /**
   * Create a new email template
   */
  async createEmailTemplate(template: Omit<OpenAIEmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<OpenAIEmailTemplate> {
    try {
      toast.loading('Creating email template...');
      const { data } = await apiClient.post<OpenAIEmailTemplate>('/ai/email-templates', template);
      toast.success('Email template created successfully');
      return data;
    } catch (error) {
      console.error('Error creating email template:', error);
      toast.error('Failed to create email template');
      throw error;
    }
  }

  /**
   * Update an existing email template
   */
  async updateEmailTemplate(templateId: string, updates: Partial<Omit<OpenAIEmailTemplate, 'id' | 'created_at' | 'updated_at'>>): Promise<OpenAIEmailTemplate> {
    try {
      toast.loading('Updating email template...');
      const { data } = await apiClient.put<OpenAIEmailTemplate>(`/ai/email-templates/${templateId}`, updates);
      toast.success('Email template updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating email template:', error);
      toast.error('Failed to update email template');
      throw error;
    }
  }

  /**
   * Delete an email template
   */
  async deleteEmailTemplate(templateId: string): Promise<void> {
    try {
      toast.loading('Deleting email template...');
      await apiClient.delete(`/ai/email-templates/${templateId}`);
      toast.success('Email template deleted successfully');
    } catch (error) {
      console.error('Error deleting email template:', error);
      toast.error('Failed to delete email template');
      throw error;
    }
  }

  /**
   * Check API key validity
   */
  async checkAPIKey(apiKey: string): Promise<{ valid: boolean; model?: string; organization?: string }> {
    try {
      const { data } = await apiClient.post<{ valid: boolean; model?: string; organization?: string }>('/ai/check-api-key', { api_key: apiKey });
      return data;
    } catch (error) {
      console.error('Error checking API key:', error);
      return { valid: false };
    }
  }
}

export const openAIService = new OpenAIService();
export default openAIService;
