const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrderById,
  markOrderAsPaid, getAllOrders, updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly, protectOptional } = require('../middleware/authMiddleware');

router.post('/', protectOptional, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/admin', protect, adminOnly, getAllOrders);
router.get('/:id', protectOptional, getOrderById);
router.put('/:id/pay', protect, markOrderAsPaid);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
