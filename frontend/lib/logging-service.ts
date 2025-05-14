/**
 * Comprehensive logging service for the application
 * Provides centralized logging, error tracking, and performance monitoring
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  includeTimestamps: boolean;
  applicationVersion: string;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  tags?: string[];
}

class LoggingService {
  private config: LogConfig = {
    minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    enableConsole: true,
    enableRemote: process.env.NODE_ENV === 'production',
    includeTimestamps: true,
    applicationVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  };

  private logQueue: LogEntry[] = [];
  private isFlushingQueue = false;
  private logLevelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor() {
    // Set up periodic flushing of log queue in browser environments
    if (typeof window !== 'undefined') {
      // Flush logs on page unload
      window.addEventListener('beforeunload', () => this.flushLogQueue(true));
      
      // Periodically flush logs every 30 seconds
      setInterval(() => this.flushLogQueue(), 30000);
    }
  }

  /**
   * Configure the logging service
   */
  configure(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Debug level log
   */
  debug(message: string, context?: Record<string, any>, tags?: string[]): void {
    this.log('debug', message, context, tags);
  }

  /**
   * Info level log
   */
  info(message: string, context?: Record<string, any>, tags?: string[]): void {
    this.log('info', message, context, tags);
  }

  /**
   * Warning level log
   */
  warn(message: string, context?: Record<string, any>, tags?: string[]): void {
    this.log('warn', message, context, tags);
  }

  /**
   * Error level log
   */
  error(message: string, context?: Record<string, any>, tags?: string[]): void {
    this.log('error', message, context, tags);
  }

  /**
   * Log with specified level
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, tags?: string[]): void {
    // Check if we should log based on minimum level
    if (this.logLevelPriority[level] < this.logLevelPriority[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      tags
    };

    // Log to console if enabled
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Queue for remote logging if enabled
    if (this.config.enableRemote) {
      this.logQueue.push(entry);
      
      // Flush immediately for errors or if queue gets too large
      if (level === 'error' || this.logQueue.length >= 20) {
        this.flushLogQueue();
      }
    }
  }

  /**
   * Log to browser console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = this.config.includeTimestamps ? `[${entry.timestamp.split('T')[1].split('.')[0]}] ` : '';
    const prefix = `${timestamp}[${entry.level.toUpperCase()}]`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(`${prefix} ${entry.message}`, entry.context || '');
        break;
      case 'info':
        console.info(`${prefix} ${entry.message}`, entry.context || '');
        break;
      case 'warn':
        console.warn(`${prefix} ${entry.message}`, entry.context || '');
        break;
      case 'error':
        console.error(`${prefix} ${entry.message}`, entry.context || '');
        break;
    }
  }

  /**
   * Flush the log queue to the remote logging endpoint
   */
  private async flushLogQueue(synchronous = false): Promise<void> {
    if (this.isFlushingQueue || this.logQueue.length === 0) {
      return;
    }

    this.isFlushingQueue = true;
    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      const sendLogs = async () => {
        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logs: logsToSend,
            app_version: this.config.applicationVersion,
            environment: process.env.NODE_ENV
          }),
        });
      };

      if (synchronous && typeof navigator !== 'undefined') {
        // Use sendBeacon for synchronous sending (e.g., on page unload)
        const blob = new Blob(
          [JSON.stringify({
            logs: logsToSend,
            app_version: this.config.applicationVersion,
            environment: process.env.NODE_ENV
          })],
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/logs', blob);
      } else {
        await sendLogs();
      }
    } catch (error) {
      // Don't use this.error to avoid infinite recursion
      console.error('Failed to send logs to remote endpoint:', error);
      
      // Put logs back in queue
      this.logQueue = [...logsToSend, ...this.logQueue];
    } finally {
      this.isFlushingQueue = false;
    }
  }

  /**
   * Log a performance measurement
   */
  logPerformance(label: string, durationMs: number, context?: Record<string, any>): void {
    this.info(`Performance: ${label} took ${durationMs.toFixed(2)}ms`, context, ['performance']);
  }

  /**
   * Start a performance measurement
   */
  startPerformanceMeasurement(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.logPerformance(label, duration);
    };
  }

  /**
   * Track an error with additional context
   */
  trackError(error: Error, context?: Record<string, any>, tags?: string[]): void {
    const errorContext = {
      ...context,
      errorName: error.name,
      errorStack: error.stack
    };
    
    this.error(error.message, errorContext, [...(tags || []), 'error_tracked']);
  }
}

// Create a singleton instance
export const logger = new LoggingService();
export default logger;
