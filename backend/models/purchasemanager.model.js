const mongoose = require("mongoose")

const purchasemanagerSchema= new mongoose.Schema({
    name:{
        type:String,
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true})

const PurchaseManager = mongoose.model("purchasemanager",purchasemanagerSchema)
module.exports = PurchaseManager