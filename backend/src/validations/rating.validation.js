const { z } = require('zod');
const { VALIDATION_RULES } = require('../config/constants');

const upsertRatingSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(VALIDATION_RULES.RATING_MIN, `Rating must be at least ${VALIDATION_RULES.RATING_MIN}`)
    .max(VALIDATION_RULES.RATING_MAX, `Rating cannot exceed ${VALIDATION_RULES.RATING_MAX}`)
});

module.exports = {
  upsertRatingSchema
};
