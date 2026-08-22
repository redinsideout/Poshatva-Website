const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Memory storage for buffer-based Cloudinary stream uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPG, JPEG, PNG, WEBP)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Upload buffer to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer
 * @param {String} folder
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder = 'poshatva_uploads') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

// POST /api/upload — Upload images to Cloudinary (Admin only)
router.post('/', protect, adminOnly, (req, res) => {
  upload.array('images', 5)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('[Upload] Multer error:', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      console.error('[Upload] File validation rejected:', err.message);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      console.warn('[Upload] No files received in request.');
      return res.status(400).json({ success: false, message: 'No files uploaded. Ensure the field name is "images".' });
    }

    // Verify Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('[Upload] Missing Cloudinary credentials in environment');
      return res.status(500).json({ success: false, message: 'Cloudinary storage credentials missing on server.' });
    }

    try {
      console.log(`[Upload] Uploading ${req.files.length} image(s) to Cloudinary folder "poshatva_uploads"...`);
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'poshatva_uploads'));
      const results = await Promise.all(uploadPromises);

      const urls = results.map((r) => r.secure_url);
      console.log('[Upload] Upload completed successfully:', urls);
      return res.json({ success: true, urls });
    } catch (uploadErr) {
      console.error('[Upload] Cloudinary stream upload failed:', uploadErr.message || uploadErr);
      return res.status(500).json({ success: false, message: uploadErr.message || 'Cloudinary upload failed' });
    }
  });
});

module.exports = router;
