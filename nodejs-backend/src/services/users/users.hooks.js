const { authenticate } = require("@feathersjs/authentication").hooks;
const { hashPassword, protect } =
  require("@feathersjs/authentication-local").hooks;

// Hook to give 500 points to new users
const giveWelcomePoints = async (context) => {
  if (context.data) {
    // Only set points if not already set or if explicitly set to 0 (for new users)
    if (!context.data.points || context.data.points === 0) {
      context.data.points = 500; // Give 500 points to new users
      console.log("🎁 Welcome points given to new user:", context.data.email);
    }
  }
  return context;
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [authenticate("jwt")],
    create: [hashPassword("password"), giveWelcomePoints],
    update: [authenticate("jwt"), hashPassword("password")],
    patch: [authenticate("jwt"), hashPassword("password")],
    remove: [authenticate("jwt")],
  },

  after: {
    all: [protect("password")],
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
