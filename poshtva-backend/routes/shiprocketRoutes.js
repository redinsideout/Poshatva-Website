const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/shiprocketController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Admin-only Shiprocket routes
router.post('/push/:orderId', protect, adminOnly, pushOrderToShiprocket);
router.get('/couriers/:orderId', protect, adminOnly, getAvailableCouriers);
router.post('/assign-awb/:orderId', protect, adminOnly, assignAWB);
router.post('/pickup/:orderId', protect, adminOnly, schedulePickup);
router.post('/label/:orderId', protect, adminOnly, generateLabel);
router.post('/manifest/generate/:orderId', protect, adminOnly, generateManifest);
router.post('/manifest/print/:orderId', protect, adminOnly, printManifest);
router.post('/cancel/:orderId', protect, adminOnly, cancelShipment);
router.get('/track/:orderId', protect, adminOnly, trackOrder);

// Public — pincode serviceability check (used on checkout page)
router.get('/serviceability', checkServiceability);

module.exports = router;
