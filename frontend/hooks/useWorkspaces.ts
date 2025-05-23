import { useState, useEffect } from 'react';
import emailBisonApi from '../api/email-bison-api';
import type { EmailBisonWorkspace } from '../types/email-bison';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<EmailBisonWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching workspaces from Email Bison API...');
        const response = await emailBisonApi.workspaces.getAll();
        
        console.log('Raw workspaces response:', response);
        
        // Handle both response formats - with or without data property
        if (response && response.data) {
          console.log(`Found ${response.data.length} workspaces`);
          setWorkspaces(response.data);
          setMeta(response.meta || null);
        } else if (Array.isArray(response)) {
          console.log(`Found ${response.length} workspaces (array format)`);
          setWorkspaces(response);
        } else {
          console.warn('Unexpected response format:', response);
          setWorkspaces([]);
        }
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to fetch workspaces');
        console.error('Error in useWorkspaces hook:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Refetching workspaces from Email Bison API...');
      const response = await emailBisonApi.workspaces.getAll();
      
      console.log('Raw workspaces refetch response:', response);
      
      // Handle both response formats consistently
      if (response && response.data) {
        console.log(`Refetched ${response.data.length} workspaces`);
        setWorkspaces(response.data);
        setMeta(response.meta || null);
        return response.data;
      } else if (Array.isArray(response)) {
        console.log(`Refetched ${response.length} workspaces (array format)`);
        setWorkspaces(response);
        return response;
      } else {
        console.warn('Unexpected refetch response format:', response);
        setWorkspaces([]);
        return [];
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to fetch workspaces');
      console.error('Error in refetch workspaces:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { workspaces, loading, error, refetch, meta };
}
