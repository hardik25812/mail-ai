import { useState, useEffect } from 'react';
import { 
  AnalyticsService, 
  EmailStats, 
  ResponseTimeStats, 
  MeetingStats,
  EmailTimeSeriesData,
  EmailTypeData
} from '../services/analytics-service';
import { toast } from 'sonner';

export function useEmailStats(timeRange: string = '30d', workspaceId?: string) {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await AnalyticsService.getEmailStats(timeRange, workspaceId);
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch email stats'));
        console.error('Error fetching email stats:', err);
        toast.error('Failed to load email statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange, workspaceId]);

  return { stats, loading, error, refetch: async () => {
    setLoading(true);
    try {
      const data = await AnalyticsService.getEmailStats(timeRange, workspaceId);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch email stats'));
      console.error('Error fetching email stats:', err);
      toast.error('Failed to load email statistics');
    } finally {
      setLoading(false);
    }
  }}
}

export function useResponseTimeStats(timeRange: string = '30d', workspaceId?: string) {
  const [stats, setStats] = useState<ResponseTimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await AnalyticsService.getResponseTimeStats(timeRange, workspaceId);
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch response time stats'));
        console.error('Error fetching response time stats:', err);
        toast.error('Failed to load response time statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange, workspaceId]);

  return { stats, loading, error, refetch: async () => {
    setLoading(true);
    try {
      const data = await AnalyticsService.getResponseTimeStats(timeRange, workspaceId);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch response time stats'));
      console.error('Error fetching response time stats:', err);
      toast.error('Failed to load response time statistics');
    } finally {
      setLoading(false);
    }
  }};
}

export function useMeetingStats(timeRange: string = '30d', workspaceId?: string) {
  const [stats, setStats] = useState<MeetingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await AnalyticsService.getMeetingStats(timeRange, workspaceId);
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch meeting stats'));
        console.error('Error fetching meeting stats:', err);
        toast.error('Failed to load meeting statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange, workspaceId]);

  return { stats, loading, error, refetch: async () => {
    setLoading(true);
    try {
      const data = await AnalyticsService.getMeetingStats(timeRange, workspaceId);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch meeting stats'));
      console.error('Error fetching meeting stats:', err);
      toast.error('Failed to load meeting statistics');
    } finally {
      setLoading(false);
    }
  }};
}

export function useEmailTimeSeries(timeRange: string = '30d', groupBy: 'day' | 'week' | 'month' = 'day', workspaceId?: string) {
  const [data, setData] = useState<EmailTimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await AnalyticsService.getEmailTimeSeries(timeRange, groupBy, workspaceId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch email time series data'));
        console.error('Error fetching email time series data:', err);
        toast.error('Failed to load email activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, groupBy, workspaceId]);

  return { data, loading, error, refetch: async () => {
    setLoading(true);
    try {
      const result = await AnalyticsService.getEmailTimeSeries(timeRange, groupBy, workspaceId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch email time series data'));
      console.error('Error fetching email time series data:', err);
      toast.error('Failed to load email activity data');
    } finally {
      setLoading(false);
    }
  }};
}

export function useEmailTypeDistribution(timeRange: string = '30d', workspaceId?: string) {
  const [data, setData] = useState<EmailTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await AnalyticsService.getEmailTypeDistribution(timeRange, workspaceId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch email type distribution'));
        console.error('Error fetching email type distribution:', err);
        toast.error('Failed to load email type data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, workspaceId]);

  return { data, loading, error, refetch: async () => {
    setLoading(true);
    try {
      const result = await AnalyticsService.getEmailTypeDistribution(timeRange, workspaceId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch email type distribution'));
      console.error('Error fetching email type distribution:', err);
      toast.error('Failed to load email type data');
    } finally {
      setLoading(false);
    }
  }};
}

// Helper function to export analytics data
export function useAnalyticsExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportData = async (timeRange: string = '30d', format: 'csv' | 'json' = 'csv', workspaceId?: string) => {
    try {
      setLoading(true);
      const blob = await AnalyticsService.exportAnalyticsData(timeRange, format, workspaceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mail-ai-analytics-${timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setError(null);
      toast.success(`Analytics data exported as ${format.toUpperCase()}`); 
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to export analytics data'));
      console.error('Error exporting analytics data:', err);
      toast.error('Failed to export analytics data');
    } finally {
      setLoading(false);
    }
  };

  return { exportData, loading, error };
}
