const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/password');
const { parsePagination, parseSort, buildPaginationMeta } = require('../utils/queryParser');

const PUBLIC_FIELDS = 'id, name, email, address, role, status, created_at, updated_at';
const SORTABLE_FIELDS = ['name', 'email', 'role', 'status', 'created_at'];

async function findByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function findByIdWithHash(id) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function createUser({ name, email, password, address, role }) {
  const existing = await findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, address, role],
  );

  return findById(result.insertId);
}

/**
 * Lists ADMIN/USER accounts (store owners are managed via the stores listing)
 * with server-side search, role/status filters, sort, and pagination.
 */
async function listUsers(query) {
  const { page, limit, offset } = parsePagination(query);
  const { sortBy, order } = parseSort(query, SORTABLE_FIELDS, 'created_at');

  const where = [];
  const params = [];

  if (query.search) {
    where.push('(name LIKE ? OR email LIKE ? OR address LIKE ?)');
    const term = `%${query.search}%`;
    params.push(term, term, term);
  }
  if (query.role && ['ADMIN', 'USER', 'STORE_OWNER'].includes(query.role)) {
    where.push('role = ?');
    params.push(query.role);
  }
  if (query.status && ['ACTIVE', 'SUSPENDED'].includes(query.status)) {
    where.push('status = ?');
    params.push(query.status);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM users ${whereClause}`, params);
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM users ${whereClause} ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return { data: rows, pagination: buildPaginationMeta({ page, limit, total }) };
}

/**
 * Full detail view for the admin "view user" screen. If the user is a
 * STORE_OWNER, includes the average rating of their store(s).
 */
async function getUserDetail(id) {
  const user = await findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'STORE_OWNER') {
    const [rows] = await pool.execute(
      `SELECT ROUND(AVG(r.rating), 2) AS averageRating, COUNT(r.id) AS totalRatings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?`,
      [id],
    );
    return {
      ...user,
      averageRating: rows[0].averageRating !== null ? Number(rows[0].averageRating) : null,
      totalRatings: rows[0].totalRatings,
    };
  }

  return user;
}

async function setUserStatus(id, status) {
  const user = await findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
}

async function updatePassword(id, newPasswordHash) {
  await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, id]);
}

module.exports = {
  findByEmail,
  findById,
  findByIdWithHash,
  createUser,
  listUsers,
  getUserDetail,
  setUserStatus,
  updatePassword,
};
