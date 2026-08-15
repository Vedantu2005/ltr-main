const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const storeOwnerController = require('../controllers/storeOwner.controller');

const router = express.Router();

router.use(authenticate, authorize('STORE_OWNER'));
router.get('/dashboard', storeOwnerController.getDashboard);

module.exports = router;
