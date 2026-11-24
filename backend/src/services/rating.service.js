const prisma = require('../config/prisma');

const upsertRating = async (userId, storeId, ratingValue) => {
  // Check store exists
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, ownerId: true }
  });

  if (!store) {
    const error = new Error('Store not found.');
    error.statusCode = 404;
    throw error;
  }

  // Prevent store owner from rating their own store
  if (store.ownerId === userId) {
    const error = new Error('Store owners cannot rate their own store.');
    error.statusCode = 400;
    throw error;
  }

  // Upsert rating
  const savedRating = await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId,
        storeId
      }
    },
    update: {
      rating: ratingValue
    },
    create: {
      userId,
      storeId,
      rating: ratingValue
    }
  });

  // Calculate new store average rating and total ratings
  const allRatings = await prisma.rating.findMany({
    where: { storeId },
    select: { rating: true }
  });

  const totalRatings = allRatings.length;
  const averageRating = totalRatings > 0
    ? Number((allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
    : null;

  return {
    rating: savedRating,
    userRating: savedRating.rating,
    averageRating,
    totalRatings
  };
};

module.exports = {
  upsertRating
};
