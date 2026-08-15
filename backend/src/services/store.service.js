const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const { parsePagination, parseSort, buildPaginationMeta } = require('../utils/queryParser');

const SORTABLE_FIELDS = ['name', 'email', 'address', 'created_at', 'averageRating'];

/**
 * Creates a store and (optionally) assigns an owner, inside a transaction so
 * the owner-role check and the insert either both succeed or both roll back.
 */
async function createStore({ name, email, address, ownerId }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (ownerId) {
      const [ownerRows] = await connection.execute(
        'SELECT id, role FROM users WHERE id = ? LIMIT 1 FOR UPDATE',
        [ownerId],
      );
      const owner = ownerRows[0];
      if (!owner) {
        throw ApiError.badRequest('Owner not found');
      }
      if (owner.role !== 'STORE_OWNER') {
        throw ApiError.badRequest('Assigned owner must have the STORE_OWNER role');
      }
    }

    const [result] = await connection.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId || null],
    );

    await connection.commit();
    return getStoreById(result.insertId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function listStores(query, viewerUserId) {
  const { page, limit, offset } = parsePagination(query);
  const { sortBy, order } = parseSort(query, SORTABLE_FIELDS, 'name');

  const where = [];
  const params = [];

  if (query.search) {
    where.push('(s.name LIKE ? OR s.address LIKE ?)');
    const term = `%${query.search}%`;
    params.push(term, term);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sortColumn = sortBy === 'averageRating' ? 'averageRating' : `s.${sortBy}`;

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM stores s ${whereClause}`,
    params,
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT
       s.id, s.name, s.email, s.address, s.owner_id AS ownerId, s.created_at AS createdAt,
       ROUND(AVG(r.rating), 2) AS averageRating,
       COUNT(r.id) AS totalRatings,
       ${
         viewerUserId
           ? 'MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS myRating'
           : 'NULL AS myRating'
       }
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY s.id
     ORDER BY ${sortColumn} ${order}
     LIMIT ? OFFSET ?`,
    [...(viewerUserId ? [viewerUserId] : []), ...params, limit, offset],
  );

  return {
    data: rows.map((row) => ({
      ...row,
      averageRating: row.averageRating !== null ? Number(row.averageRating) : null,
      myRating: row.myRating !== null ? Number(row.myRating) : null,
    })),
    pagination: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * Admin listing: same as listStores but also surfaces the owner's name/email.
 */
async function listStoresForAdmin(query) {
  const { page, limit, offset } = parsePagination(query);
  const { sortBy, order } = parseSort(query, SORTABLE_FIELDS, 'name');

  const where = [];
  const params = [];
  if (query.search) {
    where.push('(s.name LIKE ? OR s.address LIKE ? OR s.email LIKE ?)');
    const term = `%${query.search}%`;
    params.push(term, term, term);
  }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sortColumn = sortBy === 'averageRating' ? 'averageRating' : `s.${sortBy}`;

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM stores s ${whereClause}`, params);
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT
       s.id, s.name, s.email, s.address, s.created_at AS createdAt,
       u.id AS ownerId, u.name AS ownerName, u.email AS ownerEmail,
       ROUND(AVG(r.rating), 2) AS averageRating,
       COUNT(r.id) AS totalRatings
     FROM stores s
     LEFT JOIN users u ON u.id = s.owner_id
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY s.id, u.id
     ORDER BY ${sortColumn} ${order}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return {
    data: rows.map((row) => ({
      ...row,
      averageRating: row.averageRating !== null ? Number(row.averageRating) : null,
    })),
    pagination: buildPaginationMeta({ page, limit, total }),
  };
}

async function getStoreById(id, viewerUserId) {
  const [rows] = await pool.query(
    `SELECT
       s.id, s.name, s.email, s.address, s.owner_id AS ownerId, s.created_at AS createdAt,
       ROUND(AVG(r.rating), 2) AS averageRating,
       COUNT(r.id) AS totalRatings,
       ${
         viewerUserId
           ? 'MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS myRating'
           : 'NULL AS myRating'
       }
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.id = ?
     GROUP BY s.id`,
    [...(viewerUserId ? [viewerUserId] : []), id],
  );

  const store = rows[0];
  if (!store) {
    throw ApiError.notFound('Store not found');
  }

  const distribution = await getRatingDistribution(id);

  return {
    ...store,
    averageRating: store.averageRating !== null ? Number(store.averageRating) : null,
    myRating: store.myRating !== null ? Number(store.myRating) : null,
    ratingDistribution: distribution,
  };
}

async function getRatingDistribution(storeId) {
  const [rows] = await pool.execute(
    'SELECT rating, COUNT(*) AS count FROM ratings WHERE store_id = ? GROUP BY rating',
    [storeId],
  );
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rows.forEach((row) => {
    distribution[row.rating] = row.count;
  });
  return distribution;
}

async function getStoreOwnerDashboard(ownerId) {
  const [storeRows] = await pool.execute(
    'SELECT id, name, email, address, created_at AS createdAt FROM stores WHERE owner_id = ? LIMIT 1',
    [ownerId],
  );
  const store = storeRows[0];
  if (!store) {
    throw ApiError.notFound('No store is assigned to this account yet');
  }

  const [statsRows] = await pool.execute(
    'SELECT ROUND(AVG(rating), 2) AS averageRating, COUNT(*) AS totalRatings FROM ratings WHERE store_id = ?',
    [store.id],
  );

  const distribution = await getRatingDistribution(store.id);

  const [raters] = await pool.execute(
    `SELECT u.id, u.name, u.email, r.rating, r.created_at AS ratedAt
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = ?
     ORDER BY r.created_at DESC`,
    [store.id],
  );

  return {
    store,
    averageRating: statsRows[0].averageRating !== null ? Number(statsRows[0].averageRating) : null,
    totalRatings: statsRows[0].totalRatings,
    ratingDistribution: distribution,
    raters,
  };
}

module.exports = {
  createStore,
  listStores,
  listStoresForAdmin,
  getStoreById,
  getStoreOwnerDashboard,
  getRatingDistribution,
};
