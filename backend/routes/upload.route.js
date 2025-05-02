const express = require('express')
const router = express.Router()
const handler = require('../controllers/main.controller')
const auth = require('../Middleware/authMiddleware')

const path = require('path')
const fs = require('fs')
const multer = require('multer')

// Ensure base directories exist
const fileDir = path.join(__dirname, '../files')
const photoDir = path.join(__dirname, '../Entryphotos') // New directory for photos
fs.mkdirSync(fileDir, { recursive: true })
fs.mkdirSync(photoDir, { recursive: true })

// Storage engine using function to determine destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest
    if (file.fieldname === 'file') { // Bill file
        dest = fileDir
    } else if (file.fieldname === 'photo') { // Photo file
        dest = photoDir
    } else {
        // Handle unexpected fieldname
        return cb(new Error('Unexpected file fieldname'), null)
    }
    console.log(`Saving ${file.fieldname} to:`, dest)
    cb(null, dest)
  },
  filename: function (req, file, cb) {
    // Keep original name with timestamp prefix for uniqueness
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_') // Replace spaces
    cb(null, uniqueSuffix)
  }
})

// File filter for images (optional but recommended)
const imageFileFilter = (req, file, cb) => {
    if (file.fieldname === "photo") { // Only apply to photo field
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Not an image! Please upload only images.'), false)
        }
    } else {
        cb(null, true) // Accept other files (like the bill)
    }
}

// Error handling for multer
const multerErrorHandler = (err, req, res, next) => {
  if (err) {
    console.error("Multer error:", err);
    return res.status(400).json({ 
      message: 'File upload error', 
      error: err.message 
    });
  }
  next();
};

// Configure multer to handle multiple fields
const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter, // Apply the filter
    limits: { fileSize: 1024 * 1024 * 5 } // Optional: Limit file size (e.g., 5MB)
})

// Update route to use upload.fields()
router.post('/', 
  auth.authMiddleware,  // Re-enable auth middleware
  function(req, res, next) {
    console.log("Upload request received");
    console.log("Request headers:", req.headers);
    next();
  },
  upload.fields([
    { name: 'file', maxCount: 1 }, 
    { name: 'photo', maxCount: 1 }
  ]),
  multerErrorHandler,
  function(req, res, next) {
    console.log("Files uploaded successfully");
    console.log("Request files:", req.files);
    next();
  },
  handler.uploaddata
)

module.exports = router