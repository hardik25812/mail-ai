'use client';

import { useState } from 'react';
import { 
  useEmailStats, 
  useResponseTimeStats, 
  useEmailTimeSeries, 
  useEmailTypeDistribution,
  useAnalyticsExport
} from '../../lib/hooks/useAnalytics';
import { toast } from 'sonner';

export default function AnalyticsTestComponent() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '365d'>('30d');
  const [workspaceId, setWorkspaceId] = useState('workspace-1');
  
  // Use our analytics hooks
  const { stats: emailStats, loading: emailStatsLoading, error: emailStatsError, refetch: refetchEmailStats } = 
    useEmailStats(timeRange, workspaceId);
  
  const { stats: responseTimeStats, loading: responseTimeLoading, error: responseTimeError } = 
    useResponseTimeStats(timeRange, workspaceId);
  
  const { data: timeSeriesData, loading: timeSeriesLoading, error: timeSeriesError } = 
    useEmailTimeSeries(timeRange, 'day', workspaceId);
  
  const { data: typeDistribution, loading: typeDistLoading, error: typeDistError } = 
    useEmailTypeDistribution(timeRange, workspaceId);
  
  const { exportData, loading: exportLoading } = useAnalyticsExport();
  
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      await exportData(timeRange, format, workspaceId);
    } catch (error) {
      console.error('Export error:', error);
    }
  };
  
  const handleRefresh = () => {
    toast.info('Refreshing analytics data...');
    refetchEmailStats();
  };
  
  if (emailStatsLoading || responseTimeLoading || timeSeriesLoading || typeDistLoading) {
    return <div className="p-4">Loading analytics data...</div>;
  }
  
  if (emailStatsError || responseTimeError || timeSeriesError || typeDistError) {
    return (
      <div className="p-4 text-red-500">
        Error loading analytics data. Please try again later.
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Test Dashboard</h1>
      
      {/* Controls */}
      <div className="mb-6 flex items-center gap-4">
        <div>
          <label className="mr-2">Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </select>
        </div>
        
        <button 
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Refresh Data
        </button>
        
        <div className="ml-auto">
          <button 
            onClick={() => handleExport('csv')}
            disabled={exportLoading}
            className="bg-green-500 text-white px-4 py-1 rounded mr-2"
          >
            Export CSV
          </button>
          <button 
            onClick={() => handleExport('json')}
            disabled={exportLoading}
            className="bg-purple-500 text-white px-4 py-1 rounded"
          >
            Export JSON
          </button>
        </div>
      </div>
      
      {/* Email Stats */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Email Statistics</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-sm text-gray-500">Total Emails</div>
            <div className="text-2xl font-bold">{emailStats?.total || 0}</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-sm text-gray-500">Received</div>
            <div className="text-2xl font-bold">{emailStats?.received || 0}</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-sm text-gray-500">Sent</div>
            <div className="text-2xl font-bold">{emailStats?.sent || 0}</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-sm text-gray-500">AI Replies</div>
            <div className="text-2xl font-bold">{emailStats?.auto_replied || 0}</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-sm text-gray-500">Growth</div>
          <div className={`font-bold ${emailStats?.growth_percentage && emailStats.growth_percentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {emailStats?.growth_percentage || 0}%
          </div>
        </div>
      </div>
      
      {/* Response Time */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Response Time</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-sm text-gray-500">Average Response Time</div>
            <div className="text-2xl font-bold">{responseTimeStats?.average_minutes || 0} min</div>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-sm text-gray-500">Improvement</div>
            <div className={`font-bold ${responseTimeStats?.improvement_percentage && responseTimeStats.improvement_percentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {responseTimeStats?.improvement_percentage || 0}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Time Series Data */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Email Activity Over Time</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Received</th>
                <th className="px-4 py-2 text-left">Replied</th>
                <th className="px-4 py-2 text-left">AI Replied</th>
              </tr>
            </thead>
            <tbody>
              {timeSeriesData?.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.received}</td>
                  <td className="px-4 py-2">{item.replied}</td>
                  <td className="px-4 py-2">{item.autoReplied}</td>
                </tr>
              ))}
              {(!timeSeriesData || timeSeriesData.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center text-gray-500">No time series data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Email Type Distribution */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Email Type Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          {typeDistribution?.map((item, index) => (
            <div key={index} className="bg-gray-100 p-3 rounded">
              <div className="text-sm text-gray-500">{item.name}</div>
              <div className="text-2xl font-bold">{item.value}</div>
            </div>
          ))}
          {(!typeDistribution || typeDistribution.length === 0) && (
            <div className="col-span-3 p-3 text-center text-gray-500">
              No email type distribution data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
