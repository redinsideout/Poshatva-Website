const express = require('express');
const router = express.Router();
const { handleShiprocketWebhook } = require('../controllers/webhookController');

// Public endpoint — no auth required (Shiprocket needs to call this)
router.post('/shiprocket', handleShiprocketWebhook);

module.exports = router;
