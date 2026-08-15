const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const { idParamRule } = require('../validators/common');
const { createUserValidators } = require('../validators/user.validators');
const { createStoreValidators } = require('../validators/store.validators');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.listUsers);
router.post('/users', createUserValidators, validateRequest, adminController.createUser);
router.get('/users/:id', idParamRule(), validateRequest, adminController.getUserDetail);
router.patch('/users/:id/suspend', idParamRule(), validateRequest, adminController.suspendUser);
router.patch('/users/:id/reactivate', idParamRule(), validateRequest, adminController.reactivateUser);

router.get('/stores', adminController.listStores);
router.post('/stores', createStoreValidators, validateRequest, adminController.createStore);
router.get('/stores/:id', idParamRule(), validateRequest, adminController.getStoreDetail);

module.exports = router;
