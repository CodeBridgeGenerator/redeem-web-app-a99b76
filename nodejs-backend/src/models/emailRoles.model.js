const createModel = require("mongoose").model;

module.exports = function (app) {
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
      },
      role: {
        type: String,
        required: true,
        enum: ["user", "admin", "manager", "supervisor"],
        default: "user"
      },
      isActive: {
        type: Boolean,
        default: true
      }
    },
    {
      timestamps: true,
    }
  );

  return createModel("emailRoles", schema);
}; 