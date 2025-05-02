const mongoose = require("mongoose")

const authoritySchema= new mongoose.Schema({
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

const gsn = mongoose.model("gsn",authoritySchema)
module.exports = gsn