import React, { useEffect, useState } from 'react';
import styles from './Approval.module.css';
import axios from 'axios';
import TableComponent from '../Table/Table.rendering';
import LogOutComponent from '../LogOut/LogOutComponent';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Sample({ managerType }) {
    const [visibleItem, setVisibleItem] = useState(null);
    const [selectedValue, setSelectedValue] = useState({});
    const [combinedList, setCombinedList] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isHovered, setIsHovered] = useState(false);

    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCombinedList, setFilteredCombinedList] = useState([]);

    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Mapping for manager approval field
    const managerFieldMap = {
        'General Manager': 'GeneralManagerSigned',
        'Store Manager': 'StoreManagerSigned',
        'Purchase Manager': 'PurchaseManagerSigned',
        'Account Manager': 'AccountManagerSigned',
        'Auditor': 'AuditorSigned'
    };
    const fieldName = managerFieldMap[managerType];

    const url = process.env.REACT_APP_BACKEND_URL;

    // Function to fetch, combine, group, and sort data
    const fetchDataAndProcess = async () => {
        setIsDataLoaded(false); // Start loading indicator
            try {
            const token = localStorage.getItem('authToken');
            console.log(`(${managerType}) Fetching data with token:`, token);

            // Fetch both GSN and GRN data concurrently
            const [gsnResponse, grnResponse] = await Promise.all([
                axios.get(`${url}/gsn/getdata`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                }),
                axios.get(`${url}/getdata`, { // Assuming /getdata is for GRN
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                })
            ]);

            const gsnData = (gsnResponse.data || []).filter(doc => !doc.isHidden);
            const grnData = (grnResponse.data || []).filter(doc => !doc.isHidden);

            console.log(`(${managerType}) Fetched GSN Data:`, gsnData);
            console.log(`(${managerType}) Fetched GRN Data:`, grnData);

            // Combine and group data by partyName
            const combined = {};
            const initialSelectedValue = {}; // Reset initial selections

            // Process GSN documents
            gsnData.forEach(doc => {
                if (!combined[doc.partyName]) {
                    combined[doc.partyName] = {
                        partyName: doc.partyName,
                        gsnDocuments: [],
                        grnDocuments: [],
                        // Initialize signature fields (can be updated by GRN docs too if logic requires)
                        GeneralManagerSigned: doc.GeneralManagerSigned,
                        StoreManagerSigned: doc.StoreManagerSigned,
                        PurchaseManagerSigned: doc.PurchaseManagerSigned,
                        AccountManagerSigned: doc.AccountManagerSigned,
                        AuditorSigned: doc.AuditorSigned,
                    };
                }
                combined[doc.partyName].gsnDocuments.push(doc);
                // Update signature status if needed (e.g., take the latest or specific logic)
                // For now, GSN sets initial status

                // Set initial checkbox state based on *this specific* GSN document
                if (fieldName && doc.hasOwnProperty(fieldName)) {
                     initialSelectedValue[doc._id] = doc[fieldName] === true ? 'checked' : 'not_checked';
            } else {
                     console.warn(`Field ${fieldName} not found for GSN item ${doc._id} or invalid managerType ${managerType}`);
                     initialSelectedValue[doc._id] = 'not_checked';
            }
            });

            // Process GRN documents
            grnData.forEach(doc => {
                if (!combined[doc.partyName]) {
                    // If a party only has GRN docs, create an entry
                    combined[doc.partyName] = {
                        partyName: doc.partyName,
                        gsnDocuments: [],
                        grnDocuments: [],
                        // Set signature fields from GRN if no GSN existed
                        GeneralManagerSigned: doc.GeneralManagerSigned,
                        StoreManagerSigned: doc.StoreManagerSigned,
                        PurchaseManagerSigned: doc.PurchaseManagerSigned,
                        AccountManagerSigned: doc.AccountManagerSigned,
                        AuditorSigned: doc.AuditorSigned,
                    };
                }
                combined[doc.partyName].grnDocuments.push(doc);
                 // Optionally update combined signature status based on GRN docs if needed
                 // E.g., combined[doc.partyName].StoreManagerSigned = combined[doc.partyName].StoreManagerSigned || doc.StoreManagerSigned;
            });

            const combinedListData = Object.values(combined);

            // Function to get the latest createdAt date from a group for sorting
            const getLatestDate = (item) => {
                const dates = [
                    ...(item.gsnDocuments || []).map(d => new Date(d.createdAt)),
                    ...(item.grnDocuments || []).map(d => new Date(d.createdAt))
                ].filter(d => !isNaN(d));
                return dates.length > 0 ? Math.max(...dates.map(d => d.getTime())) : 0;
            };

            // Sort the final combined list by latest date descending
            combinedListData.sort((a, b) => getLatestDate(b) - getLatestDate(a));

            console.log(`(${managerType}) Sorted Combined List Data:`, combinedListData);
            setCombinedList(combinedListData);
            setSelectedValue(initialSelectedValue); // Set initial checkbox states
            setIsDataLoaded(true); // Mark data as loaded

            } catch (err) {
            console.error(`(${managerType}) Error fetching or processing data`, err);
            if (err.response) {
                console.error(`(${managerType}) Fetch/Process Error Response:`, err.response.data);
            }
            setIsDataLoaded(true); // Ensure loading state is updated even on error
            }
        };

    // Fetch data on initial load and when managerType changes
    useEffect(() => {
        fetchDataAndProcess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managerType]);

    // useEffect for filtering based on searchTerm
    useEffect(() => {
        let filtered = combinedList;
        if (searchTerm) {
            filtered = combinedList.filter(item =>
                item.partyName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredCombinedList(filtered);
    }, [searchTerm, combinedList]); // Re-run when searchTerm or the main list changes

    // Toggle visibility for a party group
    const showHandler = (index) => {
        setVisibleItem(visibleItem === index ? null : index);
    };

    // Handle form submission for a specific GSN document approval
    const handleSubmit = async (e, gsnDocId, partyName) => { // Pass GSN ID and party name
        e.preventDefault();
        const currentStatus = selectedValue[gsnDocId] || 'not_checked';
        const payload = {
            _Id: gsnDocId, // Use the specific GSN document ID
            managerType,
            status: currentStatus
        };
        console.log(`(${managerType}) Submitting verification for GSN ID ${gsnDocId} (Party: ${partyName}):`, payload);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${url}/verify`, payload, {
                 headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            console.log(`(${managerType}) Verification Response for GSN ID ${gsnDocId}:`, response.data);
            alert('Verification status saved successfully');
            // Refetch data to update the UI with the latest status
            await fetchDataAndProcess();
        } catch (err) {
            console.error(`(${managerType}) Error saving verification status for GSN ID ${gsnDocId}`, err);
            if (err.response) {
                console.error(`(${managerType}) Verification Error Response:`, err.response.data);
                alert(`Error: ${err.response.data.message || 'Could not save status'}`);
            } else {
                alert('An error occurred while saving the status.');
            }
        }
    };

    // Format date function
    const formatDate = (oldFormat) => {
        if (!oldFormat) return "N/A";
        const date = new Date(oldFormat);
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric'
        });
    };

    // Handle radio input change for a specific GSN document
    const handleRadioChange = (gsnDocId, value) => {
        setSelectedValue(prev => ({ ...prev, [gsnDocId]: value }));
    };

    // PDF Download Handler for a specific GSN document
    const handleDownloadPDF = (gsnDoc) => { // Pass the specific GSN document object
        if (!gsnDoc || !gsnDoc._id) {
            console.error("Invalid GSN document provided for PDF download");
            return;
        }

        // Attempt to find the containing div for the entire party group first
        // This might be tricky if the button is deep inside the GSN item.
        // A more robust approach might be to generate PDF content programmatically
        // instead of relying on html2canvas of a potentially complex/changing div.
        // For now, we try to find the parent div of the GSN item.
        // We need a unique ID *per GSN item* if we want to capture just that.
        // Let's assume we want to capture the entire visible block for the party.
        // We need the index of the partyGroup for the ID.

        // Find the index of the party group containing this gsnDoc
        const partyGroupIndex = filteredCombinedList.findIndex(group =>
            group.gsnDocuments.some(doc => doc._id === gsnDoc._id)
        );

        if (partyGroupIndex === -1) {
             console.error("Could not find party group for GSN document:", gsnDoc._id);
             return;
        }
        
        const divElement = document.getElementById(`party-group-div-${partyGroupIndex}`);
        if (!divElement) {
            console.error("Could not find div element for party group index:", partyGroupIndex);
            // As a fallback, maybe try finding a div specific to the GSN item?
            // const gsnDivElement = document.getElementById(`gsn-item-div-${gsnDoc._id}`);
            // if(!gsnDivElement) return;
            // divElement = gsnDivElement; // Use this if found
            return; // Exit if main div not found
        }


        // Sanitize Party Name and Manager Type
        const partyName = gsnDoc.partyName || `document-${gsnDoc._id}`;
        const sanitizedPartyName = partyName.replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedManagerType = managerType.replace(/[^a-zA-Z0-9]/g, '_');

        // Elements to hide in PDF (buttons, etc.)
        const elementsToHide = divElement.querySelectorAll('.hide-in-pdf');
        
        // Store original display styles
        const originalDisplayStyles = [];
        elementsToHide.forEach(el => {
            originalDisplayStyles.push(el.style.display);
            el.style.display = 'none';
        });

        // Add a small delay for rendering changes
        setTimeout(() => {
            html2canvas(divElement, { 
                scale: 2,
                useCORS: true,
                logging: false, 
                backgroundColor: '#ffffff'
            }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const imgWidth = 210; // A4 width in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let position = 0;
                const pageHeight = 295; // A4 height in mm
                let heightLeft = imgHeight;

                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                // Filename indicates party and manager status
                pdf.save(`${sanitizedPartyName}_${sanitizedManagerType}_Status.pdf`);

                // Restore original display styles
                elementsToHide.forEach((el, i) => {
                    el.style.display = originalDisplayStyles[i];
                });
            }).catch(err => {
                console.error("Error generating PDF:", err);
                // Restore display styles even if PDF generation fails
                elementsToHide.forEach((el, i) => {
                    el.style.display = originalDisplayStyles[i];
                });
            });
        }, 100); // 100ms delay
    };

    // Helper to check if a file is an image
    const isImageFile = (filename) => {
        if (!filename) return false;
        const extension = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
    };


    // --- RENDER ---
    return (
        <>
            <LogOutComponent />
            <div className={styles.outer}>
                {/* Search Input */}
                <div style={{ padding: '10px 20px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', margin: '10px 0' }}>
                    <input 
                        type="text"
                        placeholder="Search by Party Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none' }}
                    />
                </div>

                {/* Render Filtered and Grouped List */}
                {filteredCombinedList.map((partyGroup, groupIndex) => {
                    const { partyName, gsnDocuments, grnDocuments } = partyGroup;

                    // Determine overall status text for the party header (optional)
                    // This example just shows GSN status for the first GSN doc if available
                    const firstGsnDoc = gsnDocuments?.[0];
                    const isApprovedByCurrentManagerForFirstGsn = firstGsnDoc && fieldName && !!firstGsnDoc[fieldName];
                    const partyStatusText = gsnDocuments?.length > 0
                        ? (isApprovedByCurrentManagerForFirstGsn ? "(Approved by You)" : "(Pending Your Approval)")
                        : "(No GSN)"; // Or some other indicator

                    return (
                        // Add a unique ID for the party group div for PDF generation
                        <div key={partyName} id={`party-group-div-${groupIndex}`} className={styles.show} style={{ marginBottom: '20px', padding: '15px', borderRadius: '8px' }}>
                            {/* Party Header */}
                            <h2
                                style={{ color: "black", cursor: "pointer", marginBottom: '15px', paddingBottom: '10px' }}
                                onClick={() => showHandler(groupIndex)}
                            >
                                Party: {partyName}
                                <span style={{ marginLeft: '10px', fontSize: '0.8em', color: isApprovedByCurrentManagerForFirstGsn ? 'green' : 'orange' }}>
                                   {/* Status indicator can be more sophisticated */}
                                </span>
                                <span style={{ float: 'right', fontSize: '0.8em' }}>{visibleItem === groupIndex ? '▲' : '▼'}</span>
                            </h2>

                            {/* Collapsible Content */}
                            <div style={{ display: visibleItem === groupIndex ? 'block' : 'none' }}>

                                {/* GSN Documents Section */}
                                {gsnDocuments && gsnDocuments.length > 0 && (
                                    <div style={{ backgroundColor: 'rgba(218, 216, 224, 0.1)', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                                        <h3 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#333' }}>GSN Documents</h3>
                                        {gsnDocuments.map((gsnDoc, gsnIndex) => {
                                            const {
                                                _id, grinNo, grinDate, gsn, gsnDate, poNo, poDate,
                                                innoviceno, innoviceDate, lrNo, lrDate, transName, vehicleNo,
                                                file, // GSN Bill File (if applicable, usually GRN has it)
                                                photoPath, // GSN Photo
                                                tableData, createdAt,
                                                companyName, address, gstNo, mobileNo, // New fields
                                                cgst, sgst, totalAmount // New fields
                                            } = gsnDoc;
                                            const materialList = Array.isArray(tableData) ? tableData : [];

                                            // Status specific to *this* GSN document
                                            const isApprovedByCurrentManager = fieldName && !!gsnDoc[fieldName];
                                            const statusText = isApprovedByCurrentManager ? "(Approved by You)" : "(Not Approved by You)";

                                            // Check if checkbox should be enabled (Auditor logic or other conditions)
                                            let isCheckboxEnabled = false;
                                            if (managerType === 'Auditor') {
                                                 // Auditor can approve if essential data exists (e.g., grinNo)
                                                 isCheckboxEnabled = !!grinNo;
                                            } else {
                                                 // Example: Other managers need grinNo
                                                  isCheckboxEnabled = !!grinNo;
                                                // Add more complex logic if needed, e.g., check previous manager approvals
                                                // isCheckboxEnabled = !!grinNo && !!gsnDoc.PreviousManagerSigned;
                                            }
                                            console.log(`GSN ID: ${_id}, Manager: ${managerType}, isCheckboxEnabled: ${isCheckboxEnabled}, Current Approval: ${isApprovedByCurrentManager}`);


                                            return (
                                                // Unique key for each GSN item
                                                <div key={_id} id={`gsn-item-div-${_id}`} style={{ marginBottom: '15px', paddingBottom: '15px' }}>
                                                    {/* Display GSN details */}
                                                    <h4 style={{textAlign:'center', marginBottom:'10px'}}>GSN: {gsn || 'N/A'} <span style={{fontSize: '0.8em', color: isApprovedByCurrentManager ? 'green' : 'orange'}}>{statusText}</span></h4>

                                                     {/* GRIN Details Table (for GSN) */}
                                    <div className={styles.grinDetails}>
                                                         <div><label><h5>GRIN Details (from GSN)</h5></label></div>
                                        <table>
                                            <thead>
                                                <tr>
                                                                     <th>GRIN NO.</th><th>Date</th><th>GSN</th><th>Date</th><th>P.O. No.</th><th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                                     <td>{grinNo || 'N/A'}</td><td>{formatDate(grinDate)}</td><td>{gsn || 'N/A'}</td><td>{formatDate(gsnDate)}</td><td>{poNo || 'N/A'}</td><td>{formatDate(poDate)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                                     {/* Party Details Table (for GSN) */}
                                    <div className={styles.grinDetails}>
                                                         <label><h5>Party Details (from GSN)</h5></label>
                                        <table>
                                            <thead>
                                                <tr>
                                                                      <th>Party Name</th><th>Company Name</th><th>Invoice No.</th><th>Date</th><th>Address</th><th>GST No</th><th>Mobile No</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                                      <td>{partyName}</td><td>{companyName || 'N/A'}</td><td>{innoviceno || 'N/A'}</td><td>{formatDate(innoviceDate)}</td><td>{address || 'N/A'}</td><td>{gstNo || 'N/A'}</td><td>{mobileNo || 'N/A'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                                     {/* Transport Details Table (for GSN) */}
                                    <div className={styles.grinDetails}>
                                                          <label><h5>Transport Details (from GSN)</h5></label>
                                        <table>
                                            <thead>
                                                <tr>
                                                                      <th>L.R. No.</th><th>Transporter</th><th>Vehicle No.</th><th>L.R. Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                                      <td>{lrNo || 'N/A'}</td><td>{transName || 'N/A'}</td><td>{vehicleNo || 'N/A'}</td><td>{formatDate(lrDate)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                                     {/* Material List Table (for GSN) */}
                                                     <div style={{ /* styles */ }}>
                                        <h5 style={{ textAlign: "center" }}>Material List (GSN)</h5>
                                        <TableComponent tableData={materialList} />
                                </div>

                                                     {/* Amount Details Table (for GSN) */}
                                                      <div className={styles.grinDetails} style={{ marginTop: '20px' }}>
                                                          <label><h5>Amount Details (GSN)</h5></label>
                                        <table>
                                            <thead>
                                                                  <tr><th>CGST</th><th>SGST</th><th>Total Amount</th></tr>
                                            </thead>
                                            <tbody>
                                                                  <tr><td>{cgst || 'N/A'}</td><td>{sgst || 'N/A'}</td><td>{totalAmount || 'N/A'}</td></tr>
                                            </tbody>
                                        </table>
                                    </div>

                                                    {/* GSN Uploaded Photo */}
                                                    {photoPath && (
                                                        <div style={{ width: "90%", margin: "20px auto", padding: "15px", borderRadius: "8px", textAlign: "center", backgroundColor: 'rgba(218, 216, 224, 0.6)' }}>
                                                            <h5 style={{ marginBottom: "15px" }}>Uploaded Photo (GSN)</h5>
                                                            <img src={`${url}/${photoPath}`} alt="GSN Uploaded" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '5px' }} />
                                                        </div>
                                                    )}

                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {gsnDocuments?.length === 0 && <p style={{textAlign:'center', color:'#888'}}>No GSN documents found for this party.</p>}


                                {/* GRN Documents Section */}
                                {grnDocuments && grnDocuments.length > 0 && (
                                    <div style={{ backgroundColor: 'rgba(218, 224, 216, 0.1)', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                                        <h3 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#00796b' }}>GRIN Documents</h3>
                                        {grnDocuments.map((grnDoc, grnIndex) => {
                                             const {
                                                _id, grinNo, grinDate, gsn, gsnDate, poNo, poDate,
                                                innoviceno, innoviceDate, lrNo, lrDate, transName, vehicleNo,
                                                file, // GRN Bill File
                                                photoPath, // GRN Photo
                                                tableData, createdAt,
                                                companyName, address, gstNo, mobileNo, // New fields
                                                cgst, sgst, totalAmount // New fields
                                            } = grnDoc;
                                            const materialList = Array.isArray(tableData) ? tableData : [];

                                            return (
                                                 <div key={_id} style={{ marginBottom: '15px', paddingBottom: '15px' }}>
                                                     <h4 style={{textAlign:'center', marginBottom:'10px'}}>GRIN No: {grinNo || 'N/A'}</h4>

                                                      {/* GRIN Details Table (for GRN) */}
                                                      <div className={styles.grinDetails}>
                                                          <div><label><h5>GRIN Details (from GRN)</h5></label></div>
                                                          <table>
                                                              <thead><tr><th>GRIN NO.</th><th>Date</th><th>GSN</th><th>Date</th><th>P.O. No.</th><th>Date</th></tr></thead>
                                                              <tbody><tr><td>{grinNo || 'N/A'}</td><td>{formatDate(grinDate)}</td><td>{gsn || 'N/A'}</td><td>{formatDate(gsnDate)}</td><td>{poNo || 'N/A'}</td><td>{formatDate(poDate)}</td></tr></tbody>
                                                          </table>
                                                      </div>

                                                      {/* Party Details Table (for GRN) */}
                                    <div className={styles.grinDetails}>
                                                         <label><h5>Party Details (from GRN)</h5></label>
                                        <table>
                                                              <thead><tr><th>Party Name</th><th>Company Name</th><th>Invoice No.</th><th>Date</th><th>Address</th><th>GST No</th><th>Mobile No</th></tr></thead>
                                                              <tbody><tr><td>{partyName}</td><td>{companyName || 'N/A'}</td><td>{innoviceno || 'N/A'}</td><td>{formatDate(innoviceDate)}</td><td>{address || 'N/A'}</td><td>{gstNo || 'N/A'}</td><td>{mobileNo || 'N/A'}</td></tr></tbody>
                                        </table>
                                    </div>

                                                      {/* Transport Details Table (for GRN) */}
                                    <div className={styles.grinDetails}>
                                                          <label><h5>Transport Details (from GRN)</h5></label>
                                        <table>
                                                              <thead><tr><th>L.R. No.</th><th>Transporter</th><th>Vehicle No.</th><th>L.R. Date</th></tr></thead>
                                                              <tbody><tr><td>{lrNo || 'N/A'}</td><td>{transName || 'N/A'}</td><td>{vehicleNo || 'N/A'}</td><td>{formatDate(lrDate)}</td></tr></tbody>
                                        </table>
                                    </div>

                                                      {/* Material List Table (for GRN) */}
                                                      <div style={{ /* styles */ }}>
                                        <h5 style={{ textAlign: "center" }}>Material List (GRIN)</h5>
                                                          <TableComponent tableData={materialList} />
                                    </div>

                                                      {/* Amount Details Table (for GRN) */}
                                                      <div className={styles.grinDetails} style={{ marginTop: '20px' }}>
                                                          <label><h5>Amount Details (GRIN)</h5></label>
                                                          <table>
                                                              <thead><tr><th>CGST</th><th>SGST</th><th>Total Amount</th></tr></thead>
                                                              <tbody><tr><td>{cgst || 'N/A'}</td><td>{sgst || 'N/A'}</td><td>{totalAmount || 'N/A'}</td></tr></tbody>
                                                          </table>
                            </div>

                                                     {/* GRN Bill Details (Display Link/Image) */}
                                                     {file && (
                                                         <div style={{ width: "90%", margin: "20px auto", padding: "15px", borderRadius: "8px", textAlign: "center", backgroundColor: 'rgba(218, 216, 224, 0.6)' }}>
                                                             <h5 style={{ color: "#007bff", marginBottom: "15px" }}>Bill Details (GRIN)</h5>
                                                             {isImageFile(file) ? (
                                                                 <img src={`${url}/${file}`} alt={`GRIN Bill ${grnIndex + 1}`} style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '5px' }} />
                                                             ) : (
                                                                 <a href={`${url}/${file}`} target="_blank" rel="noopener noreferrer" className="hide-in-pdf" style={{ /* styles */ display: 'inline-block', padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
                                                                     View/Download Bill {grnIndex + 1}
                                                                 </a>
                                            )}
                                        </div>
                            )}

                                                      {/* GRN Uploaded Photo */}
                                                      {photoPath && (
                                                          <div style={{ width: "90%", margin: "20px auto", padding: "15px", borderRadius: "8px", textAlign: "center", backgroundColor: 'rgba(218, 216, 224, 0.6)' }}>
                                                              <h5 style={{ marginBottom: "15px" }}>Uploaded Photo (GRIN)</h5>
                                                              <img src={`${url}/${photoPath}`} alt="GRIN Uploaded" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '5px' }} />
                                </div>
                            )}
                                                       {/* GRN Created At */}
                                                     <div className="timestamp" style={{textAlign: 'right', fontSize:'0.8em', color:'#777', marginTop:'10px'}}>
                                                         GRIN Created: {formatDate(createdAt)}
                                                     </div>
                                        </div>
                                            );
                                        })}
                                    </div>
                                )}
                                 {grnDocuments?.length === 0 && <p style={{textAlign:'center', color:'#888'}}>No GRIN documents found for this party.</p>}

                                {/* Approval and Download Section (Moved Here) */}
                                {gsnDocuments && gsnDocuments.length > 0 && (
                                    <div className={`${styles.sign} hide-in-pdf`} style={{ marginTop: '20px', paddingTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <h4 style={{marginBottom: '15px'}}>Approval Actions ({managerType})</h4>
                                        {gsnDocuments.map((gsnDoc) => {
                                            const { _id, gsn } = gsnDoc;
                                            const isApprovedByCurrentManager = fieldName && !!gsnDoc[fieldName];

                                            // Recalculate isCheckboxEnabled for this GSN doc
                                            let isCheckboxEnabled = false;
                                            if (managerType === 'Auditor') {
                                                 isCheckboxEnabled = !!gsnDoc.grinNo;
                                            } else {
                                                 isCheckboxEnabled = !!gsnDoc.grinNo;
                                                 // Add more complex logic if needed
                                            }

                                            return (
                                                <div key={`approval-${_id}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '5px', borderRadius: '5px', width: 'fit-content' }}>
                                                    <span style={{marginRight: '10px', minWidth: '80px'}}>GSN: {gsn || 'N/A'}</span>
                                                    <form onSubmit={(e) => handleSubmit(e, _id, partyName)} style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                                                        <label htmlFor={`checkbox-${_id}`} style={{ marginRight: '5px', cursor: isCheckboxEnabled ? 'pointer' : 'not-allowed' }}>Approve</label>
                                                        <input
                                                            id={`checkbox-${_id}`}
                                                            type="checkbox"
                                                            value='checked'
                                                            checked={selectedValue[_id] === 'checked'}
                                                            onChange={() => handleRadioChange(_id, selectedValue[_id] === 'checked' ? 'not_checked' : 'checked')}
                                                            disabled={!isCheckboxEnabled}
                                                            style={{ transform: 'scale(1.3)', marginRight: '10px', cursor: isCheckboxEnabled ? 'pointer' : 'not-allowed' }}
                                                        />
                                    <button
                                        type='submit'
                                        className="hide-in-pdf"
                                                            disabled={!isCheckboxEnabled}
                                                            style={{ padding: '3px 10px', cursor: isCheckboxEnabled ? 'pointer' : 'not-allowed', opacity: isCheckboxEnabled ? 1 : 0.6 }}
                                    >Submit</button>
                                </form>
                                                    {/* PDF Download Button */}
                            {isApprovedByCurrentManager && (
                                <button 
                                                            onClick={() => handleDownloadPDF(gsnDoc)}
                                    className="download-pdf-button hide-in-pdf" 
                                                            style={{ padding: '3px 8px', background: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                                            Download PDF
                                </button>
                            )}
                        </div>
                                            );
                                        })}
                                    </div>
                                )}

                            </div> {/* End Collapsible Content */}
                        </div> // End Party Group Div
                    );
                })}

                {/* Loading and No Data Messages */}
                {!isDataLoaded && <p style={{ textAlign: 'center', padding: '20px' }}>Loading documents...</p>}
                {isDataLoaded && filteredCombinedList.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '20px' }}>
                        {searchTerm ? 'No matching party documents found.' : 'No documents found.'}
                    </p>
                )}
            </div>
        </>
    );
}






