const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const multerCloudinary = require('multer-storage-cloudinary');
const CloudinaryStorage = multerCloudinary.CloudinaryStorage || (typeof multerCloudinary === 'function' ? multerCloudinary : multerCloudinary.default);
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'poshatva_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed (JPG, PNG, WEBP)'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Upload handler
router.post('/', protect, adminOnly, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (e.g. file too large)
      console.error('[Upload] Multer error:', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      // File filter or other errors
      console.error('[Upload] File rejected:', err.message);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      console.warn('[Upload] No files received in request.');
      return res.status(400).json({ success: false, message: 'No files uploaded. Ensure the field name is "images".' });
    }

    console.log('[Upload] Files received:', req.files.length);
    req.files.forEach((f, i) => {
      console.log(`  [${i + 1}] ${f.originalname} → ${f.path}`);
    });

    const urls = req.files.map((f) => f.path);
    res.json({ success: true, urls });
  });
});

module.exports = router;
