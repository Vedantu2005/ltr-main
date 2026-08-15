const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const storeService = require('../services/store.service');
const ratingService = require('../services/rating.service');

const listStores = asyncHandler(async (req, res) => {
  const viewerUserId = req.user ? req.user.id : null;
  const { data, pagination } = await storeService.listStores(req.query, viewerUserId);
  return success(res, { data, pagination });
});

const getStore = asyncHandler(async (req, res) => {
  const viewerUserId = req.user ? req.user.id : null;
  const store = await storeService.getStoreById(req.params.id, viewerUserId);
  return success(res, { data: store });
});

const submitRating = asyncHandler(async (req, res) => {
  const rating = await ratingService.submitRating({
    userId: req.user.id,
    storeId: req.params.id,
    rating: req.body.rating,
  });
  return success(res, { statusCode: 200, message: 'Rating submitted successfully', data: rating });
});

module.exports = { listStores, getStore, submitRating };
