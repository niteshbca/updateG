import React, { useEffect, useState } from 'react';
import styles from '../../Components/Approval/Approval.module.css';
import axios from 'axios';
import TableComponent from '../../Components/Table/Table.rendering';
import LogOutComponent from '../LogOut/LogOutComponent';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ViewForm({ managerType }) {
    const [visibleItem, setVisibleItem] = useState(null);
    const [combinedList, setCombinedList] = useState([]);
    const url = process.env.REACT_APP_BACKEND_URL;

    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCombinedList, setFilteredCombinedList] = useState([]);

    const isImageFile = (filename) => {
        if (!filename) return false;
        const extension = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
    };
   
    const handleDownloadPDF = (index) => {
        const divElement = document.getElementById(`div-${index}`);
        if (!divElement) return;

        const partyName = combinedList[index]?.partyName || `document-${index}`;
        const sanitizedPartyName = partyName.replace(/[^a-zA-Z0-9]/g, '_');

        // Select elements to hide, including the bill details link/image wrappers
        const elementsToHide = divElement.querySelectorAll('.hide-in-pdf'); 
        const downloadButton = divElement.querySelector('.download-pdf-button');
        
        const originalDisplayValues = {
            elementsToHide: Array.from(elementsToHide).map(el => el.style.display),
            downloadButton: downloadButton ? downloadButton.style.display : null
        };

        elementsToHide.forEach(el => {
            el.style.display = 'none';
        });
        if (downloadButton) {
            downloadButton.style.display = 'none';
        }

        setTimeout(() => {
            html2canvas(divElement, { 
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
                const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let position = 0;
                const pageHeight = 295;
                let heightLeft = imgHeight;

                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                pdf.save(`${sanitizedPartyName}_Approved.pdf`);

                // Restore display
                elementsToHide.forEach((el, i) => {
                    el.style.display = originalDisplayValues.elementsToHide[i];
                });
                if (downloadButton) {
                    downloadButton.style.display = originalDisplayValues.downloadButton;
                }
            }).catch(err => {
                 console.error("Error generating PDF:", err);
                 // Restore display on error
                 elementsToHide.forEach((el, i) => {
                    el.style.display = originalDisplayValues.elementsToHide[i];
                 });
                 if (downloadButton) {
                    downloadButton.style.display = originalDisplayValues.downloadButton;
                 }
            });
        }, 100);
    };
  
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const url = process.env.REACT_APP_BACKEND_URL;
                
                const [gsnResponse, grnResponse] = await Promise.all([
                    axios.get(`${url}/gsn/getdata`, {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        }
                    }),
                    axios.get(`${url}/entries/getdata1`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                ]);

                // Sort individual lists first
                const sortedGsnData = (gsnResponse.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const sortedGrnData = (grnResponse.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                console.log('Sorted GSN Data:', sortedGsnData);
                console.log('Sorted GRN Data:', sortedGrnData);

                const combined = {};
                
                // Process sorted GSN documents
                (sortedGsnData).forEach(doc => {
                    if (doc.isHidden) return;

                    if (!combined[doc.partyName]) {
                        combined[doc.partyName] = {
                            partyName: doc.partyName,
                            gsnDocuments: [],
                            grnDocuments: [],
                            GeneralManagerSigned: doc.GeneralManagerSigned,
                            StoreManagerSigned: doc.StoreManagerSigned,
                            PurchaseManagerSigned: doc.PurchaseManagerSigned,
                            AccountManagerSigned: doc.AccountManagerSigned,
                            AuditorSigned: doc.AuditorSigned
                        };
                    }
                    combined[doc.partyName].gsnDocuments.push(doc);
                    if (combined[doc.partyName].GeneralManagerSigned === undefined) combined[doc.partyName].GeneralManagerSigned = doc.GeneralManagerSigned;
                    if (combined[doc.partyName].StoreManagerSigned === undefined) combined[doc.partyName].StoreManagerSigned = doc.StoreManagerSigned;
                    if (combined[doc.partyName].PurchaseManagerSigned === undefined) combined[doc.partyName].PurchaseManagerSigned = doc.PurchaseManagerSigned;
                    if (combined[doc.partyName].AccountManagerSigned === undefined) combined[doc.partyName].AccountManagerSigned = doc.AccountManagerSigned;
                    if (combined[doc.partyName].AuditorSigned === undefined) combined[doc.partyName].AuditorSigned = doc.AuditorSigned;
                });

                // Process sorted GRN documents
                (sortedGrnData).forEach(doc => {
                    if (doc.isHidden) return;

                    if (!combined[doc.partyName]) {
                        combined[doc.partyName] = {
                            partyName: doc.partyName,
                            gsnDocuments: [],
                            grnDocuments: [],
                            GeneralManagerSigned: doc.GeneralManagerSigned,
                            StoreManagerSigned: doc.StoreManagerSigned,
                            PurchaseManagerSigned: doc.PurchaseManagerSigned,
                            AccountManagerSigned: doc.AccountManagerSigned,
                            AuditorSigned: doc.AuditorSigned
                        };
                    }
                    combined[doc.partyName].grnDocuments.push(doc);
                    if (combined[doc.partyName].GeneralManagerSigned === undefined) combined[doc.partyName].GeneralManagerSigned = doc.GeneralManagerSigned;
                    if (combined[doc.partyName].StoreManagerSigned === undefined) combined[doc.partyName].StoreManagerSigned = doc.StoreManagerSigned;
                    if (combined[doc.partyName].PurchaseManagerSigned === undefined) combined[doc.partyName].PurchaseManagerSigned = doc.PurchaseManagerSigned;
                    if (combined[doc.partyName].AccountManagerSigned === undefined) combined[doc.partyName].AccountManagerSigned = doc.AccountManagerSigned;
                    if (combined[doc.partyName].AuditorSigned === undefined) combined[doc.partyName].AuditorSigned = doc.AuditorSigned;
                });

                const combinedListData = Object.values(combined);

                // Function to get the latest createdAt from a group
                const getLatestDate = (item) => {
                    const dates = [
                        ...(item.gsnDocuments || []).map(d => new Date(d.createdAt)),
                        ...(item.grnDocuments || []).map(d => new Date(d.createdAt))
                    ].filter(d => !isNaN(d)); // Filter out invalid dates
                    return dates.length > 0 ? Math.max(...dates.map(d => d.getTime())) : 0; // Use getTime() for comparison
                };

                // Sort the final combined list
                combinedListData.sort((a, b) => getLatestDate(b) - getLatestDate(a));

                console.log('Sorted Combined List Data:', combinedListData);
                setCombinedList(combinedListData);

            } catch (error) {
                console.error('Error fetching data:', error);
                console.error('Error details:', error.response?.data);
            }
        };

        fetchData();
    }, []);

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

    const showHandler = (index) => {
        setVisibleItem(visibleItem === index ? null : index);
    };
    
    const renderDocument = (item, index) => {
        const { partyName, gsnDocuments, grnDocuments, 
                GeneralManagerSigned, StoreManagerSigned, 
                PurchaseManagerSigned, AccountManagerSigned, AuditorSigned } = item;
                
        console.log(`Rendering party: ${partyName}, Signatures:`, { GeneralManagerSigned, StoreManagerSigned, PurchaseManagerSigned, AccountManagerSigned, AuditorSigned });

        const isApprovedByAllFive = !!GeneralManagerSigned && !!StoreManagerSigned && !!PurchaseManagerSigned && !!AccountManagerSigned && !!AuditorSigned;
        const statusText = isApprovedByAllFive ? "(Approved)" : "(Pending Approval)";

        return (
            <div 
                key={index} 
                id={`div-${index}`} 
                className="generated-div" 
                style={{
                   
                }}
            >
                <div className={styles.show}>
                    <h2 onClick={() => showHandler(index)} style={{ cursor: 'pointer', color:'black' }}>
                        Party Name: {partyName}
                        <span style={{ marginLeft: '10px', fontSize: '0.8em', color: isApprovedByAllFive ? 'green' : 'green' }}>
                            {statusText}
                        </span>
                    </h2>
                    <div className={styles.completeBlock} style={{ display: visibleItem === index ? 'block' : 'none' }}>
                        {gsnDocuments && gsnDocuments.length > 0 && (
                            <div style={{ backgroundColor: 'rgba(218, 216, 224, 0.2)', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                                <h3 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>GSN Documents</h3>
                                {gsnDocuments.map((doc, docIndex) => (
                                    <div key={`gsn-${docIndex}`} className={styles.grinDetails}>
                                        <div><label htmlFor=""><h5>GSN Details</h5></label></div>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>GRIN NO.</th>
                                                    <th>Date</th>
                                                    <th>GSN</th>
                                                    <th>Date</th>
                                                    <th>P.O. No.</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{doc.grinNo}</td>
                                                    <td>{doc.grinDate}</td>
                                                    <td>{doc.gsn}</td>
                                                    <td>{doc.gsnDate}</td>
                                                    <td>{doc.poNo}</td>
                                                    <td>{doc.poDate}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <div className={styles.grinDetails}>
                                            <label htmlFor=""><h5>Party Details</h5></label>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Party Name</th>
                                                        <th>Company Name</th>
                                                        <th>Party Invoice No.</th>
                                                        <th>Date</th>
                                                        <th>Address</th>
                                                        <th>GST No</th>
                                                        <th>Mobile No</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{doc.partyName}</td>
                                                        <td>{doc.companyName || 'N/A'}</td>
                                                        <td>{doc.innoviceno}</td>
                                                        <td>{doc.innoviceDate}</td>
                                                        <td>{doc.address || 'N/A'}</td>
                                                        <td>{doc.gstNo || 'N/A'}</td>
                                                        <td>{doc.mobileNo || 'N/A'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                            <div className={styles.grinDetails}>
                                            <label htmlFor=""><h5>Transport Details</h5></label>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>L.R. No.</th>
                                                        <th>Transporter Name</th>
                                                        <th>Vehicle No.</th>
                                                        <th>L.R. Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{doc.lrNo}</td>
                                                        <td>{doc.transName}</td>
                                                        <td>{doc.vehicleNo}</td>
                                                        <td>{doc.lrDate}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {doc.tableData && doc.tableData.length > 0 && (
                                            <div style={{
                                                border: "1px solid #ccc",
                                                width: "90%",
                                                margin: "2% auto",
                                                display: "flex",
                                                justifyContent: "center",
                                                flexDirection: "column",
                                                padding: "20px",
                                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                                borderRadius: "8px",
                                                backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                                fontFamily: "'Arial', sans-serif",
                                                fontSize: "16px",
                                                lineHeight: "1.6",
                                                boxSizing: "border-box",
                                                maxWidth: "1200px",
                                                overflowWrap: "break-word",
                                            }}>
                                                <h5 style={{ textAlign: "center" }}>Material List (Including Price)</h5>
                                                <TableComponent tableData={doc.tableData} />
                                            </div>
                                        )}

                                        {/* Added Tax and Total Amount Details */}
                                        <div className={styles.grinDetails} style={{ marginTop: '20px' }}>
                                            <label htmlFor=""><h5>Amount Details</h5></label>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>CGST</th>
                                                        <th>SGST</th>
                                                        <th>Total Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{doc.cgst || 'N/A'}</td>
                                                        <td>{doc.sgst || 'N/A'}</td>
                                                        <td>{doc.totalAmount || 'N/A'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* --- COMMENTED OUT: GSN Bill Details --- */}
                                        {/* 
                                        {doc.file && (
                                            <div style={{
                                                width: "90%", margin: "20px auto", padding: "15px", 
                                                border: "1px solid #ccc", borderRadius: "8px", textAlign: "center",
                                                backgroundColor: 'rgba(218, 216, 224, 0.6)', 
                                            }}>
                                                <h2 style={{ color: "#007bff", fontSize: "24px", marginBottom: "15px" }}>Bill Details (GSN)</h2>
                                                {isImageFile(doc.file) ? (
                                                    <img src={`${url}/${doc.file}`} alt="GSN Bill" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '5px' }} />
                                                ) : (
                                                    <a href={`${url}/${doc.file}`} target="_blank" rel="noopener noreferrer" className="hide-in-pdf" style={{
                                                        display: "inline-block",
                                                        padding: "10px 20px",
                                                        backgroundColor: "#28a745",
                                                        color: "#fff",
                                                        textDecoration: "none",
                                                        borderRadius: "5px",
                                                        transition: "background-color 0.3s ease"
                                                    }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = "#218838"}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = "#28a745"}>
                                                        View/Download Bill
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        */}
                                        {/* --- END: GSN Bill Details --- */}
                                        
                                        {/* GSN Uploaded Photo */} 
                                        {doc.photoPath && (
                                            <div style={{
                                                width: "90%", margin: "20px auto", padding: "15px", 
                                                border: "1px solid #ccc", borderRadius: "8px", textAlign: "center",
                                                backgroundColor: 'rgba(218, 216, 224, 0.6)', 
                                            }}>
                                                <h2 style={{ color: "#007bff", fontSize: "24px", marginBottom: "15px" }}>Uploaded Photo (GSN)</h2>
                                                <img src={`${url}/${doc.photoPath}`} alt="GSN Uploaded Photo" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '5px' }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- ADDED: Centered GRN Bill Details (Iterating separately) --- */}
                        {grnDocuments && grnDocuments.length > 0 && (
                            <div style={{ 
                                width: "90%", // Can be wider now it's central
                                margin: "20px auto", 
                                padding: "15px", 
                                border: "1px solid #ccc", 
                                borderRadius: "8px", 
                                textAlign: "center",
                                backgroundColor: 'rgba(218, 216, 224, 0.6)',
                            }}>
                                <h2 style={{ color: "#007bff", fontSize: "24px", marginBottom: "15px" }}>Bill Details (GSN or GRIN)</h2>
                                {grnDocuments.map((doc, docIndex) => (
                                    doc.file ? (
                                        <div key={`grin-bill-${docIndex}`} style={{ marginBottom: '10px' }}> {/* Space between multiple bills if they exist */} 
                                            {isImageFile(doc.file) ? (
                                                <img src={`${url}/${doc.file}`} alt={`GRIN Bill ${docIndex + 1}`} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '5px' }} />
                                            ) : (
                                                <a href={`${url}/${doc.file}`} target="_blank" rel="noopener noreferrer" className="hide-in-pdf" style={{
                                                    display: "inline-block",
                                                    padding: "10px 20px",
                                                    backgroundColor: "#28a745",
                                                    color: "#fff",
                                                    textDecoration: "none",
                                                    borderRadius: "5px",
                                                    transition: "background-color 0.3s ease"
                                                }}>View/Download Bill {docIndex + 1}</a>
                                            )}
                                        </div>
                                    ) : null // Don't render anything if no file for this GRIN doc
                                ))}
                                {/* Check if ANY GRN document had a file */} 
                                {!grnDocuments.some(doc => doc.file) && (
                                    <p style={{ color: "#dc3545", fontSize: "18px" }}>No GRIN bill file available</p>
                                )}
                            </div>
                        )}
                        {/* --- END: Centered GRN Bill Details --- */}

                        {grnDocuments && grnDocuments.length > 0 && (
                            <div style={{ backgroundColor: 'rgba(218, 216, 224, 0.2)', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                                <h3 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>GRIN Documents</h3>
                                {grnDocuments.map((doc, docIndex) => (
                                    <div key={`grn-${docIndex}`} className={styles.grinDetails}>
                                <div><label htmlFor=""><h5>GRIN Details</h5></label></div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>GRIN NO.</th>
                                            <th>Date</th>
                                            <th>GSN</th>
                                            <th>Date</th>
                                            <th>P.O. No.</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                                    <td>{doc.grinNo}</td>
                                                    <td>{doc.grinDate}</td>
                                                    <td>{doc.gsn}</td>
                                                    <td>{doc.gsnDate}</td>
                                                    <td>{doc.poNo}</td>
                                                    <td>{doc.poDate}</td>
                                        </tr>
                                    </tbody>
                                </table>

                            <div className={styles.grinDetails}>
                                <label htmlFor=""><h5>Party Details</h5></label>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Party Name</th>
                                            <th>Company Name</th>
                                            <th>Party Invoice No.</th>
                                            <th>Date</th>
                                            <th>Address</th>
                                            <th>GST No</th>
                                            <th>Mobile No</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                                        <td>{doc.partyName}</td>
                                                        <td>{doc.companyName || 'N/A'}</td>
                                                        <td>{doc.innoviceno}</td>
                                                        <td>{doc.innoviceDate}</td>
                                                        <td>{doc.address || 'N/A'}</td>
                                                        <td>{doc.gstNo || 'N/A'}</td>
                                                        <td>{doc.mobileNo || 'N/A'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.grinDetails}>
                                <label htmlFor=""><h5>Transport Details</h5></label>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>L.R. No.</th>
                                            <th>Transporter Name</th>
                                            <th>Vehicle No.</th>
                                            <th>L.R. Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                                        <td>{doc.lrNo}</td>
                                                        <td>{doc.transName}</td>
                                                        <td>{doc.vehicleNo}</td>
                                                        <td>{doc.lrDate}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                                        {doc.tableData && doc.tableData.length > 0 && (
                            <div style={{
                                border: "1px solid #ccc",
                                width: "90%",
                                margin: "2% auto",
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                padding: "20px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                borderRadius: "8px",
                                backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                fontFamily: "'Arial', sans-serif",
                                fontSize: "16px",
                                lineHeight: "1.6",
                                boxSizing: "border-box",
                                maxWidth: "1200px",
                                overflowWrap: "break-word",
                                            }}>
                                                <h5 style={{ textAlign: "center" }}>Material List (Including Price)</h5>
                                                <TableComponent tableData={doc.tableData} />
                            </div>
                                        )}

                                        {/* Added Tax and Total Amount Details */}
                                        <div className={styles.grinDetails} style={{ marginTop: '20px' }}>
                                            <label htmlFor=""><h5>Amount Details</h5></label>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>CGST</th>
                                                        <th>SGST</th>
                                                        <th>Total Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{doc.cgst || 'N/A'}</td>
                                                        <td>{doc.sgst || 'N/A'}</td>
                                                        <td>{doc.totalAmount || 'N/A'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* --- MOVED & COMMENTED OUT: GRN Bill Details --- */}
                                        {/* 
                                        {doc.file && (
                            <div style={{
                                                width: "90%", margin: "20px auto", padding: "15px", 
                                                border: "1px solid #ccc", borderRadius: "8px", textAlign: "center",
                                backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                            }}>
                                                    <h2 style={{ color: "#007bff", fontSize: "24px", marginBottom: "15px" }}>Bill Details (GRIN)</h2>
                                                    {isImageFile(doc.file) ? (
                                                        <img src={`${url}/${doc.file}`} alt="GRIN Bill" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '5px' }} />
                                                    ) : (
                                                        <a href={`${url}/${doc.file}`} target="_blank" rel="noopener noreferrer" className="hide-in-pdf" style={{
                                            display: "inline-block",
                                            padding: "10px 20px",
                                            backgroundColor: "#28a745",
                                            color: "#fff",
                                            textDecoration: "none",
                                            borderRadius: "5px",
                                            transition: "background-color 0.3s ease"
                                        }}>View/Download Bill</a>
                                                    )}
                                            </div>
                                        )}
                                        */}
                                        {/* --- END: GRN Bill Details --- */}

                                        {/* GRN Uploaded Photo */} 
                                        {doc.photoPath && (
                                            <div style={{
                                                width: "90%", margin: "20px auto", padding: "15px", 
                                                border: "1px solid #ccc", borderRadius: "8px", textAlign: "center",
                                                backgroundColor: 'rgba(218, 216, 224, 0.6)', 
                                            }}>
                                                <h2 style={{ color: "#007bff", fontSize: "24px", marginBottom: "15px" }}>Uploaded Photo (GRIN)</h2>
                                                <img src={`${url}/${doc.photoPath}`} alt="GRIN Uploaded Photo" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '5px' }} />
                                            </div>
                                    )}
                                </div>
                                ))}
                            </div>
                        )}

                        <div className={`${styles.sign} hide-in-pdf`} style={{ 
                            backgroundColor: 'rgba(218, 216, 224, 0.2)', 
                                border: "1px solid #ccc",
                            borderRadius: "10px",
                            marginTop: "20px",
                            padding: '10px'
                        }}>
                            <form style={{ padding: '10px', display: 'flex', justifyContent: 'space-around', alignItems: "center", flexWrap: 'wrap' }}>
                                <div className={styles.submission} style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                                    <div style={{ textAlign: 'center', margin: '5px' }}>
                                        <label><h6>General Manager</h6></label><br/>
                                        <input type="checkbox" checked={!!GeneralManagerSigned} readOnly disabled style={{ transform: 'scale(1.5)', cursor: 'not-allowed' }}/>
                                    </div>
                                    <div style={{ textAlign: 'center', margin: '5px' }}>
                                        <label><h6>Store Manager</h6></label><br/>
                                        <input type="checkbox" checked={!!StoreManagerSigned} readOnly disabled style={{ transform: 'scale(1.5)', cursor: 'not-allowed' }}/>
                                    </div>
                                    <div style={{ textAlign: 'center', margin: '5px' }}>
                                        <label><h6>Purchase Manager</h6></label><br/>
                                        <input type="checkbox" checked={!!PurchaseManagerSigned} readOnly disabled style={{ transform: 'scale(1.5)', cursor: 'not-allowed' }}/>
                                    </div>
                                    <div style={{ textAlign: 'center', margin: '5px' }}>
                                        <label><h6>Account Manager</h6></label><br/>
                                        <input type="checkbox" checked={!!AccountManagerSigned} readOnly disabled style={{ transform: 'scale(1.5)', cursor: 'not-allowed' }}/>
                                    </div>
                                    <div style={{ textAlign: 'center', margin: '5px' }}>
                                        <label><h6>Auditor Manager</h6></label><br/>
                                        <input type="checkbox" checked={!!AuditorSigned} readOnly disabled style={{ transform: 'scale(1.5)', cursor: 'not-allowed' }}/>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    {isApprovedByAllFive && (
                        <button 
                            onClick={() => handleDownloadPDF(index)} 
                            className="download-pdf-button hide-in-pdf"
                            style={{ 
                                background: "#007bff",
                                marginBottom:"20px",
                            }}
                        >
                            Download Approved PDF
                        </button>
                    )}
                </div>
            </div>
        );
    };

    console.log('Current combinedList:', combinedList);

    return (
        <>
            <LogOutComponent/>
            <div className={styles.outer} style={{minHeight:"150vh"}}>
                {/* Search Input */}
                <div style={{ padding: '10px 20px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', margin: '10px 0' }}>
                    <input 
                        type="text"
                        placeholder="Search by Party Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>

                {/* Render Filtered List */}
                {filteredCombinedList && filteredCombinedList.length > 0 ? (
                    filteredCombinedList.map((item, index) => renderDocument(item, index))
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <h2>{searchTerm ? 'No matching documents found' : 'No documents found'}</h2>
                        {!searchTerm && <p>Please check if the backend server is running and data is available.</p>}
                    </div>
                )}
        </div>
        </>
    );
}
