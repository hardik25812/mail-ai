/**
 * Logging utility for structured logs
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  serviceName?: string;
  minLevel?: LogLevel;
}

// Simple map to determine if a log level should be shown based on minLevel
const levelOrder: Record<LogLevel, number> = {
  'debug': 0,
  'info': 1,
  'warn': 2,
  'error': 3,
};

export function createLogger(component: string, options: LoggerOptions = {}) {
  const serviceName = options.serviceName || 'mail-ai';
  const minLevel = options.minLevel || 'info';
  
  // Default metadata included with every log
  const baseMetadata = {
    service: serviceName,
    component,
    hostname: process.env.HOSTNAME || 'unknown',
    env: process.env.NODE_ENV || 'development',
  };
  
  // Generic logging function
  function log(level: LogLevel, message: string, metadata: Record<string, any> = {}) {
    if (levelOrder[level] < levelOrder[minLevel]) {
      return; // Skip logs below minLevel
    }
    
    const timestamp = new Date().toISOString();
    const fullMetadata = { ...baseMetadata, ...metadata };
    
    // Format for human-readable console logs
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`,
      Object.keys(metadata).length ? fullMetadata : ''
    );
  }
  
  return {
    debug: (message: string, metadata?: Record<string, any>) => log('debug', message, metadata),
    info: (message: string, metadata?: Record<string, any>) => log('info', message, metadata),
    warn: (message: string, metadata?: Record<string, any>) => log('warn', message, metadata),
    error: (message: string, metadata?: Record<string, any>) => log('error', message, metadata),
  };
}
