const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const userService = require('../services/user.service');
const storeService = require('../services/store.service');
const dashboardService = require('../services/dashboard.service');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAdminDashboard();
  return success(res, { data });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, address, role } = req.body;
  const user = await userService.createUser({ name, email, password, address, role });
  return success(res, { statusCode: 201, message: 'User created successfully', data: user });
});

const listUsers = asyncHandler(async (req, res) => {
  const { data, pagination } = await userService.listUsers(req.query);
  return success(res, { data, pagination });
});

const getUserDetail = asyncHandler(async (req, res) => {
  const user = await userService.getUserDetail(req.params.id);
  return success(res, { data: user });
});

const suspendUser = asyncHandler(async (req, res) => {
  const user = await userService.setUserStatus(req.params.id, 'SUSPENDED');
  return success(res, { message: 'User suspended', data: user });
});

const reactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.setUserStatus(req.params.id, 'ACTIVE');
  return success(res, { message: 'User reactivated', data: user });
});

const createStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  const store = await storeService.createStore({ name, email, address, ownerId });
  return success(res, { statusCode: 201, message: 'Store created successfully', data: store });
});

const listStores = asyncHandler(async (req, res) => {
  const { data, pagination } = await storeService.listStoresForAdmin(req.query);
  return success(res, { data, pagination });
});

const getStoreDetail = asyncHandler(async (req, res) => {
  const store = await storeService.getStoreById(req.params.id);
  return success(res, { data: store });
});

module.exports = {
  getDashboard,
  createUser,
  listUsers,
  getUserDetail,
  suspendUser,
  reactivateUser,
  createStore,
  listStores,
  getStoreDetail,
};
