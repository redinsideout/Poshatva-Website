const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const sendEmail = require('../utils/sendEmail');
const shiprocketService = require('../services/shiprocketService');

// @desc  Create order
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice } = req.body;
  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const isRegistered = !!req.user;
  const userType = isRegistered ? 'Registered' : 'Guest';

  if (paymentMethod === 'cod') {
    if (!isRegistered) {
      res.status(400);
      throw new Error('Cash on Delivery is available only for logged-in customers.');
    }
  }

  const codCharge = paymentMethod === 'cod' ? 59 : 0;
  const calculatedTotal = Number(itemsPrice) + Number(taxPrice) + Number(shippingPrice) + codCharge;

  const order = await Order.create({
    user: req.user ? req.user._id : undefined,
    userType,
    orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'razorpay',
    itemsPrice,
    taxPrice,
    shippingPrice,
    codCharge,
    totalPrice: calculatedTotal,
  });

  // If COD, clear server-side cart immediately since there's no online payment verification
  if (paymentMethod === 'cod') {
    if (req.user) {
      await Cart.findOneAndDelete({ user: req.user._id });
    }
    // Trigger email notifications asynchronously for COD
    Order.findById(order._id)
      .populate('user', 'name email')
      .then((populatedOrder) => {
        if (populatedOrder) {
          triggerOrderEmailNotifications(populatedOrder);
        }
      })
      .catch((err) => {
        console.error('[EMAIL] Failed to populate order for COD notification:', err.message);
      });

    // Auto-push COD order to Shiprocket for fulfillment
    pushToShiprocketAsync(order._id);
  }

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
  // Protect registered orders from access by other users
  if (order.user) {
    if (!req.user || (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      res.status(403);
      throw new Error('Not authorized');
    }
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

  // Clear cart after successful payment (only if registered user)
  if (order.user) {
    await Cart.findOneAndDelete({ user: order.user._id });
  }

  // Trigger email notifications asynchronously
  triggerOrderEmailNotifications(order);

  // Auto-push to Shiprocket for fulfillment after payment
  pushToShiprocketAsync(order._id);

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

  // If cancelling and order was pushed to Shiprocket, cancel there too
  if (orderStatus === 'cancelled' && order.shiprocket && order.shiprocket.orderId) {
    try {
      await shiprocketService.cancelOrder([order.shiprocket.orderId]);
      console.log(`[SHIPROCKET] Cancelled SR order ${order.shiprocket.orderId} for order ${order._id}`);
    } catch (srErr) {
      console.error(`[SHIPROCKET] Failed to cancel order on Shiprocket:`, srErr.response?.data || srErr.message);
    }
  }

  await order.save();
  res.json({ success: true, order });
});

async function triggerOrderEmailNotifications(order) {
  try {
    const customerEmail = order.shippingAddress?.email || (order.user && order.user.email);
    
    // 1. Send Customer Email
    if (customerEmail) {
      try {
        const customerHTML = generateCustomerEmailHTML(order);
        await sendEmail({
          to: customerEmail,
          subject: 'Your Poshatva Order Has Been Confirmed 🌱',
          html: customerHTML,
        });
        console.log(`[EMAIL] Customer confirmation sent to ${customerEmail}`);
      } catch (custErr) {
        console.error(`[EMAIL] Failed to send customer confirmation email: ${custErr.message}`);
      }
    } else {
      console.log('[EMAIL] Skipping customer confirmation - no email address available.');
    }

    // 2. Send Admin Email
    const adminEmail = process.env.ADMIN_EMAIL || 'poshatva@gmail.com';
    try {
      const adminHTML = generateAdminEmailHTML(order);
      await sendEmail({
        to: adminEmail,
        subject: 'New Order Received - Poshatva',
        html: adminHTML,
      });
      console.log(`[EMAIL] Admin notification sent to ${adminEmail}`);
    } catch (adminErr) {
      console.error(`[EMAIL] Failed to send admin notification email: ${adminErr.message}`);
    }
  } catch (err) {
    console.error(`[EMAIL] Failed to trigger order notifications: ${err.message}`);
  }
}

