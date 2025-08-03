const createModel = require("mongoose").model;

module.exports = function (app) {
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
      },
      imageData: {
        type: String,
        required: true
      },
      fileName: {
        type: String,
        required: true
      },
      fileType: {
        type: String,
        required: true
      },
      fileSize: {
        type: Number,
        required: true
      }
    },
    {
      timestamps: true,
    }
  );

  return createModel("uploader", schema);
};
