const { authenticate } = require("@feathersjs/authentication").hooks;

// Hook to check one-per-user restriction
const checkOnePerUser = async (context) => {
  if (context.data) {
    const { userId, voucherId } = context.data;
    
    // Check if user has already redeemed this voucher
    const existingRedemption = await context.service.find({
      query: {
        userId: userId,
        voucherId: voucherId,
        $limit: 1
      }
    });

    if (existingRedemption.data && existingRedemption.data.length > 0) {
      throw new Error('You have already redeemed this voucher. One redemption per user only.');
    }
  }
  return context;
};

// Hook to set createdBy and updatedBy
const setUserFields = async (context) => {
  if (context.data) {
    context.data.createdBy = context.params.user._id;
    context.data.updatedBy = context.params.user._id;
  }
  return context;
};

// Hook to set updatedBy
const setUpdatedBy = async (context) => {
  if (context.data) {
    context.data.updatedBy = context.params.user._id;
  }
  return context;
};

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [checkOnePerUser, setUserFields],
    update: [setUpdatedBy],
    patch: [setUpdatedBy],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
