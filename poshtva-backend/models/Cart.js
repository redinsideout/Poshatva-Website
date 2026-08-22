const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: String, default: '' },
        variantName: { type: String, default: '' },
        mrp: { type: Number, default: 0 },
        weightInKg: { type: Number, default: 0.5 },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.virtual('totalAmount').get(function () {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
