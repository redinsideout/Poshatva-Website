const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc  Get user cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price discountPrice stock slug variants');
  if (!cart) return res.json({ success: true, cart: { items: [], totalAmount: 0 } });
  const totalAmount = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({ success: true, cart: { ...cart.toObject(), totalAmount } });
});

// @desc  Add to cart / update quantity
const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  let selectedPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  let selectedMrp = product.price;
  let selectedVariantName = '';
  let selectedWeight = product.weightInKg || 0.5;
  let availableStock = product.stock;
  let actualVariantId = variantId || '';

  if (variantId && product.variants?.length > 0) {
    const variant = product.variants.id(variantId) || product.variants.find((v) => v._id.toString() === variantId.toString());
    if (!variant || variant.isActive === false) {
      res.status(400);
      throw new Error('Selected variant is no longer available');
    }
    selectedPrice = variant.discountPrice > 0 ? variant.discountPrice : variant.price;
    selectedMrp = variant.price;
    selectedVariantName = variant.name;
    selectedWeight = variant.weightInKg || 0.5;
    availableStock = variant.stock;
    actualVariantId = variant._id.toString();
  } else if (product.variants?.length > 0) {
    // Default to first active variant if variantId not passed but product has variants
    const activeVar = product.variants.find((v) => v.isActive !== false);
    if (activeVar) {
      selectedPrice = activeVar.discountPrice > 0 ? activeVar.discountPrice : activeVar.price;
      selectedMrp = activeVar.price;
      selectedVariantName = activeVar.name;
      selectedWeight = activeVar.weightInKg || 0.5;
      availableStock = activeVar.stock;
      actualVariantId = activeVar._id.toString();
    }
  }

  if (availableStock < quantity) {
    res.status(400);
    throw new Error('Insufficient stock for selected item');
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{
        product: productId,
        variantId: actualVariantId,
        variantName: selectedVariantName,
        mrp: selectedMrp,
        weightInKg: selectedWeight,
        quantity,
        price: selectedPrice,
      }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId && (i.variantId || '') === actualVariantId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = selectedPrice;
      cart.items[itemIndex].mrp = selectedMrp;
      cart.items[itemIndex].variantName = selectedVariantName;
      cart.items[itemIndex].weightInKg = selectedWeight;
    } else {
      cart.items.push({
        product: productId,
        variantId: actualVariantId,
        variantName: selectedVariantName,
        mrp: selectedMrp,
        weightInKg: selectedWeight,
        quantity,
        price: selectedPrice,
      });
    }
    await cart.save();
  }

  await cart.populate('items.product', 'name images price discountPrice stock slug variants');
  const totalAmount = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({ success: true, cart: { ...cart.toObject(), totalAmount } });
});

// @desc  Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantId = '' } = req.query;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  cart.items = cart.items.filter((i) => {
    if (i.product.toString() !== productId) return true;
    if (variantId) return (i.variantId || '') !== variantId;
    return false;
  });
  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock slug variants');
  const totalAmount = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({ success: true, cart: { ...cart.toObject(), totalAmount } });
});

// @desc  Clear cart
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, removeFromCart, clearCart };
