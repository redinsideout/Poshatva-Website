const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

/**
 * Shiprocket Webhook Handler
 * Receives tracking status updates from Shiprocket.
 * 
 * Shiprocket sends a POST with payload like:
 * {
 *   "order_id": "...",
 *   "awb": "...",
 *   "current_status": "Delivered",
 *   "shipment_status": "7",
 *   "shipment_status_id": 7,
 *   "current_timestamp": "2024-01-01 12:00:00",
 *   ...
 * }
 * 
 * Shiprocket status codes:
 *   1 = AWB Assigned (NEW)
 *   2 = Pickup Scheduled
 *   3 = Pickup Queued / Generated
 *   4 = Pickup Error
 *   5 = Shipped / In Transit
 *   6 = Out for Delivery
 *   7 = Delivered
 *   8 = Cancelled
 *   9 = RTO Initiated
 *   10 = RTO Delivered
 *   17 = Pickup Exception
 *   18 = Un-delivered
 *   38 = Lost
 *   41 = Disposed Off
 */

// Map Shiprocket status IDs to Poshatva order statuses
const STATUS_MAP = {
  1: 'processing',   // AWB Assigned
  2: 'processing',   // Pickup Scheduled
  3: 'processing',   // Pickup Queued
  4: 'processing',   // Pickup Error (keep as processing, admin should handle)
  5: 'shipped',      // In Transit
  6: 'shipped',      // Out for Delivery
  7: 'delivered',    // Delivered
  8: 'cancelled',    // Cancelled
  9: 'shipped',      // RTO Initiated (still in transit, just returning)
  10: 'cancelled',   // RTO Delivered (returned to origin)
  17: 'processing',  // Pickup Exception
  18: 'shipped',     // Undelivered (attempted delivery)
  38: 'cancelled',   // Lost
  41: 'cancelled',   // Disposed Off
};

// @desc  Handle Shiprocket webhook for tracking updates
// @route POST /api/webhooks/shiprocket
const handleShiprocketWebhook = asyncHandler(async (req, res) => {
  // Validate x-api-key header
  const webhookToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  const receivedToken = req.headers['x-api-key'];

  if (webhookToken && receivedToken !== webhookToken) {
    console.log('[WEBHOOK] Unauthorized — invalid x-api-key');
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const payload = req.body;

  console.log('[WEBHOOK] Shiprocket webhook received:', JSON.stringify(payload).substring(0, 500));

  // Shiprocket sends the order_id which is our MongoDB _id
  const orderId = payload.order_id;
  const awb = payload.awb;
  const currentStatus = payload.current_status;
  const statusId = payload.shipment_status_id || payload.shipment_status;

  if (!orderId && !awb) {
    console.log('[WEBHOOK] No order_id or awb in webhook payload, ignoring');
    return res.status(200).json({ success: true, message: 'No matching order identifier' });
  }

  // Find the order — try by MongoDB _id first, then by AWB
  let order = null;
  if (orderId) {
    try {
      order = await Order.findById(orderId);
    } catch (e) {
      // orderId might not be a valid ObjectId, ignore
    }
  }
  if (!order && awb) {
    order = await Order.findOne({ 'shiprocket.awbCode': awb });
  }

  if (!order) {
    console.log(`[WEBHOOK] Order not found for order_id=${orderId}, awb=${awb}`);
    // Return 200 so Shiprocket doesn't retry
    return res.status(200).json({ success: true, message: 'Order not found' });
  }

  // Update Shiprocket status on the order
  if (!order.shiprocket) {
    order.shiprocket = {};
  }
  order.shiprocket.status = currentStatus || order.shiprocket.status;
  order.shiprocket.lastTrackedAt = new Date();

  // Update AWB if we didn't have it
  if (awb && !order.shiprocket.awbCode) {
    order.shiprocket.awbCode = awb;
    order.trackingId = awb;
  }

  // Map to Poshatva order status
  const mappedStatus = STATUS_MAP[Number(statusId)];
  if (mappedStatus) {
    order.orderStatus = mappedStatus;

    if (mappedStatus === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
  }

  await order.save();
  console.log(`[WEBHOOK] Order ${order._id} updated: status=${order.orderStatus}, shiprocketStatus=${currentStatus}`);

  // Always return 200 to acknowledge
  res.status(200).json({ success: true, message: 'Webhook processed' });
});

module.exports = { handleShiprocketWebhook };
