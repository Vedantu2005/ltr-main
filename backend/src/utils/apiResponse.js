function success(res, { statusCode = 200, message, data, pagination } = {}) {
  const body = { success: true };
  if (message !== undefined) body.message = message;
  if (data !== undefined) body.data = data;
  if (pagination !== undefined) body.pagination = pagination;
  return res.status(statusCode).json(body);
}

module.exports = { success };
