const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const sendEmail = require('../utils/sendEmail');

// @desc  Create order
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'razorpay',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });
  res.status(201).json({ success: true, order });
});

// @desc  Get user orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc  Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  res.json({ success: true, order });
});

// @desc  Mark order as paid
const markOrderAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.isPaid = true;
  order.paidAt = new Date();
  order.orderStatus = 'processing';
  order.paymentResult = {
    razorpay_order_id: req.body.razorpay_order_id,
    razorpay_payment_id: req.body.razorpay_payment_id,
    razorpay_signature: req.body.razorpay_signature,
  };
  await order.save();

  // Clear cart after successful payment
  await Cart.findOneAndDelete({ user: order.user._id });

  // Send confirmation email
  try {
    await sendEmail({
      to: order.user.email,
      subject: `Poshatva - Order Confirmed! #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#2d6a4f;padding:20px;text-align:center;">
            <h1 style="color:#fff;margin:0;">Poshatva 🌱</h1>
          </div>
          <div style="padding:30px;background:#f9f9f9;">
            <h2 style="color:#2d6a4f;">Your order has been confirmed!</h2>
            <p>Hi ${order.user.name}, thank you for your order.</p>
            <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Total:</strong> ₹${order.totalPrice.toFixed(2)}</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              ${order.orderItems.map(item => `
                <tr style="border-bottom:1px solid #ddd;">
                  <td style="padding:10px;">${item.name} × ${item.quantity}</td>
                  <td style="padding:10px;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            <p><strong>Shipping to:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
            <p style="color:#666;font-size:13px;">We'll notify you when your order ships.</p>
          </div>
          <div style="background:#2d6a4f;padding:15px;text-align:center;">
            <p style="color:#fff;margin:0;font-size:13px;">© 2024 Poshatva. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  } catch (emailErr) {
    console.log('Email send failed:', emailErr.message);
  }

  res.json({ success: true, order });
});

// @desc  Get all orders (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { orderStatus: status } : {};
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));
  res.json({ success: true, total, orders });
});

// @desc  Update order status (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingId } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.orderStatus = orderStatus || order.orderStatus;
  if (trackingId) order.trackingId = trackingId;
  if (orderStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  await order.save();
  res.json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrderById, markOrderAsPaid, getAllOrders, updateOrderStatus };
