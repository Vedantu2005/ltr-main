const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parses page/limit/sortBy/order query params against a whitelist.
 * Never trust raw query values in SQL - sortBy/order are validated here,
 * page/limit are coerced to safe integers, and the caller still binds them
 * as parameters (not string concatenation) when building the query.
 */
function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = DEFAULT_PAGE;
  if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function parseSort(query, allowedFields, defaultField) {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const order = String(query.order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return { sortBy, order };
}

function buildPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

module.exports = { parsePagination, parseSort, buildPaginationMeta };
