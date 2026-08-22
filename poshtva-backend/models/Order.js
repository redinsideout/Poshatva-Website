const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        variantId: { type: String, default: '' },
        variantName: { type: String, default: '' },
        image: { type: String },
        price: { type: Number, required: true },
        mrp: { type: Number, default: 0 },
        quantity: { type: Number, required: true },
        weightInKg: { type: Number, default: 0.5 },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        lat: Number,
        lng: Number
      }
    },
    paymentMethod: { type: String, default: 'razorpay' },
    paymentResult: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
    },
    userType: { type: String, enum: ['Guest', 'Registered'], default: 'Registered' },
    codCharge: { type: Number, default: 0 },
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingId: { type: String, default: '' },
    shiprocket: {
      orderId: { type: mongoose.Schema.Types.Mixed },
      shipmentId: { type: mongoose.Schema.Types.Mixed },
      awbCode: { type: String },
      courierName: { type: String },
      courierId: { type: Number },
      status: { type: String },
      labelUrl: { type: String },
      manifestUrl: { type: String },
      pickupStatus: { type: String },
      pushedAt: { type: Date },
      lastTrackedAt: { type: Date },
    },
    orderNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
