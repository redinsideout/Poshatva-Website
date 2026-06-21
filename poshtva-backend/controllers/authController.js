const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyFirebaseToken } = require('../config/firebase');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc  Register user
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill all fields');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: { 
      _id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      phone: user.phone, 
      addresses: user.addresses 
    },
  });
});

// @desc  Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      token: generateToken(user._id),
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        phone: user.phone, 
        addresses: user.addresses 
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc  Get current user
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

// @desc  Update profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  res.json({
    success: true,
    user: { 
      _id: updated._id, 
      name: updated.name, 
      email: updated.email, 
      role: updated.role, 
      phone: updated.phone, 
      addresses: updated.addresses 
    },
  });
});

// @desc  Add shipping address
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.addresses.push(req.body);
  const updated = await user.save();
  res.json({ success: true, user: updated });
});

// @desc  Firebase sign in / sign up (Google & Phone)
const firebaseLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error('Firebase ID token is required');
  }

  const decoded = await verifyFirebaseToken(token);
  const { uid, email, phone_number, name, picture } = decoded;

  let user = await User.findOne({ firebaseUid: uid });

  if (!user) {
    // Try to find by email if present, or by phone if present
    if (email) {
      user = await User.findOne({ email });
    }
    if (!user && phone_number) {
      user = await User.findOne({ phone: phone_number });
    }

    if (user) {
      // Link Firebase to existing account
      user.firebaseUid = uid;
      if (!user.phone && phone_number) user.phone = phone_number;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
      console.log(`🔗 Linked existing user account: ${user.email || user.phone} to Firebase UID: ${uid}`);
    } else {
      // Create new user
      user = await User.create({
        name: name || 'User',
        email: email || undefined,
        phone: phone_number || undefined,
        firebaseUid: uid,
        avatar: picture || '',
      });
      console.log(`🌱 Created new user via Firebase: ${user.email || user.phone}`);
    }
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: { 
      _id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      phone: user.phone, 
      addresses: user.addresses,
      avatar: user.avatar || ''
    },
  });
});

module.exports = { register, login, getMe, updateProfile, addAddress, firebaseLogin };
