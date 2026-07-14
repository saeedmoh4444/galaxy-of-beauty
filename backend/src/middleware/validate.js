import { ZodError } from 'zod';

/**
 * Request validation middleware factory.
 * Validates req.body, req.query, and req.params against Zod schemas.
 *
 * @param {object} schemas - { body?, query?, params? } Zod schemas
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.post('/bookings', validate({ body: createBookingSchema }), handler);
 */
export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(error); // Let errorHandler format it
      }
      next(error);
    }
  };
}

export default validate;
