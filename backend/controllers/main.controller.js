const Entries = require('../models/inventory.schema')
const jwt = require('jsonwebtoken')
const gsnEntries = require('../models/gsnInventry.Schema')

require("dotenv").config()

const handler = {

    uploaddata:
        async function (req, res) {
            try { 
                console.log("=== Starting uploaddata handler ===");
                console.log("Request body:", req.body);
                console.log("Request files:", req.files ? Object.keys(req.files) : "No files");
                
                // Extract data from request
                const { 
                    grinNo, grinDate, gsn, gsnDate, poNo, poDate, 
                    partyName, innoviceno, innoviceDate, receivedFrom, 
                    lrNo, lrDate, transName, vehicleNo, 
                    materialInfo, tableData,
                    // Extract new fields
                    gstNo, cgst, sgst, companyName, address, mobileNo,
                    totalAmount // Add totalAmount to extracted fields
                } = req.body;
                
                // Log extracted new fields
                console.log("Backend Extracted - GST:", gstNo, "CGST:", cgst, "SGST:", sgst);
                console.log("Backend Extracted - Company:", companyName, "Address:", address, "Mobile:", mobileNo);
                console.log("Backend Extracted - Total Amount:", totalAmount); // Debug log

                // Parse totalAmount as a number
                const parsedTotalAmount = parseFloat(totalAmount) || 0;
                console.log("Parsed Total Amount:", parsedTotalAmount); // Debug log

                // Validate required fields
                if (!grinNo || !partyName) {
                    console.error("Missing required fields");
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                
                // Handle optional bill file
                let billFilePath = null;
                if (req.files && req.files.file && req.files.file.length > 0) {
                    const billFile = req.files.file[0];
                    // Store relative path for the bill file
                    billFilePath = `files/${billFile.filename}`;
                    console.log("Bill file path:", billFilePath);
                }

                // Check for the optional photo file
                let photoPath = null;
                if (req.files.photo && req.files.photo.length > 0) {
                    const photoFile = req.files.photo[0];
                    // Store relative path for the photo file
                    photoPath = `Entryphotos/${photoFile.filename}`;
                    console.log("Photo file path:", photoPath);
                } else {
                    console.log("No photo file uploaded");
                }

                // Parse tableData if it's a string
                let parsedTableData;
                try {
                    parsedTableData = typeof tableData === 'string' ? JSON.parse(tableData) : tableData;
                    console.log("Table data parsed successfully");
                } catch (parseError) {
                    console.error("Error parsing tableData:", parseError);
                    return res.status(400).json({ message: 'Invalid tableData format', error: parseError.message });
                }

                // Check for existing entry
                console.log("Checking for existing entry with grinNo:", grinNo);
                const existingEntry = await Entries.findOne({ grinNo });
                
                if (existingEntry) {
                    console.log("Existing entry found - updating with new data");
                    
                    // Update existing entry
                    const updateData = {
                        grinDate,
                        gsn,
                        gsnDate,
                        poNo,
                        poDate,
                        partyName,
                        innoviceno,
                        innoviceDate,
                        receivedFrom,
                        lrNo,
                        lrDate,
                        transName,
                        vehicleNo,
                        file: billFilePath,
                        materialInfo,
                        tableData: parsedTableData,
                        gstNo, cgst, sgst, companyName, address, mobileNo,
                        totalAmount: parsedTotalAmount // Use parsed value
                    };
                    
                    // Log update data before updating
                    console.log("Backend: updateData before findByIdAndUpdate:", updateData);
                    // Log the specific new fields within updateData
                    console.log("Backend Updating (GRIN) - GST:", updateData.gstNo, "CGST:", updateData.cgst, "SGST:", updateData.sgst);
                    console.log("Backend Updating (GRIN) - Company:", updateData.companyName, "Address:", updateData.address, "Mobile:", updateData.mobileNo);
                    
                    // Only update photoPath if a new photo was uploaded
                    if (photoPath) {
                        updateData.photoPath = photoPath;
                    }
                    
                    // Update the document
                    const updatedEntry = await Entries.findByIdAndUpdate(
                        existingEntry._id,
                        updateData,
                        { new: true, runValidators: true }
                    );
                    
                    console.log("Entry updated successfully");
                    return res.status(200).json({ 
                        message: 'Entry updated successfully', 
                        inventory: updatedEntry 
                    });
                }

                console.log("Creating new inventory entry");
                // Create and save new entry
                const newInventory = new Entries({
                    grinNo,
                    grinDate,
                    gsn,
                    gsnDate,
                    poNo,
                    poDate,
                    partyName,
                    innoviceno,
                    innoviceDate,
                    receivedFrom,
                    lrNo,
                    lrDate,
                    transName,
                    vehicleNo,
                    file: billFilePath,
                    photoPath: photoPath, // Save photo path if exists
                    materialInfo,
                    tableData: parsedTableData,
                    gstNo, cgst, sgst, companyName, address, mobileNo,
                    totalAmount: parsedTotalAmount // Use parsed value
                });

                // Log parsed table data before saving new entry
                console.log("Backend: parsedTableData before save (new entry):", parsedTableData);
                // Log the object before saving
                console.log("Backend Saving (GRIN - New):", newInventory);

                await newInventory.save();
                console.log("Entry saved successfully");
                res.status(201).json({ message: 'Inventory added successfully', inventory: newInventory });
                
            } catch (err) {
                console.error("Error in adding details:", err);
                // Check for specific MongoDB validation errors
                if (err.name === 'ValidationError') {
                    console.error("Validation error details:", err.errors);
                    return res.status(400).json({ 
                        message: 'Validation error', 
                        error: err.message,
                        details: Object.keys(err.errors).map(key => ({
                            field: key,
                            message: err.errors[key].message
                        }))
                    });
                }
                
                // Check for MongoDB connection errors
                if (err.name === 'MongoError' || err.name === 'MongoServerError') {
                    console.error("MongoDB error:", err.code);
                    return res.status(500).json({ 
                        message: 'Database error', 
                        error: err.message 
                    });
                }
                
                res.status(500).json({ message: 'Server error', error: err.message });
            }
        },
    getting: async function (req, res) {
        try {
            const data = await Entries.find()

            if (!data) {
                return res.send(404).send("data not found")
            }
            const token = jwt.sign({ data }, process.env.SECRET_KEY, { expiresIn: "1hr" })

            return res.status(200).send(data);
        } catch (err) {
            return res.status(404).send("error in fetching")
        }
    },




    // updateVerificationStatus: async function (req, res) {
    //     console.log("Request from the frontend coming........", req.body);
    //     const { _Id, managerType, status, isHidden } = req.body;

    //     const managerFieldMap = {
    //         'General Manager': 'GeneralManagerSigned',
    //         'Store Manager': 'StoreManagerSigned',
    //         'Purchase Manager': 'PurchaseManagerSigned',
    //         'Account Manager': 'AccountManagerSigned',
    //         'isHidden': 'isHidden'
    //     };

    //     try {
    //         // Determine the field to update based on the managerType
    //         const updateField = managerFieldMap[managerType];

    //         // Prepare update payload
    //         const updatePayload = {
    //             [updateField]: status === 'checked',
    //         };

    //         // Include `isHidden` only if it exists in the request body
    //         if (typeof isHidden !== 'undefined') {
    //             updatePayload.isHidden = isHidden;
    //         }

    //         // Update the document
    //         const result = await gsnEntries.findByIdAndUpdate(
    //             _Id,
    //             updatePayload,
    //             { new: true } // Return the updated document
    //         );

    //         console.log(result);
    //         if (!result) {
    //             return res.status(404).json({ message: 'Item not found' });
    //         }

    //         return res.status(200).json({ 
    //             message: 'Verification status updated successfully', 
    //             data: result 
    //         });
    //     } catch (err) {
    //         console.error("Error updating verification status", err);
    //         return res.status(500).json({ message: 'Server error' });
    //     }
    // }



//     updateVerificationStatus: async function (req, res) {
//         console.log("request from the fronend coming........")
//         const { _Id, managerType, status, isHidden } = req.body;
// console.log(_Id, managerType, status, isHidden)

//         const managerFieldMap = {
//             'General Manager': 'GeneralManagerSigned',
//             'Store Manager': 'StoreManagerSigned',
//             'Purchase Manager': 'PurchaseManagerSigned',
//             'Account Manager': 'AccountManagerSigned',
//             'isHidden': 'isHidden'
//         };


//         try {

//             const updateField = managerFieldMap[managerType];

//             // Update the document
//             const result = await Entries.findByIdAndUpdate(_Id,
//                 {
//                     [updateField]: status === 'checked',
//                     isHidden: isHidden  // Set isHidden based on status 
//                 },
//                 { new: true });
            
//             if (!result) {
//                 return res.status(404).json({ message: 'Item not found' });
//             }

//             return res.status(200).json({ message: 'Verification status updated successfully', data: result });
//         } catch (err) {
//             console.error("Error updating verification status", err);
//             return res.status(500).json({ message: 'Server error' });
//         }
//     }
updateVerificationStatus: async function (req, res) {
    console.log("request from the frontend coming........");
    const { _Id, managerType, status, isHidden } = req.body;
    console.log(_Id, managerType, status, isHidden);
  
    // Mapping for manager types to their corresponding field names
    const managerFieldMap = {
      'General Manager': 'GeneralManagerSigned',
      'Store Manager': 'StoreManagerSigned',
      'Purchase Manager': 'PurchaseManagerSigned',
      'Account Manager': 'AccountManagerSigned',
      'Auditor': 'AuditorSigned'
    };
  
    try {
      const updateField = managerFieldMap[managerType];
      
      if (!updateField) {
        console.error("Invalid manager type received:", managerType);
        return res.status(400).json({ message: "Invalid manager type" });
      }
      console.log(`Updating field: ${updateField} for ID: ${_Id}`);
      
      // Build the update object conditionally
      const updateObj = {
        [updateField]: status === 'checked'
      };
  
      // Only add isHidden if it is defined in the request
      if (typeof isHidden !== 'undefined') {
        console.log(`Updating isHidden to: ${isHidden}`);
        updateObj.isHidden = isHidden;
      }
      console.log("Update object:", updateObj);
  
      // Update the document with the constructed updateObj
      const result = await gsnEntries.findByIdAndUpdate(_Id, updateObj, { new: true });
      
      if (!result) {
        console.error("Item not found during update for ID:", _Id);
        return res.status(404).json({ message: 'Item not found' });
      }
      console.log("Update successful:", result);
  
      return res.status(200).json({ message: 'Verification status updated successfully', data: result });
    } catch (err) {
      console.error("Error updating verification status", err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
  



}

module.exports = handler
