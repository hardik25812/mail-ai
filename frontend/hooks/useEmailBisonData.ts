import { useState, useEffect } from 'react';
import emailBisonClient from '../lib/email-bison-client';
import { EmailBisonInbox, ApiResponse, PaginatedResponse } from '../types/email-bison';
import { toast } from 'sonner';

interface UseEmailBisonDataReturn {
  inboxes: EmailBisonInbox[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useEmailBisonData = (): UseEmailBisonDataReturn => {
  const [inboxes, setInboxes] = useState<EmailBisonInbox[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInboxes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await emailBisonClient.get<PaginatedResponse<EmailBisonInbox>>('/inboxes');
      
      // Check if data exists and is valid
      if (response.data && response.data.data) {
        setInboxes(response.data.data);
      } else {
        throw new Error('Invalid response format from Email Bison API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch inbox data';
      
      setError(new Error(errorMessage));
      toast.error('Failed to load inboxes', {
        description: errorMessage,
      });
      console.error('Error fetching inboxes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchInboxes();
  }, []);

  // Function to manually refetch data
  const refetch = async () => {
    await fetchInboxes();
  };

  return {
    inboxes,
    loading,
    error,
    refetch
  };
};

export default useEmailBisonData;
