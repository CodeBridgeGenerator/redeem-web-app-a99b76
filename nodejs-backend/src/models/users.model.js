module.exports = function (app) {
  const modelName = "users";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      name: {
        type: String,
        required: true,
        unique: false,
        lowercase: false,
        uppercase: false,
        minLength: 2,
        maxLength: 100,
        index: true,
        trim: true,
      },
      username: {
        type: String,
        required: false,
        unique: false,
        lowercase: false,
        uppercase: false,
        minLength: 2,
        maxLength: 100,
        index: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        uppercase: false,
        minLength: 5,
        maxLength: 150,
        index: true,
        trim: true,
      },
      password: {
        type: String,
        required: false, // Made optional for OAuth users
        unique: false,
        lowercase: false,
        uppercase: false,
        minLength: 5,
        maxLength: 300,
        index: true,
        trim: true,
      },
      isActive: { type: Boolean, required: false, default: true },
      // OAuth provider fields
      provider: {
        type: String,
        required: false,
        enum: ['local', 'google', 'facebook', 'github', 'apple', 'microsoft'],
        default: 'local'
      },
      providerId: {
        type: String,
        required: false,
        unique: false,
        index: true,
        trim: true,
      },
      oauthPassword: {
        type: String,
        required: false,
        unique: false,
        lowercase: false,
        uppercase: false,
        minLength: 5,
        maxLength: 300,
        index: true,
        trim: true,
      },
      profilePicture: {
        type: String,
        required: false,
        trim: true,
      },
      profileImage: {
        type: String,
        required: false,
        trim: true,
      },
      emailVerified: {
        type: Boolean,
        default: false,
      },
      lastLoginAt: {
        type: Date,
        default: Date.now,
      },
      // Additional user fields
      phoneNumber: {
        type: String,
        required: false,
        trim: true,
      },
      points: {
        type: Number,
        required: false,
        default: 0,
      },
      aboutMe: {
        type: String,
        required: false,
        trim: true,
      },
      dateOfBirth: {
        type: Date,
        required: false,
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
    },
    {
      timestamps: true,
    },
  );

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
