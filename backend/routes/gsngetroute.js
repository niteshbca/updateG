const express = require('express');
const router = express.Router()
const gsnHandler= require('../controllers/gsnmain.controller')




router.get("/",gsnHandler.getting)


module.exports = router
