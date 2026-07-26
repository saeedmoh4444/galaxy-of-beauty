/**
 * Pagination utility — ensures consistent pagination across all endpoints.
 */

/** Maximum allowed page size to prevent resource exhaustion attacks */
export const MAX_PAGE_SIZE = 100;

/** Default page size if not specified */
export const DEFAULT_PAGE_SIZE = 20;

/** Default page number */
export const DEFAULT_PAGE = 1;

/**
 * Parse and sanitize pagination parameters from request query.
 * Caps `limit` at MAX_PAGE_SIZE to prevent abuse.
 *
 * @param {object} query - req.query object
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(query = {}) {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, parseInt(query.limit) || DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build a standard pagination response object.
 *
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 * @returns {{ page: number, limit: number, total: number, totalPages: number }}
 */
export function buildPaginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export default { parsePagination, buildPaginationMeta, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, DEFAULT_PAGE };
