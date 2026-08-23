const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc  Get all products with filters
const getProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, search, featured, page = 1, limit = 12, sort } = req.query;
  const query = { isActive: true };

  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'rating') sortOption = { rating: -1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sortOption)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    products,
  });
});

// @desc  Get product by slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc  Get product by ID (admin)
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

const mongoose = require('mongoose');

const sanitizeVariants = (rawVariants) => {
  let variantsArray = rawVariants;
  if (typeof variantsArray === 'string') {
    try {
      variantsArray = JSON.parse(variantsArray);
    } catch (e) {
      console.error('[VARIANT DEBUG] Failed to parse variants JSON string:', e);
      variantsArray = [];
    }
  }
  if (!Array.isArray(variantsArray)) return [];
  return variantsArray.map((v) => {
    const clean = {
      name: String(v.name || 'Variant').trim(),
      value: Number(v.value) || 1,
      unit: String(v.unit || 'kg').trim(),
      price: Number(v.price) || 0,
      discountPrice: Number(v.discountPrice) || 0,
      stock: Number(v.stock) || 0,
      weightInKg: Number(v.weightInKg) || 0.5,
      sku: String(v.sku || '').trim(),
      isActive: v.isActive !== false,
    };
    if (v._id && mongoose.Types.ObjectId.isValid(v._id) && String(v._id).length === 24) {
      clean._id = v._id;
    }
    return clean;
  });
};

// @desc  Create product (admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, slug, description, richDescription, category, price, discountPrice, stock, variants, images, weight, unit, tags, isFeatured, benefits, howToUse } = req.body;
  const exists = await Product.findOne({ slug });
  if (exists) {
    res.status(400);
    throw new Error('Product with this slug already exists');
  }

  console.log('[VARIANT DEBUG] createProduct req.body.variants:', JSON.stringify(variants, null, 2));

  const cleanVariants = sanitizeVariants(variants);
  const product = await Product.create({
    name,
    slug,
    description,
    richDescription,
    category,
    price: Number(price),
    discountPrice: Number(discountPrice) || 0,
    stock: Number(stock) || 0,
    variants: cleanVariants,
    images,
    weight,
    unit,
    tags,
    isFeatured,
    benefits,
    howToUse,
  });

  console.log('[VARIANT DEBUG] Created product variants:', JSON.stringify(product.variants, null, 2));
  res.status(201).json({ success: true, product });
});

// @desc  Update product (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  console.log('[VARIANT DEBUG] req.body.variants:', JSON.stringify(req.body.variants, null, 2));
  console.log('[VARIANT DEBUG] typeof variants:', typeof req.body.variants);
  console.log('[VARIANT DEBUG] Array:', Array.isArray(req.body.variants));

  const cleanVariants = sanitizeVariants(req.body.variants);

  const updateData = {
    name: req.body.name,
    slug: req.body.slug,
    description: req.body.description,
    richDescription: req.body.richDescription,
    category: req.body.category,
    price: Number(req.body.price),
    discountPrice: Number(req.body.discountPrice) || 0,
    stock: Number(req.body.stock) || 0,
    weight: req.body.weight,
    weightInKg: Number(req.body.weightInKg) || 0.5,
    unit: req.body.unit,
    tags: req.body.tags,
    isFeatured: Boolean(req.body.isFeatured),
    isActive: req.body.isActive !== false,
    benefits: req.body.benefits,
    howToUse: req.body.howToUse,
    images: req.body.images,
    variants: cleanVariants,
  };

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  console.log('[VARIANT DEBUG] Saved variants:', JSON.stringify(updatedProduct?.variants, null, 2));

  // Secondary verification query
  const verifyProduct = await Product.findById(id).lean();
  console.log('[VARIANT DEBUG] MongoDB variants after save:', JSON.stringify(verifyProduct?.variants, null, 2));

  res.json({ success: true, product: updatedProduct });
});

// @desc  Delete product (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.isActive = false;
  await product.save();
  res.json({ success: true, message: 'Product removed' });
});

// @desc  Create review
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }
  const review = { user: req.user._id, name: req.user.name, rating: Number(rating), comment };
  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ success: true, message: 'Review added' });
});

module.exports = { getProducts, getProductBySlug, getProductById, createProduct, updateProduct, deleteProduct, createReview };
