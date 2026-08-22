const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const shiprocketService = require('../services/shiprocketService');

// @desc  Push an order to Shiprocket (Admin action)
// @route POST /api/shiprocket/push/:orderId
const pushOrderToShiprocket = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate('orderItems.product');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Idempotency: Return existing Shiprocket metadata if already created
  if (order.shiprocket && order.shiprocket.orderId) {
    return res.json({
      success: true,
      message: 'Order already created on Shiprocket',
      order,
      shiprocketResult: {
        shiprocketOrderId: order.shiprocket.orderId,
        shipmentId: order.shiprocket.shipmentId,
        awbCode: order.shiprocket.awbCode,
        courierName: order.shiprocket.courierName,
        labelUrl: order.shiprocket.labelUrl,
      },
    });
  }

  // Validate shipping details
  const { shippingAddress } = order;
  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone || !shippingAddress.fullName) {
    res.status(400);
    throw new Error('Incomplete shipping address for Shiprocket order creation. Check name, street, city, state, pincode, and phone.');
  }

  try {
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
    console.log(`[SHIPROCKET] Order ${order._id} pushed to Shiprocket: Order #${result.shiprocketOrderId}`);
    res.status(201).json({ success: true, order, shiprocketResult: result });
  } catch (err) {
    console.error(`[SHIPROCKET] Order push error for ${order._id}:`, err.response?.data || err.message);
    res.status(400);
    throw new Error(err.response?.data?.message || err.response?.data?.errors || err.message || 'Failed to create Shiprocket order');
  }
});

// @desc  Get available couriers for an order
// @route GET /api/shiprocket/couriers/:orderId
const getAvailableCouriers = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate('orderItems.product');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '251001';
  const deliveryPincode = order.shippingAddress?.pincode;
  if (!deliveryPincode) {
    res.status(400);
    throw new Error('Order is missing delivery pincode');
  }

  const totalWeight = order.orderItems?.reduce((sum, item) => {
    const w = item.product?.weightInKg || 0.5;
    return sum + w * item.quantity;
  }, 0) || 0.5;

  const codFlag = order.paymentMethod === 'cod' ? 1 : 0;

  try {
    const data = await shiprocketService.checkServiceability(pickupPincode, deliveryPincode, Math.max(totalWeight, 0.5), codFlag);
    const couriers = data?.data?.available_courier_companies || [];
    res.json({ success: true, couriers, serviceability: data });
  } catch (err) {
    console.error(`[SHIPROCKET] Courier serviceability fetch failed:`, err.response?.data || err.message);
    res.status(400);
    throw new Error(err.response?.data?.message || 'Failed to fetch available couriers');
  }
});

