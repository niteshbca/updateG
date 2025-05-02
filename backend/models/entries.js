const mongoose = require('mongoose');

const entriesSchema = new mongoose.Schema({
    grinNo: {
        type: String,
        required: true
    },
    grinDate: {
        type: Date,
        required: true
    },
    gsn: {
        type: String,
        required: true
    },
    gsnDate: {
        type: Date,
        required: true
    },
    poNo: {
        type: String,
        required: true
    },
    poDate: {
        type: Date,
        required: true
    },
    partyName: {
        type: String,
        required: true
    },
    innoviceno: {
        type: String,
        required: true
    },
    innoviceDate: {
        type: Date,
        required: true
    },
    receivedFrom: {
        type: String,
        required: true
    },
    lrNo: {
        type: String,
        required: true
    },
    lrDate: {
        type: Date,
        required: true
    },
    transName: {
        type: String,
        required: true
    },
    vehicleNo: {
        type: String,
        required: true
    },
    file: {
        type: String
    },
    GeneralManagerSigned: {
        type: Boolean,
        default: false
    },
    StoreManagerSigned: {
        type: Boolean,
        default: false
    },
    PurchaseManagerSigned: {
        type: Boolean,
        default: false
    },
    AccountManagerSigned: {
        type: Boolean,
        default: false
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    tableData: [{
        description: String,
        unit: String,
        quantity: Number,
        rate: Number,
        amount: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Entries', entriesSchema); 