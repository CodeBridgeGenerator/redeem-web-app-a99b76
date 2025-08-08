const { authenticate } = require("@feathersjs/authentication").hooks;
const { hashPassword, protect } =
  require("@feathersjs/authentication-local").hooks;

// Hook to allow OAuth password updates without authentication for OAuth setup
const allowOAuthPasswordSetup = async (context) => {
  // If this is a patch operation to set OAuth password and the user is not authenticated
  if (context.method === 'patch' && context.data) {
    // Check if this is an OAuth setup operation
    const isOAuthSetup = context.data.oauthPassword || context.data.provider || context.data.providerId;
    const authHeader = context.params.headers && context.params.headers.authorization;
    
    if (!authHeader && isOAuthSetup) {
      console.log("🔍 Allowing OAuth password setup for user:", context.id);
      console.log("🔍 OAuth setup data:", { 
        hasOAuthPassword: !!context.data.oauthPassword, 
        provider: context.data.provider 
      });
      
      // For OAuth users, if they don't have a main password, set the oauthPassword as the main password
      // This allows them to authenticate with the local strategy
      if (context.data.oauthPassword && !context.data.password) {
        console.log("🔍 Setting OAuth password as main password for authentication");
        context.data.password = context.data.oauthPassword;
      }
      
      // Skip authentication for this specific case
      return context;
    }
  }
  
  // Otherwise, require authentication
  return authenticate("jwt")(context);
};

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
    patch: [allowOAuthPasswordSetup, hashPassword("password")],
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
