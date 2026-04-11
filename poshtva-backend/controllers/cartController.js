const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc  Get user cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price discountPrice stock slug');
  if (!cart) return res.json({ success: true, cart: { items: [], totalAmount: 0 } });
  const totalAmount = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({ success: true, cart: { ...cart.toObject(), totalAmount } });
});

// @desc  Add to cart / update quantity
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity, price }] });
  } else {
    const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = price;
    } else {
      cart.items.push({ product: productId, quantity, price });
    }
    await cart.save();
  }

  await cart.populate('items.product', 'name images price discountPrice stock slug');
  const totalAmount = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({ success: true, cart: { ...cart.toObject(), totalAmount } });
});

// @desc  Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  const totalAmount = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({ success: true, cart: { ...cart.toObject(), totalAmount } });
});

// @desc  Clear cart
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, removeFromCart, clearCart };