function generateCustomerEmailHTML(order) {
  const itemsHTML = order.orderItems.map(item => `
    <tr style="border-bottom: 1px solid #edf2f7;">
      <td style="padding: 12px 0; font-size: 14px; color: #4a5568;">${item.name}</td>
      <td style="padding: 12px 0; font-size: 14px; color: #718096; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; font-size: 14px; color: #4a5568; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 12px 0; font-size: 14px; font-weight: bold; color: #2d6a4f; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const codRow = order.codCharge > 0 ? `
    <tr>
      <td colspan="3" style="padding: 6px 0; font-size: 14px; color: #718096; text-align: right;">COD Handling Fee:</td>
      <td style="padding: 6px 0; font-size: 14px; color: #4a5568; text-align: right; font-weight: bold;">₹${order.codCharge.toFixed(2)}</td>
    </tr>
  ` : '';

  return `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f9fc; padding: 30px 15px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eef2f5;">
        <div style="background: #2d6a4f; padding: 30px; text-align: center; color: #ffffff;">
          <span style="font-size: 36px; display: block; margin-bottom: 10px;">🌱</span>
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Your Poshatva Order Confirmed!</h1>
        </div>
        <div style="padding: 30px; color: #4a5568; line-height: 1.6;">
          <p style="font-size: 16px; margin-top: 0;">Hi <strong>${order.shippingAddress.fullName}</strong>,</p>
          <p style="font-size: 14px;">Thank you for shopping with us! We have received your order and are preparing it with care. Below are your order details:</p>
          
          <div style="background: #f7fafc; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #edf2f7; font-size: 13px;">
            <div style="margin-bottom: 8px;">
              <span style="color: #718096;">Order ID:</span>
              <strong style="color: #2d6a4f; font-family: monospace; float: right;">#${order._id.toString().toUpperCase()}</strong>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="color: #718096;">Order Date:</span>
              <strong style="float: right;">${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="color: #718096;">Payment Method:</span>
              <strong style="float: right;">${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}</strong>
            </div>
          </div>

          <h3 style="color: #2d6a4f; font-size: 16px; border-bottom: 2px solid #2d6a4f; padding-bottom: 8px; margin-top: 30px;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #edf2f7; text-align: left;">
                <th style="padding: 8px 0; color: #718096; font-size: 12px; text-transform: uppercase;">Product</th>
                <th style="padding: 8px 0; color: #718096; font-size: 12px; text-transform: uppercase; text-align: center;">Qty</th>
                <th style="padding: 8px 0; color: #718096; font-size: 12px; text-transform: uppercase; text-align: right;">Price</th>
                <th style="padding: 8px 0; color: #718096; font-size: 12px; text-transform: uppercase; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td colspan="3" style="padding: 6px 0; font-size: 14px; color: #718096; text-align: right;">Items Subtotal:</td>
              <td style="padding: 6px 0; font-size: 14px; color: #4a5568; text-align: right;">₹${order.itemsPrice.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 6px 0; font-size: 14px; color: #718096; text-align: right;">GST (5%):</td>
              <td style="padding: 6px 0; font-size: 14px; color: #4a5568; text-align: right;">₹${order.taxPrice.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 6px 0; font-size: 14px; color: #718096; text-align: right;">Shipping:</td>
              <td style="padding: 6px 0; font-size: 14px; color: #2d6a4f; text-align: right; font-weight: bold;">FREE</td>
            </tr>
            ${codRow}
            <tr style="border-top: 2px solid #edf2f7;">
              <td colspan="3" style="padding: 12px 0; font-size: 16px; font-weight: bold; color: #333; text-align: right;">Grand Total:</td>
              <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #2d6a4f; text-align: right;">₹${order.totalPrice.toFixed(2)}</td>
            </tr>
          </table>

          <h3 style="color: #2d6a4f; font-size: 16px; border-bottom: 2px solid #2d6a4f; padding-bottom: 8px; margin-top: 35px;">Delivery Address</h3>
          <div style="background: #f7fafc; padding: 20px; border-radius: 12px; border: 1px solid #edf2f7; font-size: 14px; color: #4a5568;">
            <strong style="color: #333; display: block; margin-bottom: 5px;">${order.shippingAddress.fullName}</strong>
            <p style="margin: 0 0 5px 0;">${order.shippingAddress.street}</p>
            <p style="margin: 0 0 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
            <p style="margin: 5px 0 0 0; color: #718096;">Phone: ${order.shippingAddress.phone}</p>
          </div>

          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #edf2f7; padding-top: 25px;">
            <p style="font-size: 15px; font-weight: 600; color: #2d6a4f; margin-bottom: 5px;">Thank you for growing green with Poshatva! 🌿</p>
            <p style="font-size: 12px; color: #a0aec0; margin-top: 0;">This is an automated order confirmation email.</p>
          </div>
        </div>
        <div style="background: #2d6a4f; padding: 15px; text-align: center; color: #ffffff; font-size: 12px;">
          © ${new Date().getFullYear()} Poshatva Heritage. All rights reserved.
        </div>
      </div>
    </div>
  `;
}

function generateAdminEmailHTML(order) {
  const itemsHTML = order.orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px;">${item.name}</td>
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border: 1px solid #ddd; font-size: 14px; text-align: right; font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px 15px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.06); border: 1px solid #e1e4e8;">
        <div style="background: #1a365d; padding: 25px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px;">📦 New Order Received - Poshatva</h2>
        </div>
        <div style="padding: 25px; color: #333333; line-height: 1.5;">
          <p style="font-size: 15px; margin-top: 0;">An order has been placed on the Poshatva website.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Order ID:</strong></td>
              <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #1a365d;">#${order._id.toString().toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Customer Name:</strong></td>
              <td style="padding: 8px 0;">${order.shippingAddress.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Customer Email:</strong></td>
              <td style="padding: 8px 0;">${order.shippingAddress.email || (order.user && order.user.email) || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Customer Phone:</strong></td>
              <td style="padding: 8px 0;">${order.shippingAddress.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Customer Type:</strong></td>
              <td style="padding: 8px 0;"><strong>${order.userType || 'Guest'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Payment Method:</strong></td>
              <td style="padding: 8px 0; text-transform: uppercase;"><strong>${order.paymentMethod}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Timestamp:</strong></td>
              <td style="padding: 8px 0;">${new Date(order.createdAt).toString()}</td>
            </tr>
          </table>

          <h3 style="color: #1a365d; font-size: 16px; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Items Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background: #f7fafc;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 12px; text-transform: uppercase;">Product</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: center; font-size: 12px; text-transform: uppercase; width: 50px;">Qty</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: right; font-size: 12px; text-transform: uppercase; width: 85px;">Price</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: right; font-size: 12px; text-transform: uppercase; width: 90px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr style="background: #f7fafc; font-weight: bold;">
                <td colspan="3" style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total Amount (incl. COD/Tax/Shipping):</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #2d6a4f; font-size: 16px;">₹${order.totalPrice.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="color: #1a365d; font-size: 16px; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Shipping Address</h3>
          <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-size: 14px;">
            <strong>${order.shippingAddress.fullName}</strong><br/>
            ${order.shippingAddress.street}<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
            <span style="color: #666;">Phone: ${order.shippingAddress.phone}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Push an order to Shiprocket asynchronously (fire-and-forget).
 * Failures are logged but never block the main order flow.
 */
function pushToShiprocketAsync(orderId) {
  Order.findById(orderId)
    .then(async (freshOrder) => {
      if (!freshOrder) return;
      // Skip if already pushed
      if (freshOrder.shiprocket && freshOrder.shiprocket.orderId) {
        console.log(`[SHIPROCKET] Order ${orderId} already pushed, skipping`);
        return;
      }
      try {
        const result = await shiprocketService.fulfillOrder(freshOrder);
        freshOrder.shiprocket = {
          orderId: result.shiprocketOrderId,
          shipmentId: result.shipmentId,
          awbCode: result.awbCode,
          courierName: result.courierName,
          labelUrl: result.labelUrl,
          status: 'NEW',
          pushedAt: new Date(),
        };
        if (result.awbCode) {
          freshOrder.trackingId = result.awbCode;
        }
        await freshOrder.save();
        console.log(`[SHIPROCKET] Order ${orderId} auto-pushed successfully`);
      } catch (srErr) {
        console.error(`[SHIPROCKET] Auto-push failed for order ${orderId}:`, srErr.response?.data || srErr.message);
      }
    })
    .catch((err) => {
      console.error(`[SHIPROCKET] Failed to load order ${orderId} for auto-push:`, err.message);
    });
}

module.exports = { createOrder, getMyOrders, getOrderById, markOrderAsPaid, getAllOrders, updateOrderStatus };
