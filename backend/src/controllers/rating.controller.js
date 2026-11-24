const ratingService = require('../services/rating.service');

const submitOrUpdateRating = async (req, res, next) => {
  try {
    const { storeId, rating } = req.body;
    const result = await ratingService.upsertRating(req.user.id, storeId, rating);
    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitOrUpdateRating
};
