
    module.exports = function (app) {
        const modelName = 'cart_item_history';
        const mongooseClient = app.get('mongooseClient');
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            id: { type:  String , maxLength: 150, index: true, trim: true },
voucherId: { type:  String , maxLength: 150, index: true, trim: true },
userId: { type:  String , maxLength: 150, index: true, trim: true },
quantity: { type: Number, required: false, max: 10000000 },
completedDate: { type: Date, required: false },

            
            createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
            updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true }
          },
          {
            timestamps: true
        });
      
       
        if (mongooseClient.modelNames().includes(modelName)) {
          mongooseClient.deleteModel(modelName);
        }
        return mongooseClient.model(modelName, schema);
        
      };