const prisma = require('../config/prisma');

const getDashboardStats = async () => {
  const [totalUsers, totalStores, totalRatings, roleCounts] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    })
  ]);

  const roles = {
    ADMIN: 0,
    USER: 0,
    STORE_OWNER: 0
  };

  roleCounts.forEach((item) => {
    if (roles[item.role] !== undefined) {
      roles[item.role] = item._count.id;
    }
  });

  return {
    totalUsers,
    totalStores,
    totalRatings,
    roleBreakdown: roles
  };
};

module.exports = {
  getDashboardStats
};
