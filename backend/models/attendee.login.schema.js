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

const attendee = mongoose.model("attendee",authoritySchema)
module.exports = attendee