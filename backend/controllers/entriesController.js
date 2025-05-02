const Entries = require('../models/inventory.schema');

// Get all entries
exports.getAllEntries = async (req, res) => {
    try {
        console.log('getAllEntries called');
        console.log('Request headers:', req.headers);
        console.log('Request user:', req.user);
        
        const entries = await Entries.find();
        console.log('Found entries:', entries);
        
        if (!entries || entries.length === 0) {
            console.log('No entries found');
            return res.status(200).json([]);
        }
        
        res.status(200).json(entries);
    } catch (error) {
        console.error('Error in getAllEntries:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create new entry
exports.createEntry = async (req, res) => {
    try {
        const newEntry = new Entries(req.body);
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update entry visibility
exports.updateVisibility = async (req, res) => {
    try {
        const { _Id, isHidden } = req.body;
        const updatedEntry = await Entries.findByIdAndUpdate(
            _Id,
            { isHidden },
            { new: true }
        );
        if (!updatedEntry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.status(200).json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update manager signature
exports.updateManagerSignature = async (req, res) => {
    try {
        const { _Id, managerType, signed } = req.body;
        const updateField = {
            'GeneralManagerSigned': managerType === 'General Manager',
            'StoreManagerSigned': managerType === 'Store Manager',
            'PurchaseManagerSigned': managerType === 'Purchase Manager',
            'AccountManagerSigned': managerType === 'Account Manager'
        };

        const updatedEntry = await Entries.findByIdAndUpdate(
            _Id,
            { [Object.keys(updateField).find(key => updateField[key])]: signed },
            { new: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.status(200).json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single entry by ID
exports.getEntryById = async (req, res) => {
    try {
        const entry = await Entries.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to update the bill file path for a specific entry
exports.updateBill = async (req, res) => {
    try {
        console.log("updateBill called");
        console.log("Request body:", req.body);
        console.log("Request files:", req.files);

        const { partyId } = req.body;

        // 1. Check if partyId is provided
        if (!partyId) {
            return res.status(400).json({ message: 'Party ID is required' });
        }

        // 2. Check if file was uploaded by multer
        if (!req.files || !req.files.file || req.files.file.length === 0) {
            return res.status(400).json({ message: 'Bill file is required for update' });
        }

        const billFile = req.files.file[0];
        // Store relative path for the bill file (assuming your storage saves it here)
        const billFilePath = `entriesFiles/${billFile.filename}`; 
        console.log("New bill file path:", billFilePath);

        // 3. Find the entry by ID
        const entryToUpdate = await Entries.findById(partyId);

        if (!entryToUpdate) {
            return res.status(404).json({ message: 'Entry not found with the provided ID' });
        }

        // 4. Update the file path
        entryToUpdate.file = billFilePath;

        // 5. Save the updated entry
        const savedEntry = await entryToUpdate.save();

        console.log("Entry updated successfully:", savedEntry);
        // 6. Send success response
        res.status(200).json({ 
            message: 'Bill updated successfully', 
            entry: savedEntry 
        });

    } catch (error) {
        console.error('Error in updateBill:', error);
        // Handle potential CastError if partyId is not a valid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Party ID format' });
        }
        res.status(500).json({ message: 'Server error while updating bill', error: error.message });
    }
}; 