import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID middleware.
 * Attaches a unique UUID to every request for tracing.
 * Adds `X-Request-Id` response header.
 */
export function requestIdMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

export default requestIdMiddleware;
