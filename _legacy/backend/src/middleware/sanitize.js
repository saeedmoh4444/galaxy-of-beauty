/**
 * Lightweight HTML sanitizer for user-generated content.
 * Strips dangerous HTML tags and attributes to prevent XSS.
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<[^>]*>/g, (match) => {
      const safe = /^<\/*(b|i|em|strong|p|br|ul|ol|li|h[1-6])[\s>]/i;
      return safe.test(match) ? match : '';
    });
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') result[key] = sanitizeString(value);
    else if (typeof value === 'object' && value !== null) result[key] = sanitizeObject(value);
    else result[key] = value;
  }
  return result;
}

/** Middleware: sanitize req.body, req.query, and req.params strings against XSS */
export function sanitizeInput(req, _res, next) {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
}

export default sanitizeInput;
