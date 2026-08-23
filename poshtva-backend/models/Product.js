const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "1 KG", "5 KG", "10 KG"
    value: { type: Number },               // e.g. 1, 5, 10
    unit: { type: String, default: 'kg' }, // e.g. "kg", "g", "L", "ml", "pack"
    price: { type: Number, required: true, min: 0 },         // MRP / Base Price
    discountPrice: { type: Number, default: 0 },             // Selling Price
    stock: { type: Number, default: 0 },                     // Variant Stock
    weightInKg: { type: Number, default: 0.5 },              // Shipping Weight in KG
    sku: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    richDescription: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    variants: {
      type: [variantSchema],
      default: [],
    },
    images: [{ type: String }],
    weight: { type: String, default: '' },
    weightInKg: { type: Number, default: 0.5 },
    dimensions: {
      length: { type: Number, default: 10 },
      breadth: { type: Number, default: 10 },
      height: { type: Number, default: 10 },
    },
    unit: { type: String, default: 'kg' },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    benefits: [{ type: String }],
    howToUse: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice > 0 ? this.discountPrice : this.price;
});

module.exports = mongoose.model('Product', productSchema);
