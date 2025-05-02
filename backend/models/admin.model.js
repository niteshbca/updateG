const mongoose = require("mongoose")

const adminSchema= new mongoose.Schema({
    name:{type:String},
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true})

const admin = mongoose.model("admin",adminSchema)
module.exports = admin