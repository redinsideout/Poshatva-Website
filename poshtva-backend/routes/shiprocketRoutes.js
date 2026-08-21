const express = require('express');
const router = express.Router();
const {
  pushOrderToShiprocket,
  trackOrder,
  generateLabel,
  schedulePickup,
  checkServiceability,
  retryAssignAWB,
} = require('../controllers/shiprocketController');
const { protect, adminOnly, protectOptional } = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/push/:orderId', protect, adminOnly, pushOrderToShiprocket);
router.get('/track/:orderId', protect, adminOnly, trackOrder);
router.post('/label/:orderId', protect, adminOnly, generateLabel);
router.post('/pickup/:orderId', protect, adminOnly, schedulePickup);
router.post('/assign-awb/:orderId', protect, adminOnly, retryAssignAWB);

// Public — pincode serviceability (used on checkout page)
router.get('/serviceability', checkServiceability);

module.exports = router;
