const express = require('express');
const router = express.Router();
const entriesController = require('../controllers/entriesController');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../Middleware/authMiddleware'); // Add auth middleware

// Ensure base directories exist (Consider moving this to a central config/init file)
const fileDir = path.join(__dirname, '../files');
const photoDir = path.join(__dirname, '../Entryphotos');
fs.mkdirSync(fileDir, { recursive: true });
fs.mkdirSync(photoDir, { recursive: true });

// Multer storage engine (reuse logic from upload.route.js)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest;
    if (file.fieldname === 'file') { // Bill file
        dest = fileDir;
    } else if (file.fieldname === 'photo') { // Photo file
        dest = photoDir;
    } else {
        return cb(new Error('Unexpected file fieldname'), null);
    }
    console.log(`Saving ${file.fieldname} to:`, dest);
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix);
  }
});

// Multer file filter (reuse logic from upload.route.js)
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "photo") {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload only images.'), false);
        }
    } else {
        cb(null, true); // Accept other files (like the bill)
    }
};

// Multer error handler (reuse logic from upload.route.js)
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

// Configure multer (adjust as needed, maybe add file filters)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
});

// Get all entries
router.get('/getdata1', entriesController.getAllEntries);

// Create new entry
router.post('/create', entriesController.createEntry);

// Update entry visibility
router.post('/verify', entriesController.updateVisibility);

// Update manager signature
router.post('/update-signature', entriesController.updateManagerSignature);

// Update bill file for an entry
router.post('/update-bill', 
    auth.authMiddleware, // Ensure user is authenticated
    (req, res, next) => { // Middleware to log before multer
        console.log("[/update-bill] Auth middleware passed. Request body:", req.body);
        next();
    },
    upload.fields([{ name: 'file', maxCount: 1 }]), // Handle 'file' field
    multerErrorHandler, // Handle multer errors
    (req, res, next) => { // Middleware to log after multer
        console.log("[/update-bill] Multer middleware passed. Files processed:", req.files ? Object.keys(req.files) : "No files");
        console.log("[/update-bill] Request body after multer:", req.body);
        next();
    },
    entriesController.updateBill // Call the controller function
);

// Get single entry by ID
router.get('/:id', entriesController.getEntryById);

module.exports = router; 