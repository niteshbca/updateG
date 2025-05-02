import React, { useState } from 'react'
import styles from '../Home/Home.module.css';
import { NavLink, useNavigate } from 'react-router-dom';
import LogOutComponent from '../../Components/LogOut/LogOutComponent';
import { useEffect } from 'react';
import axios from 'axios';

export default function GsnEntry() {
  const navigate = useNavigate();
  const [backendData, setbackendData] = useState([])
  const [filteredParties, setFilteredParties] = useState([])
  const [selectedvalue, setSelectedValue] = useState('')
  const [selectedParty, setSelectedParty] = useState(null)
 const [innoviceDate, setinnoviceDate] = useState('');
  const [selectedGrinNo, setSelectedGrinNo] = useState('');
  const [selectedGsn, setSelectedGsn] = useState('');
  const [selectedGrinDate, setSelectedGrinDate] = useState('');
  const [selectedGsnDate, setSelectedGsnDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPartySelect, setShowPartySelect] = useState(false);
  const [mode, setMode] = useState(''); // 'create' or 'upload'
  const [billFile, setBillFile] = useState(null);
  const [uploadStep, setUploadStep] = useState(1); // 1: party select, 2: file upload
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPartyData = async (forUpload = false) => {
        try {
      setLoading(true);
            const url = process.env.REACT_APP_BACKEND_URL
            const token = localStorage.getItem('authToken')
      
      // Get GSN party data
      const gsnRes = await axios.get(`${url}/gsn/getdata`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
      });
      
      // Get existing GRIN entries
      const grinRes = await axios.get(`${url}/entries/getdata1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const gsnData = gsnRes.data;
      const grinData = grinRes.data || [];
      
      console.log("GSN data:", gsnData);
      console.log("GRIN data:", grinData);
      
      if (forUpload) {
        // For upload mode, we want to show parties that DO have GRINs
        // but DON'T have bills uploaded yet
        const partiesWithoutBills = grinData.filter(entry => {
          console.log(`Party: ${entry.partyName}, Has file: ${!!entry.file}`);
          return !entry.file; // Filter out entries that already have a file
        });
        
        console.log("Parties without bills:", partiesWithoutBills);
        setFilteredParties(partiesWithoutBills);
      } else {
        // For create mode, we want to show parties that DON'T have GRINs
        // Get list of party names that already have GRINs
        const partiesWithGrins = new Set(grinData.map(entry => entry.partyName));
        console.log("Parties with GRINs:", [...partiesWithGrins]);
        
        // Filter out parties that already have GRINs
        const filteredPartyList = gsnData.filter(party => !partiesWithGrins.has(party.partyName));
        console.log("Filtered parties (without GRINs):", filteredPartyList);
        
        setFilteredParties(filteredPartyList);
      }
      
      setbackendData([...gsnData, ...grinData]);
      setLoading(false);
        } catch (err) {
      console.log("Error fetching party data:", err);
      setLoading(false);
      // If there's an error, still show all parties as fallback
      setFilteredParties(backendData);
        }
    }

  const handleCreateGrinClick = () => {
    setShowPartySelect(true);
    setMode('create');
    fetchPartyData(false);
  }

  const handleUploadBillClick = () => {
    setShowPartySelect(true);
    setMode('upload');
    setUploadStep(1);
    fetchPartyData(true);
  }

const handleSelectChange = (event) => {
    const selectedIndex = event.target.selectedIndex;
    if (selectedIndex === 0) {
      // If "Select Party Name" is selected, do nothing
      return;
    }

  const selectedOption = event.target.selectedOptions[0];
    const partyName = selectedOption.value;
    
    // Find the selected party
    // For 'upload' mode, filteredParties contains GRIN entries
    // For 'create' mode, backendData contains GSN entries
    const dataSource = mode === 'upload' ? filteredParties : backendData;
    const party = dataSource.find(p => p.partyName === partyName);
    
    if (!party) {
      console.error("Selected party not found in data source for mode:", mode);
      return;
    }

    setSelectedParty(party);
    setSelectedValue(partyName);
    
    if (mode === 'create') {
      // Format dates
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) ? date.toISOString().split('T')[0] : '';
      };
      
      // Set state values from GSN data (party object)
      const invoiceDate = party.innoviceDate;
      const grinNo = party.grinNo || '';
      const gsn = party.gsn || '';
      const grinDate = formatDate(party.grinDate);
      const gsnDate = formatDate(party.gsnDate);
      
      console.log("Selected party data for CREATE:", {
        partyName,
        invoiceDate,
        grinNo,
        gsn,
        grinDate,
        gsnDate
      });
      
      // Navigate to Attendee page with the data
      navigate('/grin-dashboard/entry', {
        state: {
          selectedvalue: partyName,
          innoviceDate: invoiceDate,
          selectedGrinNo: grinNo,
          selectedGsn: gsn,
          selectedGrinDate: grinDate,
          selectedGsnDate: gsnDate
        }
      });
    } else if (mode === 'upload') {
      // Move to next step for file upload
      console.log("Selected party data for UPLOAD:", party); // Log the selected GRIN entry
      setUploadStep(2);
    }
  };

  const handleFileChange = (e) => {
    setBillFile(e.target.files[0]);
  };

  const handleSubmitBill = async (e) => {
    e.preventDefault();
    
    if (!billFile) {
      setMessage("Please select a bill file to upload");
      return;
    }
    
    // Use the _id from the selectedParty (which is a GRIN entry in upload mode)
    if (!selectedParty || !selectedParty._id) {
      setMessage("No party selected or invalid party data (missing _id)");
      console.error("Selected party is missing or has no _id:", selectedParty);
      return;
    }
    
    const partyIdToUpdate = selectedParty._id; // Store the ID before resetting state
    
    try {
      setSubmitting(true);
      setMessage("Uploading bill...");
      
      const formData = new FormData();
      formData.append('file', billFile);
      formData.append('partyId', partyIdToUpdate); // Pass the GRIN entry ID
      
      const url = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('authToken');
      
      console.log("Submitting bill update for partyId:", partyIdToUpdate);
      const response = await axios.post(`${url}/entries/update-bill`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Upload response:", response.data);
      setMessage("Bill uploaded successfully!");
      
      // Remove the successfully updated party from the filtered list
      setFilteredParties(prevParties => prevParties.filter(p => {
        console.log(`Comparing p._id: ${p._id} with partyIdToUpdate: ${partyIdToUpdate}`);
        return p._id !== partyIdToUpdate;
      }));
      
      // Reset the form fields
      setBillFile(null);
      // Keep uploadStep at 2 initially to show success message, then reset if needed or go back
      // setUploadStep(1); 
      setSelectedParty(null);
      setSelectedValue('');
      
      // Go back to party selection after a delay
      setTimeout(() => {
        setUploadStep(1); // Go back to party selection step
        setMessage('');
        // Optional: Re-fetch data if you want the list to be fully up-to-date 
        // in case other changes happened, but filtering locally is faster for immediate feedback.
        // fetchPartyData(true);
      }, 2000); 
      
    } catch (error) {
      console.error("Error uploading bill:", error);
      setMessage(error.response?.data?.message || "Error uploading bill. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowPartySelect(false);
    setMode('');
    setUploadStep(1);
    setBillFile(null);
    setSelectedParty(null);
    setSelectedValue('');
    setMessage('');
  };

const containerStyle = {
  textAlign: 'center',
  minHeight: '100vh',
  padding: '20px',
  background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
  backgroundSize: '400% 400%',
  animation: 'gradientAnimation 12s ease infinite',
  borderRadius: '10px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const globalStyles = `
@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  25% { background-position: 50% 100%; }
  50% { background-position: 100% 50%; }
  75% { background-position: 50% 0%; }
  100% { background-position: 0% 50%; }
}

@media (max-width: 768px) {
  .formRow {
      flex-direction: column;
      align-items: flex-start;
  }
  .input, .dateInput {
      width: 100%;
      margin: 5px 0;
  }
  .popUp {
      width: 90%;
      left: 5%;
  }
  #nav h2 {
      font-size: 1.5rem;
  }
  .button {
      width: 100%;
      padding: 10px;
      font-size: 1rem;
  }
}
`;
  
  const buttonStyle = {
    backgroundColor: 'rgba(218, 216, 224, 0.8)',
    border: 'none',
    borderRadius: '28px',
    color: 'black',
    fontSize: '20px',
    fontFamily: `'Poppins', sans-serif`,
    fontWeight: 'normal',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '10px 20px',
    margin: '10px',
  };
  
  const selectStyle = {
    width: 'auto',
    height: "42px",
    padding: "5px",
            border: 'none',
            borderRadius: '28px',
            color: 'black',
            backgroundColor: 'rgba(218, 216, 224, 0.8)',
    border: "1px black solid",
    marginBottom: '20px',
    fontSize: '16px'
  };
  
  const fileInputStyle = {
    display: 'none'
  };
  
  const fileInputLabelStyle = {
    backgroundColor: 'rgba(218, 216, 224, 0.8)',
    border: 'none',
    borderRadius: '28px',
    color: 'black',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'inline-block',
    marginBottom: '20px',
    textAlign: 'center'
  };
  
  const messageStyle = {
    padding: '10px',
    marginTop: '15px',
    borderRadius: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    color: message.includes('Error') ? 'red' : 'green',
    display: message ? 'block' : 'none'
  };

  return (
    <div className={styles.outerContainer} style={containerStyle}>
      <LogOutComponent />
      <style>{globalStyles}</style>
      
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px'}}>
        {!showPartySelect ? (
          // Initial screen with buttons
          <>
            <h2 style={{marginBottom: '30px'}}>GRIN Management</h2>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <button 
                style={buttonStyle} 
                onClick={handleCreateGrinClick}
              >
                Create GRIN
              </button>
              
              <button 
                style={buttonStyle} 
                onClick={handleUploadBillClick}
              >
                Upload Bill
              </button>
            </div>
          </>
        ) : mode === 'create' ? (
          // Create GRIN flow
          <>
            <h2 style={{marginBottom: '30px'}}>Select a Party for GRIN Entry</h2>
            
            {loading ? (
              <div>Loading party data...</div>
            ) : filteredParties.length > 0 ? (
              <>
                <select 
                  onChange={handleSelectChange} 
                  style={selectStyle}
                >
            <option value="">Select Party Name</option>
                  {filteredParties.map((u, i) => (
                    <option 
                      key={u._id}
              value={u.partyName}
              data-gsn-date={u.innoviceDate}
                    >
                      {u.partyName}
                    </option>
                  ))}
                </select>
                <div style={{marginTop: '20px', fontSize: '14px', color: '#444'}}>
                  Select a party to create a GRIN entry with pre-filled details
                </div>
              </>
            ) : (
              <div style={{marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '10px'}}>
                <p>No parties available for GRIN creation.</p>
                <p>All parties already have GRIN entries created.</p>
              </div>
            )}
            
            <button 
              style={{...buttonStyle, marginTop: '20px'}} 
              onClick={resetForm}
            >
              Back
            </button>
          </>
        ) : mode === 'upload' && uploadStep === 1 ? (
          // Upload Bill - Party Selection Step
          <>
            <h2 style={{marginBottom: '30px'}}>Select a Party to Upload Bill</h2>
            
            {loading ? (
              <div>Loading party data...</div>
            ) : filteredParties.length > 0 ? (
              <>
                <select 
                  onChange={handleSelectChange} 
                  style={selectStyle}
                  value={selectedvalue}
                >
                  <option value="">Select Party Name</option>
                  {filteredParties.map((u, i) => (
                    <option 
                      key={u._id}
                      value={u.partyName}
                    >
                      {u.partyName}
                    </option>
            ))}
        </select>
                <div style={{marginTop: '20px', fontSize: '14px', color: '#444'}}>
                  Select a party to upload a bill for their GRIN entry
                </div>
              </>
            ) : (
              <div style={{marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '10px'}}>
                <p>No GRIN entries found without bills.</p>
                <p>All parties already have bills uploaded or no GRIN entries exist.</p>
              </div>
            )}
            
            <button 
              style={{...buttonStyle, marginTop: '20px'}} 
              onClick={resetForm}
            >
              Back
            </button>
          </>
        ) : mode === 'upload' && uploadStep === 2 ? (
          // Upload Bill - File Upload Step
          <>
            <h2 style={{marginBottom: '30px'}}>Upload Bill for {selectedvalue}</h2>
            
            <form onSubmit={handleSubmitBill}>
              <div style={{marginBottom: '20px'}}>
                <label htmlFor="bill-upload" style={fileInputLabelStyle}>
                  {billFile ? billFile.name : 'Select Bill File'}
                </label>
                <input
                  id="bill-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={fileInputStyle}
                />
              </div>
              
              <div style={messageStyle}>
                {message}
    </div>
      
              <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
                <button 
                  type="button"
                  style={{...buttonStyle, backgroundColor: 'rgba(200, 200, 200, 0.8)'}} 
                  onClick={() => setUploadStep(1)}
                  disabled={submitting}
                >
                  Back
                </button>
                
                <button 
                  type="submit"
                  style={buttonStyle} 
                  disabled={submitting || !billFile}
                >
                  {submitting ? 'Uploading...' : 'Upload Bill'}
                </button>
              </div>
            </form>
          </>
        ) : null}
      </div>
    </div>
  );
}