// @desc  Assign AWB to shipment (Auto or Admin selected courierId)
// @route POST /api/shiprocket/assign-awb/:orderId
const assignAWB = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.shiprocket || !order.shiprocket.shipmentId) {
    res.status(400);
    throw new Error('Create Shiprocket Order first before assigning AWB');
  }

  const { courierId } = req.body;
  
  // Idempotency: If AWB already assigned and no new courier requested, return existing
  if (order.shiprocket.awbCode && !courierId) {
    return res.json({
      success: true,
      message: 'AWB already assigned',
      awbCode: order.shiprocket.awbCode,
      courierName: order.shiprocket.courierName,
      order,
    });
  }

  const shipmentId = Number(order.shiprocket.shipmentId) || order.shiprocket.shipmentId;
  const parsedCourierId = (courierId !== null && courierId !== undefined && courierId !== '') 
    ? (Number(courierId) || courierId) 
    : null;

  console.log(`[SHIPROCKET] Processing AWB Assignment for Order #${order._id.toString().slice(-8).toUpperCase()}`, {
    shipmentId,
    courierId: parsedCourierId,
  });

  try {
    const awbResult = await shiprocketService.assignAWB(shipmentId, parsedCourierId);

    const awbCode = awbResult?.response?.data?.awb_code || awbResult?.awb_code || null;
    const courierName = awbResult?.response?.data?.courier_name || awbResult?.courier_name || null;
    const assignedCourierId = awbResult?.response?.data?.courier_company_id || parsedCourierId || null;

    if (!awbCode || awbResult?.awb_assign_status === 0) {
      const detailedError =
        awbResult?.response?.data?.awb_assign_error ||
        awbResult?.response?.data?.error ||
        awbResult?.response?.data?.message ||
        awbResult?.message ||
        (typeof awbResult?.response?.data === 'string' ? awbResult.response.data : null) ||
        `Shiprocket AWB Assignment Failed: ${JSON.stringify(awbResult)}`;

      console.error('[SHIPROCKET AWB REJECTED RESPONSE]');
      console.error('response:', JSON.stringify(awbResult, null, 2));

      res.status(400);
      throw new Error(detailedError);
    }

    order.shiprocket.awbCode = awbCode;
    if (courierName) order.shiprocket.courierName = courierName;
    if (assignedCourierId) order.shiprocket.courierId = Number(assignedCourierId);
    order.shiprocket.status = 'AWB_ASSIGNED';
    order.trackingId = awbCode;
    if (order.orderStatus === 'pending') {
      order.orderStatus = 'processing';
    }

    // Try auto-generating label as convenience
    try {
      const labelResult = await shiprocketService.generateLabel(shipmentId);
      if (labelResult?.label_url) {
        order.shiprocket.labelUrl = labelResult.label_url;
      }
    } catch (lErr) {
      console.warn('[SHIPROCKET] Label generation warning during AWB assignment:', lErr.message);
    }

    await order.save();
    console.log(`[SHIPROCKET] AWB assigned successfully: ${awbCode} via ${courierName || 'Courier'}`);
    return res.json({ success: true, awbCode, courierName, courierId: assignedCourierId, order });
  } catch (err) {
    const srErrData = err.response?.data;
    console.error(`[SHIPROCKET] AWB assignment error:`, srErrData || err.message);

    let errorMessage = err.message;
    if (srErrData) {
      if (typeof srErrData === 'string') {
        errorMessage = srErrData;
      } else if (srErrData.response?.data?.awb_assign_error) {
        errorMessage = srErrData.response.data.awb_assign_error;
      } else if (srErrData.response?.data?.error) {
        errorMessage = srErrData.response.data.error;
      } else if (srErrData.response?.data?.message) {
        errorMessage = srErrData.response.data.message;
      } else if (srErrData.message) {
        errorMessage = srErrData.message;
      } else if (srErrData.error) {
        errorMessage = srErrData.error;
      } else if (srErrData.errors) {
        errorMessage = typeof srErrData.errors === 'string' ? srErrData.errors : JSON.stringify(srErrData.errors);
      }
    }

    res.status(400);
    throw new Error(errorMessage || 'AWB generation failed');
  }
});

// @desc  Schedule pickup for shipment
// @route POST /api/shiprocket/pickup/:orderId
const schedulePickup = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.shiprocket || !order.shiprocket.shipmentId) {
    res.status(400);
    throw new Error('Create Shiprocket Order first before scheduling pickup');
  }

  if (!order.shiprocket.awbCode) {
    res.status(400);
    throw new Error('Generate AWB before scheduling pickup');
  }

  // Idempotency check
  if (order.shiprocket.pickupStatus === 'Scheduled') {
    return res.json({
      success: true,
      message: 'Pickup is already scheduled',
      pickup: { status: 'Scheduled' },
      order,
    });
  }

  try {
    const pickupData = await shiprocketService.schedulePickup(order.shiprocket.shipmentId);
    order.shiprocket.pickupStatus = 'Scheduled';
    order.shiprocket.status = 'PICKUP_SCHEDULED';
    await order.save();

    console.log(`[SHIPROCKET] Pickup scheduled for shipment ${order.shiprocket.shipmentId}`);
    res.json({ success: true, pickup: pickupData, order });
  } catch (err) {
    console.error(`[SHIPROCKET] Pickup schedule error:`, err.response?.data || err.message);
    res.status(400);
    throw new Error(err.response?.data?.message || err.message || 'Failed to schedule pickup');
  }
});

// @desc  Generate / fetch shipping label
// @route POST /api/shiprocket/label/:orderId
const generateLabel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.shiprocket || !order.shiprocket.shipmentId) {
    res.status(400);
    throw new Error('Create Shiprocket Order first');
  }

  try {
    const labelData = await shiprocketService.generateLabel(order.shiprocket.shipmentId);
    const labelUrl = labelData.label_url || labelData.label_created;

    if (labelUrl) {
      order.shiprocket.labelUrl = labelUrl;
      await order.save();
    }

    res.json({ success: true, labelUrl: labelUrl || order.shiprocket.labelUrl, data: labelData });
  } catch (err) {
    console.error(`[SHIPROCKET] Label generation error:`, err.response?.data || err.message);
    res.status(400);
    throw new Error(err.response?.data?.message || 'Failed to generate shipping label');
  }
});

