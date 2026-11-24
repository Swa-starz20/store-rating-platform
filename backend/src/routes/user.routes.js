const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/constants');
const {
  createUserByAdminSchema,
  listUsersQuerySchema
} = require('../validations/user.validation');

// All user management routes require ADMIN role
router.use(verifyToken, authorizeRoles(ROLES.ADMIN));

router.get('/', validate({ query: listUsersQuerySchema }), userController.getUsers);
router.post('/', validate({ body: createUserByAdminSchema }), userController.createUser);
router.get('/available-owners', userController.getAvailableStoreOwners);
router.get('/:id', userController.getUserById);

module.exports = router;
