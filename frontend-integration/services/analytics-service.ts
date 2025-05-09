import apiClient from '../api-client';

export interface AnalyticsPeriod {
  start_date: string;
  end_date: string;
}

export interface EmailStats {
  total_emails: number;
  received_emails: number;
  sent_emails: number;
  auto_replied_emails: number;
  growth_percentage: number;
}

export interface ResponseTimeStats {
  average_response_time: number; // in minutes
  fastest_response_time: number;
  slowest_response_time: number;
  improvement_percentage: number;
}

export interface MeetingStats {
  scheduled_meetings: number;
  completed_meetings: number;
  cancelled_meetings: number;
  growth_percentage: number;
}

export interface TimeSeriesData {
  date: string;
  received: number;
  replied: number;
  auto_replied: number;
}

export interface EmailTypesData {
  name: string;
  value: number;
}

export const AnalyticsService = {
  getEmailStats: async (period: string = '30d'): Promise<EmailStats> => {
    const { data } = await apiClient.get('/analytics/email-stats', { params: { period } });
    return data;
  },

  getResponseTimeStats: async (period: string = '30d'): Promise<ResponseTimeStats> => {
    const { data } = await apiClient.get('/analytics/response-time', { params: { period } });
    return data;
  },

  getMeetingStats: async (period: string = '30d'): Promise<MeetingStats> => {
    const { data } = await apiClient.get('/analytics/meeting-stats', { params: { period } });
    return data;
  },
  
  getEmailTimeSeries: async (period: string = '30d', groupBy: string = 'day'): Promise<TimeSeriesData[]> => {
    const { data } = await apiClient.get('/analytics/email-time-series', { 
      params: { period, group_by: groupBy } 
    });
    return data;
  },
  
  getEmailTypes: async (period: string = '30d'): Promise<EmailTypesData[]> => {
    const { data } = await apiClient.get('/analytics/email-types', { params: { period } });
    return data;
  },
  
  // This will need to be implemented on your backend
  exportAnalyticsData: async (period: string = '30d', format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    const { data } = await apiClient.get('/analytics/export', { 
      params: { period, format },
      responseType: 'blob'
    });
    return data;
  }
};

export default AnalyticsService;
