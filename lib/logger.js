/**
 * Logging utility for production-safe logging
 * Replaces console.log with environment-aware logging
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

class Logger {
  constructor(name = 'app') {
    this.name = name;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      logger: this.name,
      message,
      ...meta
    };
  }

  log(level, message, meta) {
    if (isTest) return; // Silent during tests

    const logData = this.formatMessage(level, message, meta);

    if (isDevelopment) {
      // In development, use console with colors
      const colors = {
        error: '\x1b[31m',
        warn: '\x1b[33m',
        info: '\x1b[36m',
        debug: '\x1b[37m',
        reset: '\x1b[0m'
      };

      const color = colors[level] || colors.info;
      console.log(`${color}[${logData.timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`, meta || '');
    } else {
      // In production, output structured JSON logs
      console.log(JSON.stringify(logData));
    }
  }

  error(message, error) {
    const meta = error instanceof Error ? {
      error: error.message,
      stack: error.stack,
      name: error.name
    } : error;

    this.log('error', message, meta);
  }

  warn(message, meta) {
    this.log('warn', message, meta);
  }

  info(message, meta) {
    this.log('info', message, meta);
  }

  debug(message, meta) {
    if (isDevelopment) {
      this.log('debug', message, meta);
    }
  }

  // Performance logging
  time(label) {
    if (isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Create default logger instance
const logger = new Logger();

// Export both class and default instance
export { Logger, logger };
export default logger;