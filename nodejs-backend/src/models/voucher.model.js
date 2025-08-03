module.exports = function (app) {
  const modelName = "voucher";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      id: { type: String, required: true },
      categoryId: { type: String, required: true },
      points: { type: Number, required: true },
      title: { type: String, required: true },
      image: { type: String, required: true },
      description: { type: String, required: true },
      termsAndCondition: { type: String, required: true },
      isLatest: { type: Boolean, required: false, default: false },
      isActive: { type: Boolean, required: false, default: true }
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
