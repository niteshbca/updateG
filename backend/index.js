require('dotenv').config()

const express = require('express');
const port = process.env.PORT || 5001
const cors = require('cors')
const db = require('./database/mongoose')
const router = require('./routes/index.routes')
const path = require('path')
const bodyParser = require('body-parser')

const app = express()
app.use(express.json());
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/files', express.static(path.join(__dirname, "files")))
app.use('/gsnfiles', express.static(path.join(__dirname, 'gsnfiles')));
app.use('/gsnPhotos', express.static(path.join(__dirname, 'gsnPhotos')));
app.use('/Entryfiles', express.static(path.join(__dirname, 'Entryfiles')));
app.use('/Entryphotos', express.static(path.join(__dirname, 'Entryphotos')));
app.use('/', router)

app.listen(port, (err) => {
    if (err) {
        console.log(err)
        return
    }
    console.log("Server is running on port:", port)
})


process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});