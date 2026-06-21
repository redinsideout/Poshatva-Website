const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, addAddress, firebaseLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);

module.exports = router;
