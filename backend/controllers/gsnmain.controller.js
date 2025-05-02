const gsnEntries = require('../models/gsnInventry.Schema')
const jwt = require('jsonwebtoken')
require("dotenv").config()
const gsnHandler = {

    uploaddata:
        async function (req, res) {
            try {
                console.log("Request body:", req.body);
                console.log("Request files:", req.files);
                
                const { 
                    grinNo, grinDate, gsn, gsnDate, poNo, poDate, 
                    partyName, innoviceno, innoviceDate, lrNo, lrDate, 
                    transName, vehicleNo, materialInfo, tableData,
                    // Extract new fields
                    gstNo, cgst, sgst, companyName, address, mobileNo,
                    totalAmount // Extract total amount
                } = req.body;
                
                // Log extracted new fields
                console.log("Backend Extracted - GST:", gstNo, "CGST:", cgst, "SGST:", sgst);
                console.log("Backend Extracted - Company:", companyName, "Address:", address, "Mobile:", mobileNo);

                // Handle optional bill file
                let billFilePath = null;
                if (req.files && req.files.file && req.files.file.length > 0) {
                    const billFile = req.files.file[0];
                    // Store relative path for the bill file
                    billFilePath = `gsnfiles/${billFile.filename}`;
                    console.log("Bill file path:", billFilePath);
                }

                // Check for the optional photo file
                let photoPath = null;
                if (req.files && req.files.photo && req.files.photo.length > 0) {
                    const photoFile = req.files.photo[0];
                    // Store relative path for the photo file
                    photoPath = `gsnPhotos/${photoFile.filename}`;
                    console.log("Photo file path:", photoPath);
                }

                // Parse tableData if it's a string
                let parsedTableData;
                try {
                    parsedTableData = typeof tableData === 'string' ? JSON.parse(tableData) : tableData;
                } catch (parseError) {
                    console.error("Error parsing tableData:", parseError);
                    return res.status(400).json({ message: 'Invalid tableData format' });
                }

                // Check for duplicate entry
                const existData = await gsnEntries.findOne({ grinNo });
                if (existData) {
                    return res.status(400).json({ message: "Duplicate entry found" });
                }

                // Log parsed table data before saving
                console.log("Backend: parsedTableData before save:", parsedTableData);

                // Create and save new entry
                const newInventory = new gsnEntries({
                    grinNo,
                    grinDate,
                    gsn,
                    gsnDate,
                    poNo,
                    poDate,
                    partyName,
                    innoviceno,
                    innoviceDate,
                    lrNo,
                    lrDate,
                    transName,
                    vehicleNo,
                    file: billFilePath,
                    photoPath: photoPath, // Save photo path if exists
                    materialInfo,
                    tableData: parsedTableData,
                    gstNo,
                    cgst,
                    sgst,
                    companyName,
                    address,
                    mobileNo,
                    totalAmount // Add total amount
                });

                // Log the object before saving
                console.log("Backend Saving (GSN):", newInventory);

                await newInventory.save();
                res.status(201).json({ message: 'Inventory added successfully', inventory: newInventory });
                
            } catch (err) {
                console.error("Error in adding details:", err);
                res.status(500).json({ message: 'Server error', error: err.message });
            }
        },
    getting: async function (req, res) {
        try {
            console.log("Fetching GSN entries...");
            console.log("Request headers:", req.headers);
            console.log("Request user:", req.user);
            
            const data = await gsnEntries.find();
            console.log("Found GSN entries:", data);
            
            if (!data || data.length === 0) {
                console.log("No GSN entries found");
                return res.status(200).json([]);
            }
            
            return res.status(200).json(data);
        } catch (err) {
            console.error("Error in getting GSN entries:", err);
            return res.status(500).json({ message: "Error fetching GSN entries", error: err.message });
        }
    },





    updateVerificationStatus: async function (req, res) {
        console.log("request from the fronend coming........", req.body)
        const { _Id, managerType, status,isHidden } = req.body;


        const managerFieldMap = {
            'General Manager': 'GeneralManagerSigned',
            'Store Manager': 'StoreManagerSigned',
            'Purchase Manager': 'PurchaseManagerSigned',
            'Account Manager': 'AccountManagerSigned',
            'isHidden':'isHidden'
        };


        try {
            // Determine the field to update based on the managerType
            // const updateField = `${managerType}Signed`;
            const updateField = managerFieldMap[managerType];

            // Update the document
            const result = await gsnEntries.findByIdAndUpdate(_Id, 
                { 
                    [updateField]: status === 'checked',
                    isHidden: isHidden  // Set isHidden based on status 
                },
                 { new: true });

            if (!result) {
                return res.status(404).json({ message: 'Item not found' });
            }

            return res.status(200).json({ message: 'Verification status updated successfully', data: result });
        } catch (err) {
            console.error("Error updating verification status", err);
            return res.status(500).json({ message: 'Server error' });
        }
    }




}

module.exports = gsnHandler
