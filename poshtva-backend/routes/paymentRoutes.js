const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const { protectOptional } = require('../middleware/authMiddleware');

router.post('/create-order', protectOptional, createRazorpayOrder);
router.post('/verify', protectOptional, verifyPayment);

module.exports = router;
