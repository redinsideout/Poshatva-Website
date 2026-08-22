const axios = require('axios');

/**
 * Shiprocket API Service
 * Handles authentication, order creation, AWB assignment,
 * label generation, pickup scheduling, and tracking.
 *
 * Token is cached in-memory and auto-refreshed on 401.
 */

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiresAt = null;

// ── Helpers ──────────────────────────────────────────────

function shiprocketAxios() {
  return axios.create({
    baseURL: SHIPROCKET_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  });
}

async function getToken() {
  // Reuse token if it hasn't expired (refresh every 9 days; token valid for 10)
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  return authenticate();
}

// ── Authentication ───────────────────────────────────────

async function authenticate() {
  try {
    const { data } = await shiprocketAxios().post('/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });
    cachedToken = data.token;
    // Refresh 1 day before expiry (token valid ~10 days)
    tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
    console.log('[SHIPROCKET] Authenticated successfully');
    return cachedToken;
  } catch (err) {
    console.error('[SHIPROCKET] Authentication failed:', err.response?.data || err.message);
    throw new Error('Shiprocket authentication failed');
  }
}

/**
 * Make an authenticated request. Auto-retries once on 401 (expired token).
 */
async function apiRequest(method, url, data = null, params = null) {
  const token = await getToken();
  const config = {
    method,
    url: `${SHIPROCKET_BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    timeout: 30000,
  };
  if (data) config.data = data;
  if (params) config.params = params;

  try {
    const response = await axios(config);
    return response.data;
  } catch (err) {
    // If 401, try refreshing the token once
    if (err.response?.status === 401) {
      console.log('[SHIPROCKET] Token expired, re-authenticating...');
      cachedToken = null;
      tokenExpiresAt = null;
      const newToken = await authenticate();
      config.headers.Authorization = `Bearer ${newToken}`;
      const retryResponse = await axios(config);
      return retryResponse.data;
    }
    console.error(`[SHIPROCKET] API Error (${method} ${url}):`, err.response?.data || err.message);
    throw err;
  }
}

// ── Create Order ─────────────────────────────────────────

/**
 * Push a Poshatva order to Shiprocket.
 * @param {Object} order - Mongoose Order document (populated with product data)
 * @returns {Object} { order_id, shipment_id, status, ... }
 */
async function createOrder(order) {
  const orderItems = order.orderItems.map((item, index) => {
    const itemName = item.variantName ? `${item.name} - ${item.variantName}` : item.name;
    return {
      name: itemName,
      sku: item.variantId || (item.product ? item.product.toString() : `SKU-${index}`),
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
      hsn: '',
    };
  });

  // Calculate total weight from order items (uses variant weightInKg if present)
  const totalWeight = order.orderItems.reduce((sum, item) => {
    const itemWeight = item.weightInKg || 0.5;
    return sum + itemWeight * item.quantity;
  }, 0);

  const payload = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt).toISOString().split('T')[0],
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    channel_id: '',
    comment: order.orderNotes || '',
    billing_customer_name: order.shippingAddress.fullName.split(' ')[0],
    billing_last_name: order.shippingAddress.fullName.split(' ').slice(1).join(' ') || '',
    billing_address: order.shippingAddress.street,
    billing_address_2: '',
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.pincode,
    billing_state: order.shippingAddress.state,
    billing_country: 'India',
    billing_email: order.shippingAddress.email || '',
    billing_phone: order.shippingAddress.phone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    shipping_charges: order.shippingPrice || 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: order.itemsPrice,
    length: 20,
    breadth: 15,
    height: 10,
    weight: Math.max(totalWeight, 0.5), // Minimum 0.5 kg
  };

  const result = await apiRequest('POST', '/orders/create/adhoc', payload);
  console.log(`[SHIPROCKET] Order created: SR #${result.order_id}, Shipment #${result.shipment_id}`);
  return result;
}

// ── Assign AWB (Auto-assign recommended courier) ────────

// ── Assign AWB ─────────────────────────────────────────

/**
 * Assign courier (auto-assign or admin selected courier) and get AWB.
 * Diagnostic logging enabled — prints complete Shiprocket response.
 */
async function assignAWB(shipmentId, courierId = null) {
  const parsedShipmentId = Number(shipmentId) || shipmentId;
  const payload = { shipment_id: parsedShipmentId };
  
  if (courierId !== null && courierId !== undefined && courierId !== '') {
    payload.courier_id = Number(courierId) || courierId;
  }

  console.log("[SHIPROCKET AWB REQUEST]", {
    shipment_id: payload.shipment_id,
    courier_id: payload.courier_id || null,
    payload: payload
  });

  const token = await getToken();
  const axiosConfig = {
    method: 'POST',
    url: `${SHIPROCKET_BASE_URL}/courier/assign/awb`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: payload,
    timeout: 30000,
  };

  try {
    const response = await axios(axiosConfig);

    console.log("[SHIPROCKET AWB RAW RESPONSE]", {
      status: response.status,
      data: response.data
    });

    return response.data;
  } catch (error) {
    console.error("[SHIPROCKET AWB RAW ERROR]", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
}

// ── Generate Shipping Label ──────────────────────────────

/**
 * Generate shipping label for a shipment.
 * @param {Number|Array} shipmentIds - Single or array of shipment IDs
 * @returns {Object} { label_url, ... }
 */
async function generateLabel(shipmentIds) {
  const ids = Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds];
  const result = await apiRequest('POST', '/courier/generate/label', {
    shipment_id: ids,
  });
  console.log(`[SHIPROCKET] Label generated for shipments: ${ids.join(', ')}`);
  return result;
}

// ── Manifest Management ──────────────────────────────────

/**
 * Generate manifest for shipment(s).
 * @param {Number|Array} shipmentIds
 * @returns {Object} { status, manifest_url, ... }
 */
async function generateManifest(shipmentIds) {
  const ids = Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds];
  const result = await apiRequest('POST', '/manifests/generate', {
    shipment_id: ids,
  });
  console.log(`[SHIPROCKET] Manifest generated for shipments: ${ids.join(', ')}`);
  return result;
}

/**
 * Print / download manifest for order(s).
 * @param {Number|Array} orderIds - Shiprocket order IDs
 * @returns {Object} { manifest_url, ... }
 */
async function printManifest(orderIds) {
  const ids = Array.isArray(orderIds) ? orderIds : [orderIds];
  const result = await apiRequest('POST', '/manifests/print', {
    order_ids: ids,
  });
  console.log(`[SHIPROCKET] Manifest print URL generated for orders: ${ids.join(', ')}`);
  return result;
}

// ── Schedule Pickup ──────────────────────────────────────

/**
 * Schedule courier pickup for a shipment.
 * @param {Number|Array} shipmentIds
 * @returns {Object} pickup confirmation
 */
async function schedulePickup(shipmentIds) {
  const ids = Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds];
  const result = await apiRequest('POST', '/courier/generate/pickup', {
    shipment_id: ids,
  });
  console.log(`[SHIPROCKET] Pickup scheduled for shipments: ${ids.join(', ')}`);
  return result;
}

// ── Track Shipment ───────────────────────────────────────

/**
 * Track a shipment by AWB code.
 * @param {String} awbCode
 * @returns {Object} tracking data with milestones
 */
async function trackByAWB(awbCode) {
  return apiRequest('GET', `/courier/track/awb/${awbCode}`);
}

/**
 * Track a shipment by Shiprocket order ID.
 * @param {Number} shiprocketOrderId
 * @returns {Object} tracking data
 */
async function trackByOrderId(shiprocketOrderId) {
  return apiRequest('GET', `/courier/track/shipment/order/${shiprocketOrderId}`);
}

// ── Cancel Order ─────────────────────────────────────────

/**
 * Cancel an order on Shiprocket.
 * @param {Array} orderIds - Array of Shiprocket order IDs
 * @returns {Object}
 */
async function cancelOrder(orderIds) {
  const ids = Array.isArray(orderIds) ? orderIds : [orderIds];
  const result = await apiRequest('POST', '/orders/cancel', {
    ids,
  });
  console.log(`[SHIPROCKET] Orders cancelled: ${ids.join(', ')}`);
  return result;
}

// ── Check Serviceability & Couriers ──────────────────────

/**
 * Check if delivery is available for a pincode and get estimated delivery dates.
 * @param {String} pickupPincode - Seller's pincode
 * @param {String} deliveryPincode - Customer's pincode
 * @param {Number} weight - Package weight in kg
 * @param {Number} cod - 1 for COD, 0 for prepaid
 * @returns {Object} available couriers with rates and ETD
 */
async function checkServiceability(pickupPincode, deliveryPincode, weight = 0.5, cod = 0) {
  return apiRequest('GET', '/courier/serviceability/', null, {
    pickup_postcode: pickupPincode,
    delivery_postcode: deliveryPincode,
    weight,
    cod,
  });
}

// ── Full Fulfillment Flow ────────────────────────────────

/**
 * Complete fulfillment: create order → assign AWB → generate label → schedule pickup.
 * Called automatically after payment confirmation.
 * @param {Object} order - Mongoose Order document
 * @returns {Object} { shiprocketOrderId, shipmentId, awbCode, courierName, labelUrl }
 */
async function fulfillOrder(order) {
  // Step 1: Create the order on Shiprocket
  const createResult = await createOrder(order);
  const shiprocketOrderId = createResult.order_id;
  const shipmentId = createResult.shipment_id;

  if (!shipmentId) {
    console.error('[SHIPROCKET] No shipment_id received from order creation');
    return {
      shiprocketOrderId,
      shipmentId: null,
      awbCode: null,
      courierName: null,
      labelUrl: null,
    };
  }

  // Step 2: Auto-assign AWB (cheapest & fastest courier)
  let awbCode = null;
  let courierName = null;
  try {
    const awbResult = await assignAWB(shipmentId);
    awbCode = awbResult?.response?.data?.awb_code || null;
    courierName = awbResult?.response?.data?.courier_name || null;
  } catch (awbErr) {
    console.error('[SHIPROCKET] AWB assignment failed (can retry manually):', awbErr.response?.data || awbErr.message);
  }

  // Step 3: Generate label (only if AWB assigned)
  let labelUrl = null;
  if (awbCode) {
    try {
      const labelResult = await generateLabel(shipmentId);
      labelUrl = labelResult.label_url || null;
    } catch (labelErr) {
      console.error('[SHIPROCKET] Label generation failed (can retry manually):', labelErr.response?.data || labelErr.message);
    }
  }

  // Step 4: Schedule pickup (only if AWB assigned)
  if (awbCode) {
    try {
      await schedulePickup(shipmentId);
    } catch (pickupErr) {
      console.error('[SHIPROCKET] Pickup scheduling failed (can retry manually):', pickupErr.response?.data || pickupErr.message);
    }
  }

  return {
    shiprocketOrderId,
    shipmentId,
    awbCode,
    courierName,
    labelUrl,
  };
}

module.exports = {
  authenticate,
  createOrder,
  assignAWB,
  generateLabel,
  generateManifest,
  printManifest,
  schedulePickup,
  trackByAWB,
  trackByOrderId,
  cancelOrder,
  checkServiceability,
  fulfillOrder,
};
