const { authenticate } = require("@feathersjs/authentication").hooks;

// Hook to populate voucher details
const populateVouchers = async (context) => {
  if (context.result && context.result.data) {
    // Populate voucher details for each cart item
    for (let item of context.result.data) {
      if (item.voucherId && typeof item.voucherId === 'string') {
        try {
          const voucher = await context.app.service('voucher').get(item.voucherId);
          item.voucherId = voucher;
        } catch (error) {
          console.error('Error populating voucher:', error);
          // Keep the voucherId as string if voucher not found
        }
      }
    }
  }
  return context;
};

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [
      async (context) => {
        // Set createdBy and updatedBy from authenticated user
        context.data.createdBy = context.params.user._id;
        context.data.updatedBy = context.params.user._id;
        return context;
      }
    ],
    update: [
      async (context) => {
        // Set updatedBy from authenticated user
        context.data.updatedBy = context.params.user._id;
        return context;
      }
    ],
    patch: [
      async (context) => {
        // Set updatedBy from authenticated user
        context.data.updatedBy = context.params.user._id;
        return context;
      }
    ],
    remove: [],
  },

  after: {
    all: [],
    find: [populateVouchers],
    get: [populateVouchers],
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
