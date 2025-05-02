const express = require('express');
const router = express.Router()
const handler= require('../controllers/main.controller')




router.get("/",handler.getting)


module.exports = router
