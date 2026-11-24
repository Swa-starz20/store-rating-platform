const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/constants');

// Analytics dashboard stats (ADMIN only)
router.get(
  '/stats',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  adminController.getDashboardStats
);

module.exports = router;
