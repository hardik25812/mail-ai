"use client"

import { useState } from 'react';
import { inboxService } from '@/lib/services/inbox-service';
import AnalyticsService from '@/lib/services/analytics-service';

interface ImportStatus {
  inboxes: {
    loading: boolean;
    success: boolean;
    error: string | null;
    data: any[] | null;
  };
  analytics: {
    loading: boolean;
    success: boolean;
    error: string | null;
    data: any | null;
  };
}

export function useEmailBisonImport() {
  const [status, setStatus] = useState<ImportStatus>({
    inboxes: {
      loading: false,
      success: false,
      error: null,
      data: null
    },
    analytics: {
      loading: false,
      success: false,
      error: null,
      data: null
    }
  });

  // Import inboxes from Email Bison
  const importInboxes = async () => {
    try {
      setStatus(prev => ({
        ...prev,
        inboxes: {
          ...prev.inboxes,
          loading: true,
          error: null
        }
      }));

      const data = await inboxService.importInboxesFromEmailBison();
      
      setStatus(prev => ({
        ...prev,
        inboxes: {
          loading: false,
          success: true,
          error: null,
          data
        }
      }));

      return data;
    } catch (error) {
      console.error('Error importing inboxes from Email Bison:', error);
      
      setStatus(prev => ({
        ...prev,
        inboxes: {
          loading: false,
          success: false,
          error: error instanceof Error ? error.message : 'Failed to import inboxes',
          data: null
        }
      }));

      throw error;
    }
  };

  // Import analytics from Email Bison
  const importAnalytics = async () => {
    try {
      setStatus(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          loading: true,
          error: null
        }
      }));

      const data = await AnalyticsService.importStatsFromEmailBison();
      
      setStatus(prev => ({
        ...prev,
        analytics: {
          loading: false,
          success: true,
          error: null,
          data
        }
      }));

      return data;
    } catch (error) {
      console.error('Error importing analytics from Email Bison:', error);
      
      setStatus(prev => ({
        ...prev,
        analytics: {
          loading: false,
          success: false,
          error: error instanceof Error ? error.message : 'Failed to import analytics',
          data: null
        }
      }));

      throw error;
    }
  };

  // Import both inboxes and analytics
  const importAll = async () => {
    try {
      setStatus({
        inboxes: {
          loading: true,
          success: false,
          error: null,
          data: null
        },
        analytics: {
          loading: true,
          success: false,
          error: null,
          data: null
        }
      });

      const [inboxesData, analyticsData] = await Promise.all([
        inboxService.importInboxesFromEmailBison(),
        AnalyticsService.importStatsFromEmailBison()
      ]);

      setStatus({
        inboxes: {
          loading: false,
          success: true,
          error: null,
          data: inboxesData
        },
        analytics: {
          loading: false,
          success: true,
          error: null,
          data: analyticsData
        }
      });

      return { inboxes: inboxesData, analytics: analyticsData };
    } catch (error) {
      console.error('Error importing data from Email Bison:', error);
      
      setStatus(prev => ({
        inboxes: {
          loading: false,
          success: prev.inboxes.success,
          error: prev.inboxes.loading ? (error instanceof Error ? error.message : 'Failed to import inboxes') : prev.inboxes.error,
          data: prev.inboxes.data
        },
        analytics: {
          loading: false,
          success: prev.analytics.success,
          error: prev.analytics.loading ? (error instanceof Error ? error.message : 'Failed to import analytics') : prev.analytics.error,
          data: prev.analytics.data
        }
      }));

      throw error;
    }
  };

  return {
    status,
    importInboxes,
    importAnalytics,
    importAll
  };
}
