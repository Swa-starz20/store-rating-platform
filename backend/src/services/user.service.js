const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { ROLES } = require('../config/constants');

const createUser = async ({ name, email, password, address, role }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    const error = new Error('A user with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
      role: role || ROLES.USER
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true
    }
  });

  return newUser;
};

const getUsers = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    role,
    name,
    email,
    address,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams;

  const skip = (page - 1) * limit;

  // Build where filter
  const where = {};

  if (role) {
    where.role = role;
  }

  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }

  if (email) {
    where.email = { contains: email, mode: 'insensitive' };
  }

  if (address) {
    where.address = { contains: address, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Sorting
  const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
  const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

  const [totalCount, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderField]: orderDirection },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    })
  ]);

  // Enrich with computed store rating if STORE_OWNER
  const enrichedUsers = users.map((user) => {
    let storeInfo = null;
    if (user.role === ROLES.STORE_OWNER && user.store) {
      const ratings = user.store.ratings || [];
      const totalRatings = ratings.length;
      const avgRating = totalRatings > 0
        ? Number((ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
        : null;

      storeInfo = {
        id: user.store.id,
        name: user.store.name,
        totalRatings,
        averageRating: avgRating
      };
    }

    const { store, ...rest } = user;
    return {
      ...rest,
      store: storeInfo
    };
  });

  return {
    data: enrichedUsers,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      store: {
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          ratings: {
            select: {
              id: true,
              rating: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // Calculate store average rating if STORE_OWNER
  let storeDetails = null;
  if (user.role === ROLES.STORE_OWNER && user.store) {
    const ratings = user.store.ratings || [];
    const totalRatings = ratings.length;
    const avgRating = totalRatings > 0
      ? Number((ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
      : null;

    storeDetails = {
      id: user.store.id,
      name: user.store.name,
      email: user.store.email,
      address: user.store.address,
      totalRatings,
      averageRating: avgRating,
      ratings: ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        createdAt: r.createdAt,
        user: r.user
      }))
    };
  }

  const { store, ...userWithoutStore } = user;

  return {
    ...userWithoutStore,
    store: storeDetails
  };
};

// Available store owners without an existing store assigned
const getAvailableStoreOwners = async () => {
  const storeOwners = await prisma.user.findMany({
    where: {
      role: ROLES.STORE_OWNER,
      store: null
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true
    }
  });

  return storeOwners;
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getAvailableStoreOwners
};
