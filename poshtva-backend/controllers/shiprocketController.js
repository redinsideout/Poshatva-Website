const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const shiprocketService = require('../services/shiprocketService');

// @desc  Manually push an order to Shiprocket (admin fallback)
// @route POST /api/shiprocket/push/:orderId
const pushOrderToShiprocket = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.shiprocket && order.shiprocket.orderId) {
    res.status(400);
    throw new Error('Order already pushed to Shiprocket');
  }

  const result = await shiprocketService.fulfillOrder(order);

  order.shiprocket = {
    orderId: result.shiprocketOrderId,
    shipmentId: result.shipmentId,
    awbCode: result.awbCode,
    courierName: result.courierName,
    labelUrl: result.labelUrl,
    status: 'NEW',
    pushedAt: new Date(),
  };

  if (result.awbCode) {
    order.trackingId = result.awbCode;
  }

  await order.save();
  console.log(`[SHIPROCKET] Order ${order._id} manually pushed to Shiprocket`);
  res.json({ success: true, order, shiprocketResult: result });
});

// @desc  Fetch live tracking for an order
// @route GET /api/shiprocket/track/:orderId
const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.shiprocket || !order.shiprocket.awbCode) {
    res.status(400);
    throw new Error('No AWB assigned for this order yet');
  }

  const trackingData = await shiprocketService.trackByAWB(order.shiprocket.awbCode);

  // Update last tracked time
  order.shiprocket.lastTrackedAt = new Date();
  await order.save();

  res.json({ success: true, tracking: trackingData });
});

// @desc  Generate/fetch shipping label
// @route POST /api/shiprocket/label/:orderId
const generateLabel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.shiprocket || !order.shiprocket.shipmentId) {
    res.status(400);
    throw new Error('Order not yet pushed to Shiprocket');
  }

  const labelData = await shiprocketService.generateLabel(order.shiprocket.shipmentId);

  if (labelData.label_url) {
    order.shiprocket.labelUrl = labelData.label_url;
    await order.save();
  }

  res.json({ success: true, labelUrl: labelData.label_url || null, data: labelData });
});

// @desc  Schedule pickup for an order
// @route POST /api/shiprocket/pickup/:orderId
const schedulePickup = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.shiprocket || !order.shiprocket.shipmentId) {
    res.status(400);
    throw new Error('Order not yet pushed to Shiprocket');
  }

  const pickupData = await shiprocketService.schedulePickup(order.shiprocket.shipmentId);
  res.json({ success: true, pickup: pickupData });
});

// @desc  Check pincode serviceability
// @route GET /api/shiprocket/serviceability
const checkServiceability = asyncHandler(async (req, res) => {
  const { pincode, cod } = req.query;
  if (!pincode) {
    res.status(400);
    throw new Error('Delivery pincode is required');
  }

  // Use a default pickup pincode from env or hardcode your warehouse pincode
  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '110001';

  const data = await shiprocketService.checkServiceability(
    pickupPincode,
    pincode,
    0.5,
    cod === '1' ? 1 : 0
  );

  res.json({ success: true, serviceability: data });
});

// @desc  Retry AWB assignment for an order that was pushed but AWB failed
// @route POST /api/shiprocket/assign-awb/:orderId
const retryAssignAWB = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.shiprocket || !order.shiprocket.shipmentId) {
    res.status(400);
    throw new Error('Order not yet pushed to Shiprocket');
  }

  if (order.shiprocket.awbCode) {
    res.status(400);
    throw new Error('AWB already assigned');
  }

  const awbResult = await shiprocketService.assignAWB(order.shiprocket.shipmentId);
  const awbCode = awbResult?.response?.data?.awb_code || null;
  const courierName = awbResult?.response?.data?.courier_name || null;

  if (awbCode) {
    order.shiprocket.awbCode = awbCode;
    order.shiprocket.courierName = courierName;
    order.trackingId = awbCode;

    // Also try generating label
    try {
      const labelResult = await shiprocketService.generateLabel(order.shiprocket.shipmentId);
      if (labelResult.label_url) {
        order.shiprocket.labelUrl = labelResult.label_url;
      }
    } catch (labelErr) {
      console.error('[SHIPROCKET] Label generation failed during AWB retry:', labelErr.message);
    }

    await order.save();
  }

  res.json({ success: true, awbCode, courierName, order });
});

module.exports = {
  pushOrderToShiprocket,
  trackOrder,
  generateLabel,
  schedulePickup,
  checkServiceability,
  retryAssignAWB,
};
