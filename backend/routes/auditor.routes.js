const express = require('express');
const auditorController = require('../controllers/auditor.controller');
const auth = require('../Middleware/authMiddleware');

// **** TEMP DEBUG LOG ****
console.log("--- Loading auditor.routes.js ---");

const router = express.Router();

// Public routes
router.post('/sign-up/auditor', auditorController.signupAuditor);
router.post('/log-in/auditor', auditorController.loginAuditor);

// Protected routes (Removed non-existent auth.isAdmin)
router.get('/getAll/auditor', auth.authMiddleware, auditorController.getAllAuditors);
router.delete('/getAll/auditor/delete/:id', auth.authMiddleware, auditorController.deleteAuditor);

module.exports = router; 