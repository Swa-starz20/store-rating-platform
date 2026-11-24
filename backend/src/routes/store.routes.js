const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/constants');
const {
  createStoreSchema,
  listStoresQuerySchema
} = require('../validations/store.validation');

// Optional auth helper: if token present, sets req.user so we can return userRating
const optionalVerifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return verifyToken(req, res, next);
};

// Store Owner specific dashboard
router.get(
  '/owner/dashboard',
  verifyToken,
  authorizeRoles(ROLES.STORE_OWNER),
  storeController.getOwnerDashboard
);

// Get list of stores (accessible to authenticated users/admins to view directory)
router.get(
  '/',
  optionalVerifyToken,
  validate({ query: listStoresQuerySchema }),
  storeController.getStores
);

// Create new store (ADMIN only)
router.post(
  '/',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  validate({ body: createStoreSchema }),
  storeController.createStore
);

module.exports = router;
