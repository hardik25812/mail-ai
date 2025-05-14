import { useState, useEffect, useCallback, useRef } from 'react';
import openAIService, { 
  OpenAICompletionResponse, 
  OpenAIEmailTemplate,
  OpenAIConfig
} from '../services/openai-service';
import { toast } from 'sonner';
import logger from '../logging-service';

/**
 * Hook to generate email replies using OpenAI
 */
export function useEmailGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastReply, setLastReply] = useState<OpenAICompletionResponse | null>(null);

  // Generate an email reply
  const generateEmailReply = useCallback(async (emailId: string, options?: {
    template_id?: string;
    custom_instructions?: string;
    config?: Partial<OpenAIConfig>;
  }) => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Generating email reply', { emailId, options });
      
      const perfEnd = logger.startPerformanceMeasurement('generate_email_reply');
      const result = await openAIService.generateEmailReply(emailId, options);
      perfEnd();
      
      setLastReply(result);
      return result;
    } catch (err) {
      logger.error('Error generating email reply', { error: err, emailId });
      setError(err instanceof Error ? err : new Error('Failed to generate email reply'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate a thread summary
  const generateThreadSummary = useCallback(async (threadId: string) => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Generating thread summary', { threadId });
      
      const result = await openAIService.generateThreadSummary(threadId);
      return result;
    } catch (err) {
      logger.error('Error generating thread summary', { error: err, threadId });
      setError(err instanceof Error ? err : new Error('Failed to generate thread summary'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateEmailReply,
    generateThreadSummary,
    loading,
    error,
    lastReply
  };
}

/**
 * Hook to manage email templates
 */
export function useEmailTemplates() {
  const [templates, setTemplates] = useState<OpenAIEmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  // Fetch email templates
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      logger.info('Fetching email templates');
      const data = await openAIService.getEmailTemplates();
      
      if (isMounted.current) {
        setTemplates(data);
        setError(null);
      }
    } catch (err) {
      logger.error('Error fetching email templates', { error: err });
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch email templates'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Create a new email template
  const createTemplate = useCallback(async (template: Omit<OpenAIEmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      logger.info('Creating email template', { template });
      const newTemplate = await openAIService.createEmailTemplate(template);
      setTemplates(current => [...current, newTemplate]);
      return newTemplate;
    } catch (err) {
      logger.error('Error creating email template', { error: err, template });
      throw err;
    }
  }, []);

  // Update an existing template
  const updateTemplate = useCallback(async (templateId: string, updates: Partial<Omit<OpenAIEmailTemplate, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      logger.info('Updating email template', { templateId, updates });
      const updatedTemplate = await openAIService.updateEmailTemplate(templateId, updates);
      setTemplates(current => 
        current.map(template => 
          template.id === templateId ? updatedTemplate : template
        )
      );
      return updatedTemplate;
    } catch (err) {
      logger.error('Error updating email template', { error: err, templateId });
      throw err;
    }
  }, []);

  // Delete a template
  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      logger.info('Deleting email template', { templateId });
      await openAIService.deleteEmailTemplate(templateId);
      setTemplates(current => current.filter(template => template.id !== templateId));
    } catch (err) {
      logger.error('Error deleting email template', { error: err, templateId });
      throw err;
    }
  }, []);

  // Check OpenAI API key validity
  const checkAPIKey = useCallback(async (apiKey: string) => {
    try {
      logger.info('Checking OpenAI API key validity');
      return await openAIService.checkAPIKey(apiKey);
    } catch (err) {
      logger.error('Error checking API key', { error: err });
      return { valid: false };
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    checkAPIKey
  };
}
