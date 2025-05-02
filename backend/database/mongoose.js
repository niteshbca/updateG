const mongoose = require('mongoose')
let db;
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();
const URL = process.env.URL;
const PORT = process.env.PORT;

 const connection = async()=> {
    try {
         db=await mongoose.connect(URL)
        console.log("connected to database")
        return db
    }

    catch (err) {
        console.log("error in connecting database", err)
    }
}

connection()

module.exports = db
