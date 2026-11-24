const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/constants');
const { upsertRatingSchema } = require('../validations/rating.validation');

// Normal Users can submit or modify ratings
router.post(
  '/',
  verifyToken,
  authorizeRoles(ROLES.USER),
  validate({ body: upsertRatingSchema }),
  ratingController.submitOrUpdateRating
);

module.exports = router;
