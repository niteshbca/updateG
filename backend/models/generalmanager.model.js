const mongoose = require("mongoose")

const generalmanagerSchema= new mongoose.Schema({
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

const generalManager = mongoose.model("generalmanager",generalmanagerSchema)
module.exports = generalManager