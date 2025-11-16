/**
 * Centralized Logger Utility
 *
 * Provides structured logging for all platform API interactions
 * with support for file rotation, multiple log levels, and JSON formatting.
 *
 * IMPORTANT: This logger works in both browser and server (Node.js/Deno) environments:
 * - Browser: Logs to console only (no file logging)
 * - Server: Logs to console AND files with rotation
 */

// Conditional imports - only load winston in Node.js/Deno environment
let winston: any;
let DailyRotateFile: any;

const isServer = typeof window === 'undefined';

if (isServer) {
  try {
    winston = await import('winston');
    DailyRotateFile = (await import('winston-daily-rotate-file')).default;
  } catch (error) {
    console.warn('Winston not available in this environment, using console logging only');
  }
}

// Define log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Logger configuration interface
interface LoggerConfig {
  level: string;
  enableFileLogging: boolean;
  logDirectory: string;
  enableJsonFormat: boolean;
}

// Environment-based configuration
const getLoggerConfig = (): LoggerConfig => {
  // Check if we're in browser environment
  const isBrowser = typeof window !== 'undefined';

  return {
    level: isBrowser
      ? (window as any).__LOG_LEVEL__ || 'info'
      : (typeof process !== 'undefined' ? process.env.LOG_LEVEL : 'info') || 'info',
    enableFileLogging: isBrowser
      ? false // Browser cannot write to files
      : (typeof process !== 'undefined' ? process.env.LOG_TO_FILE === 'true' : false),
    logDirectory: isBrowser
      ? 'logs' // Not used in browser
      : (typeof process !== 'undefined' ? process.env.LOG_DIR : 'logs') || 'logs',
    enableJsonFormat: isBrowser
      ? false // Browser uses formatted console
      : (typeof process !== 'undefined' ? process.env.LOG_FORMAT === 'json' : false),
  };
};

// Custom format for console output (only used server-side)
const getConsoleFormat = () => {
  if (!winston) return null;
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level}]: ${message} ${metaStr}`;
    })
  );
};

// JSON format for file output (only used server-side)
const getJsonFormat = () => {
  if (!winston) return null;
  return winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );
};

// Create transports based on configuration (only used server-side)
const createTransports = (config: LoggerConfig): any[] => {
  if (!winston || !DailyRotateFile) return [];

  const transports: any[] = [];
  const consoleFormat = getConsoleFormat();
  const jsonFormat = getJsonFormat();

  // Console transport (always enabled in development)
  transports.push(
    new winston.transports.Console({
      format: config.enableJsonFormat ? jsonFormat : consoleFormat,
    })
  );

  // File transports (only in Node.js environment)
  if (config.enableFileLogging && typeof window === 'undefined') {
    // Combined log file (all levels)
    transports.push(
      new DailyRotateFile({
        filename: `${config.logDirectory}/combined-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: jsonFormat,
      })
    );

    // Error log file (error level only)
    transports.push(
      new DailyRotateFile({
        filename: `${config.logDirectory}/error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '30d',
        format: jsonFormat,
      })
    );

    // API interactions log (for audit trail)
    transports.push(
      new DailyRotateFile({
        filename: `${config.logDirectory}/api-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        format: jsonFormat,
      })
    );
  }

  return transports;
};

// Browser-compatible console logger
class BrowserLogger {
  private level: string;

  constructor(level: string) {
    this.level = level;
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    return messageIndex <= currentIndex;
  }

  private formatMessage(level: string, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? JSON.stringify(meta, null, 2) : '';

    const styles = {
      error: 'color: #ff4444; font-weight: bold',
      warn: 'color: #ffaa00; font-weight: bold',
      info: 'color: #4444ff',
      debug: 'color: #888888',
    };

    console.log(
      `%c[${timestamp}] [${level.toUpperCase()}]%c ${message}`,
      styles[level as keyof typeof styles] || '',
      'color: inherit',
      metaStr ? '\n' + metaStr : ''
    );
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      this.formatMessage('info', message, meta);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      this.formatMessage('warn', message, meta);
    }
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      this.formatMessage('error', message, meta);
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      this.formatMessage('debug', message, meta);
    }
  }
}

