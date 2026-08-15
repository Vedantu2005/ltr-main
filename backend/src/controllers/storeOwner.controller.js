const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const storeService = require('../services/store.service');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await storeService.getStoreOwnerDashboard(req.user.id);
  return success(res, { data });
});

module.exports = { getDashboard };
