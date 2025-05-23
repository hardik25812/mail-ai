import { useState, useEffect } from 'react';
import emailBisonApi from '../api/email-bison-api';
import type { EmailBisonInbox } from '../types/email-bison';
import { toast } from 'sonner';

export function useInboxes() {
  const [inboxes, setInboxes] = useState<EmailBisonInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    const fetchInboxes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching inboxes from Email Bison API...');
        const response = await emailBisonApi.inboxes.getAll();
        
        // Log the response for debugging
        console.log('Raw inboxes response:', response);
        
        // Handle both response formats - with or without data property
        if (response && response.data) {
          console.log(`Found ${response.data.length} inboxes`);
          setInboxes(response.data);
          setMeta(response.meta || null);
          toast.success(`Loaded ${response.data.length} inboxes`);
        } else if (Array.isArray(response)) {
          console.log(`Found ${response.length} inboxes (array format)`);
          setInboxes(response);
          toast.success(`Loaded ${response.length} inboxes`);
        } else {
          console.warn('Unexpected response format:', response);
          setInboxes([]);
          toast.warning('No inboxes found or unexpected format');
        }
      } catch (err) {
        const errorMessage = typeof err === 'string' ? err : 'Failed to fetch inboxes';
        setError(errorMessage);
        console.error('Error in useInboxes hook:', err);
        toast.error('Failed to load inboxes', {
          description: errorMessage
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInboxes();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Refetching inboxes from Email Bison API...');
      const response = await emailBisonApi.inboxes.getAll();
      
      console.log('Raw refetch response:', response);
      
      // Handle both response formats consistently
      if (response && response.data) {
        console.log(`Refetched ${response.data.length} inboxes`);
        setInboxes(response.data);
        setMeta(response.meta || null);
        toast.success(`Refreshed ${response.data.length} inboxes`);
        return response.data;
      } else if (Array.isArray(response)) {
        console.log(`Refetched ${response.length} inboxes (array format)`);
        setInboxes(response);
        toast.success(`Refreshed ${response.length} inboxes`);
        return response;
      } else {
        console.warn('Unexpected refetch response format:', response);
        setInboxes([]);
        toast.warning('No inboxes found or unexpected format');
        return [];
      }
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 'Failed to fetch inboxes';
      setError(errorMessage);
      console.error('Error in refetch inboxes:', err);
      toast.error('Failed to refresh inboxes', {
        description: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { inboxes, loading, error, refetch, meta };
}
