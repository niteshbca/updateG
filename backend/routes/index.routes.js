const express = require('express');
const router = express.Router()
const attendeeHandler = require('../controllers/attendee.controller')
const storeManagerHandler = require('../controllers/storemanager.controller')
const purchaseManagerManagerHandler =require('../controllers/purchasemanager.controller')
const generalManagerHandler = require('../controllers/generalmanager.controller')
const adminHandler = require('../controllers/admin.controller')
const handler= require('../controllers/main.controller')
const accountantHandeler=require('../controllers/accountant.controller')
const auth =require('../Middleware/authMiddleware')
const gsnHandler=require('../controllers/gsn.controller')
const gsnGetRoute = require('./gsngetroute')
const auditorRoutes = require('./auditor.routes');

router.get('/',(req,res)=>{
    res.send("hii")
})

// uploading nd getting entries
router.use('/upload-data',require('./upload.route'))
router.use("/getdata",auth.authMiddleware,require('./get.route'))

// Entries routes
router.use('/entries', auth.authMiddleware, require('./entriesRoutes'))

// Admin routes
router.post('/sign-up/admin',adminHandler.addauthority)
router.post('/log-in/admin',adminHandler.getauthority)
router.get('/getall/admin',auth.authMiddleware,adminHandler.getAllAuthority)
router.delete('/getall/admin/delete/:id',auth.authMiddleware,adminHandler.deleteuser)

// GSN routes
router.use('/gsn/upload-data',require('./gsnuploadroute'))
router.use("/gsn/getdata", auth.authMiddleware, require('./gsngetroute'))
router.post('/sign-up/gsn',gsnHandler.addauthority)
router.post('/log-in/gsn',gsnHandler.getauthority)
router.get('/getall/gsn',gsnHandler.getAllAuthority)
router.delete('/getall/gsn/delete/:id',gsnHandler.deleteuser)

// Attendee routes
router.post("/log-in/attendee",attendeeHandler.getauthority)
router.post('/sign-up/attendee',auth.authMiddleware,attendeeHandler.addauthority)
router.get('/getall/attendee',auth.authMiddleware,attendeeHandler.getAllAuthority)
router.delete('/getall/attendee/delete/:id',auth.authMiddleware,attendeeHandler.deleteuser)

// Store manager routes
router.post('/sign-up/storemanager',auth.authMiddleware,storeManagerHandler.addauthority)
router.post('/log-in/storemanager',storeManagerHandler.getauthority)
router.get('/getall/storemanager',auth.authMiddleware,storeManagerHandler.getAllAuthority)
router.delete('/getall/storemanager/delete/:id',auth.authMiddleware,storeManagerHandler.deleteuser)

// General manager routes
router.post('/sign-up/generalmanager',auth.authMiddleware,generalManagerHandler.addauthority)
router.post('/log-in/generalmanager',generalManagerHandler.getauthority)
router.get('/getall/generalmanager',auth.authMiddleware,generalManagerHandler.getAllAuthority)
router.delete('/getall/generalmanager/delete/:id',auth.authMiddleware,generalManagerHandler.deleteuser)

// Purchase manager routes
router.post('/sign-up/purchasemanager',auth.authMiddleware,purchaseManagerManagerHandler.addauthority)
router.post('/log-in/purchasemanager',purchaseManagerManagerHandler.getauthority)
router.get('/getall/purchasemanager',auth.authMiddleware,purchaseManagerManagerHandler.getAllAuthority)
router.delete('/getall/purchasemanager/delete/:id',auth.authMiddleware,purchaseManagerManagerHandler.deleteuser)

// Account manager routes
router.post('/sign-up/accountmanager',auth.authMiddleware,accountantHandeler.addauthority)
router.post('/log-in/accountmanager',accountantHandeler.getauthority)
router.get('/getall/accountmanager',auth.authMiddleware,accountantHandeler.getAllAuthority)
router.delete('/getall/accountmanager/delete/:id',auth.authMiddleware,accountantHandeler.deleteuser)

// Document verification route
router.post('/verify', auth.authMiddleware, handler.updateVerificationStatus);

// Use Auditor routes
router.use('/', auditorRoutes);

module.exports = router