// @desc  Generate Manifest
// @route POST /api/shiprocket/manifest/generate/:orderId
const generateManifest = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.shiprocket || !order.shiprocket.shipmentId) {
    res.status(400);
    throw new Error('Create Shiprocket Order first');
  }

  try {
    const manifestData = await shiprocketService.generateManifest(order.shiprocket.shipmentId);
    if (manifestData.manifest_url) {
      order.shiprocket.manifestUrl = manifestData.manifest_url;
      await order.save();
    }
    res.json({ success: true, manifestUrl: manifestData.manifest_url || null, data: manifestData });
  } catch (err) {
    console.error(`[SHIPROCKET] Manifest generation error:`, err.response?.data || err.message);
    res.status(400);
    throw new Error(err.response?.data?.message || 'Failed to generate manifest');
  }
});

// @desc  Print / Download Manifest
// @route POST /api/shiprocket/manifest/print/:orderId
const printManifest = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.shiprocket || !order.shiprocket.orderId) {
    res.status(400);
    throw new Error('Create Shiprocket Order first');
  }

  try {
    const printData = await shiprocketService.printManifest(order.shiprocket.orderId);
    const manifestUrl = printData.manifest_url || order.shiprocket.manifestUrl;

    if (manifestUrl) {
      order.shiprocket.manifestUrl = manifestUrl;
      await order.save();
    }

    res.json({ success: true, manifestUrl: manifestUrl || null, data: printData });
  } catch (err) {
    console.error(`[SHIPROCKET] Manifest print error:`, err.response?.data || err.message);
    res.status(400);
    throw new Error(err.response?.data?.message || 'Failed to fetch manifest PDF');
  }
});

// @desc  Cancel Shipment / Order on Shiprocket
// @route POST /api/shiprocket/cancel/:orderId
const cancelShipment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.orderStatus === 'cancelled' && order.shiprocket?.status === 'CANCELLED') {
    return res.json({
      success: true,
      message: 'Shipment already cancelled',
      order,
    });
  }

  if (!order.shiprocket || !order.shiprocket.orderId) {
    // If not pushed to Shiprocket, just cancel locally
    order.orderStatus = 'cancelled';
    await order.save();
    return res.json({ success: true, message: 'Order marked as cancelled locally', order });
  }

  try {
    const cancelData = await shiprocketService.cancelOrder([order.shiprocket.orderId]);
    order.shiprocket.status = 'CANCELLED';
    order.orderStatus = 'cancelled';
    await order.save();

    console.log(`[SHIPROCKET] Shipment cancelled for order ${order._id} (SR #${order.shiprocket.orderId})`);
    res.json({ success: true, message: 'Shipment cancelled on Shiprocket successfully', cancelData, order });
  } catch (err) {
    console.error(`[SHIPROCKET] Cancel shipment error:`, err.response?.data || err.message);
    res.status(400);
    throw new Error(err.response?.data?.message || 'Failed to cancel shipment on Shiprocket');
  }
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

  try {
    const trackingData = await shiprocketService.trackByAWB(order.shiprocket.awbCode);
    order.shiprocket.lastTrackedAt = new Date();
    await order.save();
    res.json({ success: true, tracking: trackingData });
  } catch (err) {
    console.error(`[SHIPROCKET] Tracking fetch error:`, err.response?.data || err.message);
    res.status(400);
    throw new Error(err.response?.data?.message || 'Failed to fetch tracking data');
  }
});

// @desc  Check pincode serviceability (Public endpoint for checkout page)
// @route GET /api/shiprocket/serviceability
const checkServiceability = asyncHandler(async (req, res) => {
  const { pincode, cod } = req.query;
  if (!pincode) {
    res.status(400);
    throw new Error('Delivery pincode is required');
  }

  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '251001';

  try {
    const data = await shiprocketService.checkServiceability(
      pickupPincode,
      pincode,
      0.5,
      cod === '1' ? 1 : 0
    );
    res.json({ success: true, serviceability: data });
  } catch (err) {
    console.error(`[SHIPROCKET] Serviceability check error:`, err.response?.data || err.message);
    res.status(400);
    throw new Error(err.response?.data?.message || 'Serviceability check failed');
  }
});

module.exports = {
  pushOrderToShiprocket,
  getAvailableCouriers,
  assignAWB,
  schedulePickup,
  generateLabel,
  generateManifest,
  printManifest,
  cancelShipment,
  trackOrder,
  checkServiceability,
};
