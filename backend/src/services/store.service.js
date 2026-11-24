const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { ROLES } = require('../config/constants');

const createStore = async ({ name, email, address, ownerId, owner }) => {
  // Check store email uniqueness
  const existingStore = await prisma.store.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingStore) {
    const error = new Error('A store with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Case 1: Auto-create owner account in a single transaction
  if (owner) {
    // Check if owner email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: owner.email.toLowerCase() }
    });

    if (existingUser) {
      const error = new Error('A user with the specified owner email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(owner.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const createdOwner = await tx.user.create({
        data: {
          name: owner.name,
          email: owner.email.toLowerCase(),
          password: hashedPassword,
          address: owner.address,
          role: ROLES.STORE_OWNER
        }
      });

      const createdStore = await tx.store.create({
        data: {
          name,
          email: email.toLowerCase(),
          address,
          ownerId: createdOwner.id
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true,
              role: true
            }
          }
        }
      });

      return createdStore;
    });

    return result;
  }

  // Case 2: Link existing STORE_OWNER user
  if (ownerId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: ownerId },
      include: { store: true }
    });

    if (!existingUser) {
      const error = new Error('The specified owner user does not exist.');
      error.statusCode = 404;
      throw error;
    }

    if (existingUser.role !== ROLES.STORE_OWNER) {
      const error = new Error('The selected user is not a Store Owner.');
      error.statusCode = 400;
      throw error;
    }

    if (existingUser.store) {
      const error = new Error('This Store Owner is already assigned to another store.');
      error.statusCode = 409;
      throw error;
    }

    const newStore = await prisma.store.create({
      data: {
        name,
        email: email.toLowerCase(),
        address,
        ownerId
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            role: true
          }
        }
      }
    });

    return newStore;
  }

  const error = new Error('Must provide either existing ownerId or owner details.');
  error.statusCode = 400;
  throw error;
};

const getStores = async (queryParams, currentUserId = null) => {
  const {
    page = 1,
    limit = 50,
    search = '',
    name,
    address,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams;

  const where = {};

  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }

  if (address) {
    where.address = { contains: address, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } }
    ];
  }

  const stores = await prisma.store.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      ratings: {
        select: {
          id: true,
          userId: true,
          rating: true
        }
      }
    }
  });

  // Calculate metrics per store
  let enrichedStores = stores.map((store) => {
    const ratings = store.ratings || [];
    const totalRatings = ratings.length;
    const avgRating = totalRatings > 0
      ? Number((ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
      : null;

    let userRating = null;
    if (currentUserId) {
      const found = ratings.find((r) => r.userId === currentUserId);
      if (found) {
        userRating = found.rating;
      }
    }

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId,
      owner: store.owner,
      averageRating: avgRating,
      totalRatings,
      userRating,
      createdAt: store.createdAt
    };
  });

  // Custom sort handling (especially for computed rating)
  const isAsc = sortOrder.toLowerCase() === 'asc';
  enrichedStores.sort((a, b) => {
    if (sortBy === 'rating') {
      const rA = a.averageRating !== null ? a.averageRating : (isAsc ? 999 : -1);
      const rB = b.averageRating !== null ? b.averageRating : (isAsc ? 999 : -1);
      return isAsc ? rA - rB : rB - rA;
    }
    if (sortBy === 'name') {
      return isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (sortBy === 'address') {
      return isAsc ? a.address.localeCompare(b.address) : b.address.localeCompare(a.address);
    }
    if (sortBy === 'email') {
      return isAsc ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
    }
    // Default createdAt
    return isAsc
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = enrichedStores.length;
  const skip = (page - 1) * limit;
  const paginatedStores = enrichedStores.slice(skip, skip + limit);

  return {
    data: paginatedStores,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getStoreOwnerDashboard = async (ownerUserId) => {
  const store = await prisma.store.findUnique({
    where: { ownerId: ownerUserId },
    include: {
      ratings: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!store) {
    const error = new Error('No store associated with this Store Owner account.');
    error.statusCode = 404;
    throw error;
  }

  const ratings = store.ratings || [];
  const totalRatings = ratings.length;
  const avgRating = totalRatings > 0
    ? Number((ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
    : null;

  const formattedRatings = ratings.map((r) => ({
    id: r.id,
    userName: r.user.name,
    userEmail: r.user.email,
    userAddress: r.user.address,
    rating: r.rating,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }));

  return {
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address
    },
    averageRating: avgRating,
    totalRatings,
    ratings: formattedRatings
  };
};

module.exports = {
  createStore,
  getStores,
  getStoreOwnerDashboard
};
