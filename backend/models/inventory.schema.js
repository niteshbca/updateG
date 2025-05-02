const mongoose = require('mongoose');

// Schema for each table row
const tableDataSchema = new mongoose.Schema({
  item: {
    type: String,
  },
  description: {
    type: String,
  },
  quantityNo: {
    type: Number,
  },
  quantityKg: {
    type: Number,
  },
  price: {
    type: Number,
  }
}, { _id: false }); // _id is set to false to prevent nested IDs for each row

const entrySchema = new mongoose.Schema({
  grinNo: {
    type: String,
    required: true,
  },
  grinDate: {
    type: Date,
    required: true,
  },
  gsn: {
    type: String,
    required: true,
  },
  gsnDate: {
    type: Date,
    required: true,
  },
  poNo: {
    type: String,
    required: true,
  },
  poDate: {
    type: Date,
    required: true,
  },
  partyName: {
    type: String,
    required: true,
  },
  innoviceno: {
    type: String,
    required: true,
  },
  innoviceDate: {
    type: Date,
    required: true,
  },
  lrNo: {
    type: String,
    required: true,
  },
  lrDate: {
    type: Date,
    required: true,
  },
  transName: {
    type: String,
    required: true,
  },
  vehicleNo: {
    type: String,
    required: true,
  },
  file: {
    type: String, // File path or URL
  },
  photoPath: {
    type: String, // Photo file path
    required: false, // Optional
  },
  PurchaseManagerSigned: {
    type: Boolean,
    default: false,
  },
  isHidden: { 
    type: Boolean, 
    default: false 
  },
  createdBy:{
    type:String
  },
  StoreManagerSigned: {
    type: Boolean,
    default: false,
  },
  GeneralManagerSigned: {
    type: Boolean,
    default: false,
  },
  AccountManagerSigned: {
    type: Boolean,
    default: false,
  },
  // Added New Fields (GRIN)
  gstNo: { type: String, required: false },
  cgst: { type: Number, required: false },
  sgst: { type: Number, required: false },
  companyName: { type: String, required: false },
  address: { type: String, required: false },
  mobileNo: { type: String, required: false },
  // End Added Fields
  totalAmount: { type: Number, required: false }, // Added Total Amount field
  tableData: [tableDataSchema], // Array of tableData objects
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Entries = mongoose.model('Entries', entrySchema);

module.exports = Entries;


