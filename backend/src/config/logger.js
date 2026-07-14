import winston from 'winston';
import env from './env.js';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack, requestId, ...meta }) => {
  const rid = requestId ? `[${requestId}]` : '';
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} ${level} ${rid}: ${stack || message}${metaStr}`;
});

const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  ),
  defaultMeta: { service: 'galaxy-of-beauty' },
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === 'production'
        ? combine(json())
        : combine(colorize(), devFormat),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
  ],
});

// Add file transport in production
if (env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 10 * 1024 * 1024, maxFiles: 5 }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log', maxsize: 20 * 1024 * 1024, maxFiles: 10 }));
}

export default logger;
