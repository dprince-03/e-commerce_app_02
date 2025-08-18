import { logger } from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) {
    logger.error(message);
  }
  res.status(status).json({ error: message });
}

