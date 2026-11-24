const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema
} = require('../validations/auth.validation');

// Public routes
router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);

// Protected routes
router.post(
  '/change-password',
  verifyToken,
  validate({ body: changePasswordSchema }),
  authController.changePassword
);
router.get('/me', verifyToken, authController.getProfile);

module.exports = router;
