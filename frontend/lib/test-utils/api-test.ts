import { AxiosRequestConfig } from 'axios';
import apiClient from '../api-client';
import logger from '../logging-service';

/**
 * Utility to test API endpoints and measure performance
 */
export class APITester {
  private endpointResults: Map<string, {
    success: boolean;
    duration: number;
    timestamp: number;
    status?: number;
    error?: string;
  }[]> = new Map();

  private maxResultsPerEndpoint = 10;

  /**
   * Test a specific API endpoint and record the results
   */
  async testEndpoint(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<{
    success: boolean;
    duration: number;
    timestamp: number;
    status?: number;
    data?: any;
    error?: string;
  }> {
    const startTime = performance.now();
    let success = false;
    let status: number | undefined;
    let responseData: any;
    let error: string | undefined;

    try {
      let response;
      switch (method) {
        case 'GET':
          response = await apiClient.get(url, config);
          break;
        case 'POST':
          response = await apiClient.post(url, data, config);
          break;
        case 'PUT':
          response = await apiClient.put(url, data, config);
          break;
        case 'DELETE':
          response = await apiClient.delete(url, config);
          break;
        case 'PATCH':
          response = await apiClient.patch(url, data, config);
          break;
      }
      
      success = true;
      status = response.status;
      responseData = response.data;
    } catch (err: any) {
      error = err.message || 'Unknown error';
      if (err.apiError) {
        status = err.apiError.status;
        error = err.apiError.message;
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const timestamp = Date.now();

    const result = {
      success,
      duration,
      timestamp,
      status,
      data: responseData,
      error
    };

    // Store result for this endpoint
    const endpointKey = `${method}:${url}`;
    const existingResults = this.endpointResults.get(endpointKey) || [];
    const newResults = [
      { success, duration, timestamp, status, error },
      ...existingResults
    ].slice(0, this.maxResultsPerEndpoint);
    
    this.endpointResults.set(endpointKey, newResults);

    // Log the result
    this.logTestResult(method, url, result);

    return result;
  }

  /**
   * Get all test results for a specific endpoint
   */
  getEndpointResults(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string
  ): {
    success: boolean;
    duration: number;
    timestamp: number;
    status?: number;
    error?: string;
  }[] {
    const endpointKey = `${method}:${url}`;
    return this.endpointResults.get(endpointKey) || [];
  }

  /**
   * Get performance metrics for a specific endpoint
   */
  getEndpointPerformance(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string
  ): {
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
    sampleSize: number;
  } {
    const results = this.getEndpointResults(method, url);
    
    if (results.length === 0) {
      return {
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        sampleSize: 0
      };
    }

    const durations = results.map(r => r.duration);
    const successCount = results.filter(r => r.success).length;

    return {
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / results.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successCount / results.length) * 100,
      sampleSize: results.length
    };
  }

  /**
   * Run a load test on an endpoint with multiple requests
   */
  async loadTest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    requestCount: number,
    concurrency: number = 1,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<{
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
    totalDuration: number;
  }> {
    const startTime = performance.now();
    const results: {
      success: boolean;
      duration: number;
    }[] = [];

    // Helper function to create batches
    const createBatches = (total: number, batchSize: number) => {
      const batches = [];
      for (let i = 0; i < total; i += batchSize) {
        batches.push(Array(Math.min(batchSize, total - i)).fill(null));
      }
      return batches;
    };

    // Process in batches based on concurrency
    const batches = createBatches(requestCount, concurrency);
    
    logger.info(`Starting load test for ${method} ${url}`, { 
      requestCount, 
      concurrency,
      batchCount: batches.length 
    });

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchResults = await Promise.all(
        batch.map(() => this.testEndpoint(method, url, data, config))
      );
      
      results.push(...batchResults.map(r => ({ success: r.success, duration: r.duration })));
      
      logger.debug(`Completed batch ${i + 1}/${batches.length}`, {
        batchSuccessRate: (batchResults.filter(r => r.success).length / batchResults.length) * 100
      });
    }

    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    
    const durations = results.map(r => r.duration);
    const successCount = results.filter(r => r.success).length;
    
    const loadTestResult = {
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / results.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successCount / results.length) * 100,
      totalDuration: totalDuration
    };

    logger.info(`Load test completed for ${method} ${url}`, loadTestResult);
    
    return loadTestResult;
  }

  /**
   * Clear all stored test results
   */
  clearResults(): void {
    this.endpointResults.clear();
  }

  /**
   * Log test result with appropriate level
   */
  private logTestResult(
    method: string,
    url: string,
    result: {
      success: boolean;
      duration: number;
      status?: number;
      error?: string;
    }
  ): void {
    const logContext = {
      method,
      url,
      durationMs: result.duration.toFixed(2),
      status: result.status,
      error: result.error
    };

    if (result.success) {
      if (result.duration > 1000) {
        logger.warn(`Slow API response: ${method} ${url} (${result.duration.toFixed(2)}ms)`, logContext);
      } else {
        logger.debug(`API test successful: ${method} ${url}`, logContext);
      }
    } else {
      logger.error(`API test failed: ${method} ${url}`, logContext);
    }
  }
}

// Create singleton instance
export const apiTester = new APITester();
export default apiTester;
