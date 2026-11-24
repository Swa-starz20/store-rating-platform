const storeService = require('../services/store.service');

const createStore = async (req, res, next) => {
  try {
    const store = await storeService.createStore(req.body);
    res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: store
    });
  } catch (error) {
    next(error);
  }
};

const getStores = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const result = await storeService.getStores(req.query, currentUserId);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getOwnerDashboard = async (req, res, next) => {
  try {
    const dashboard = await storeService.getStoreOwnerDashboard(req.user.id);
    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStore,
  getStores,
  getOwnerDashboard
};
