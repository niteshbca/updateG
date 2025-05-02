const Auditor = require('../models/auditor.schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Signup Auditor
exports.signupAuditor = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const existingAuditor = await Auditor.findOne({ username });
    if (existingAuditor) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const newAuditor = new Auditor({ name, username, password });
    await newAuditor.save();
    res.status(201).json({ message: 'Auditor registered successfully' });
  } catch (error) {
    console.error('Error signing up auditor:', error);
    res.status(500).json({ message: 'Error registering auditor', error: error.message });
  }
};

// Login Auditor
exports.loginAuditor = async (req, res) => {
  console.log("--- Auditor Login Attempt --- Body:", req.body);
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
       console.error("Login Error: Username or password missing");
       return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log(`Searching for auditor with username: ${username}`);
    const auditor = await Auditor.findOne({ username });

    if (!auditor) {
        console.warn(`Login Failed: Auditor not found for username: ${username}`);
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log(`Auditor found: ${auditor.username} (ID: ${auditor._id})`);

    console.log("Comparing provided password with stored hash...");
    const isMatch = await bcrypt.compare(password, auditor.password);

    if (!isMatch) {
        console.warn(`Login Failed: Password mismatch for username: ${username}`);
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log("Password match successful.");

    // Generate JWT token
    console.log("Generating JWT token...");
    const token = jwt.sign(
        { userId: auditor._id, role: 'auditor' }, // Payload
        process.env.SECRET_KEY, // Secret Key
        { expiresIn: '1h' } // Options
    );
    console.log("JWT token generated successfully.");

    res.status(200).json({ token });
    console.log(`--- Auditor Login Successful for ${username} ---`);

  } catch (error) {
    console.error('Error logging in auditor:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get All Auditors
exports.getAllAuditors = async (req, res) => {
  try {
    const auditors = await Auditor.find({}, 'name username createdAt'); // Select specific fields
    res.status(200).json(auditors);
  } catch (error) {
    console.error('Error fetching auditors:', error);
    res.status(500).json({ message: 'Error fetching auditors', error: error.message });
  }
};

// Delete Auditor
exports.deleteAuditor = async (req, res) => {
  try {
    const auditorId = req.params.id;
    const deletedAuditor = await Auditor.findByIdAndDelete(auditorId);
    if (!deletedAuditor) {
      return res.status(404).json({ message: 'Auditor not found' });
    }
    res.status(200).json({ message: 'Auditor deleted successfully' });
  } catch (error) {
    console.error('Error deleting auditor:', error);
    res.status(500).json({ message: 'Error deleting auditor', error: error.message });
  }
}; 