// Initialize logger based on environment
const config = getLoggerConfig();
let logger: any;

if (isServer && winston) {
  // Server-side: Use Winston with file logging
  logger = winston.createLogger({
    level: config.level,
    transports: createTransports(config),
    exitOnError: false,
  });
} else {
  // Browser-side: Use console logger
  logger = new BrowserLogger(config.level);
}

// API-specific logging helpers
export class APILogger {
  /**
   * Log API request
   */
  static logRequest(method: string, url: string, data?: any, config?: any): void {
    logger.info('API Request', {
      type: 'API_REQUEST',
      method,
      url,
      timestamp: new Date().toISOString(),
      hasPayload: !!data,
      hasConfig: !!config,
      payload: data ? (typeof data === 'string' ? data : JSON.stringify(data).substring(0, 500)) : undefined,
    });
  }

  /**
   * Log successful API response
   */
  static logResponse(method: string, url: string, status: number, data?: any, duration?: number): void {
    logger.info('API Response Success', {
      type: 'API_RESPONSE_SUCCESS',
      method,
      url,
      status,
      statusText: getStatusText(status),
      duration,
      timestamp: new Date().toISOString(),
      hasData: !!data,
      dataPreview: data ? JSON.stringify(data).substring(0, 200) : undefined,
    });
  }

  /**
   * Log API error
   */
  static logError(
    method: string,
    url: string,
    error: any,
    duration?: number
  ): void {
    const errorInfo = {
      type: 'API_RESPONSE_ERROR',
      method,
      url,
      timestamp: new Date().toISOString(),
      duration,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      errorMessage: error?.message,
      errorData: error?.response?.data,
      errorStack: error?.stack,
    };

    if (error?.response?.status && error.response.status >= 500) {
      logger.error('API Server Error (5xx)', errorInfo);
    } else if (error?.response?.status && error.response.status >= 400) {
      logger.warn('API Client Error (4xx)', errorInfo);
    } else {
      logger.error('API Network/Unknown Error', errorInfo);
    }
  }

  /**
   * Log authentication events
   */
  static logAuth(event: string, details?: any): void {
    logger.info('Authentication Event', {
      type: 'AUTH_EVENT',
      event,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  /**
   * Log token refresh attempts
   */
  static logTokenRefresh(success: boolean, error?: string): void {
    const logData = {
      type: 'TOKEN_REFRESH',
      success,
      timestamp: new Date().toISOString(),
      error,
    };

    if (success) {
      logger.info('Token Refresh Success', logData);
    } else {
      logger.warn('Token Refresh Failed', logData);
    }
  }

  /**
   * Log verification operations
   */
  static logVerification(operation: string, details?: any): void {
    logger.info('Verification Operation', {
      type: 'VERIFICATION',
      operation,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  /**
   * Log issuance operations
   */
  static logIssuance(operation: string, details?: any): void {
    logger.info('Issuance Operation', {
      type: 'ISSUANCE',
      operation,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  /**
   * Log schema operations
   */
  static logSchema(operation: string, details?: any): void {
    logger.info('Schema Operation', {
      type: 'SCHEMA',
      operation,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  /**
   * Log organization operations
   */
  static logOrganization(operation: string, details?: any): void {
    logger.info('Organization Operation', {
      type: 'ORGANIZATION',
      operation,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  /**
   * Log ecosystem operations
   */
  static logEcosystem(operation: string, details?: any): void {
    logger.info('Ecosystem Operation', {
      type: 'ECOSYSTEM',
      operation,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }
}

// Helper function to get status text
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statusTexts[status] || 'Unknown Status';
}

// Export the main logger for general use
export default logger;
