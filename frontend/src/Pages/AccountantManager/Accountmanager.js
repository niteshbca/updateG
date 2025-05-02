import React, { useEffect, useState } from 'react';
import styles from '../../Components/Approval/Approval.module.css';
import axios from 'axios';
import TableComponent from '../../Components/Table/Table.rendering';
import LogOutComponent from '../../Components/LogOut/LogOutComponent';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Accountant({ managerType }) {
    const [visibleItem, setVisibleItem] = useState(null);
    const [selectedValue, setSelectedValue] = useState({});
    const [list, setList] = useState([]);
    const [gsnList, setGsnList] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isHovered, setIsHovered] = useState(false);
    const [isGsnDataLoaded, setIsGsnDataLoaded] = useState(false);
    const [isListDataLoaded, setIsListDataLoaded] = useState(false);

    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredGsnList, setFilteredGsnList] = useState([]);

    managerType = 'Account Manager';
    const managerFieldMap = {
        'General Manager': 'GeneralManagerSigned',
        'Store Manager': 'StoreManagerSigned',
        'Purchase Manager': 'PurchaseManagerSigned',
        'Account Manager': 'AccountManagerSigned'
    };

    const url = process.env.REACT_APP_BACKEND_URL;
    const fieldName = managerFieldMap[managerType];

        const fetchingGsnData = async () => {
            try {
            const token = localStorage.getItem('authToken');
            console.log(`(${managerType}) Fetching GSN data with token:`, token);
                const resData = await axios.get(`${url}/gsn/getdata`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            const getData = resData.data;
            console.log(`(${managerType}) Fetched GSN Data:`, getData);

            const fetchedList = getData.filter((u) => !u.isHidden);

            // Sort by createdAt descending
            fetchedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const initialSelectedValue = fetchedList.reduce((acc, item) => {
                if (fieldName && item.hasOwnProperty(fieldName)) {
                    acc[item._id] = item[fieldName] === true ? 'checked' : 'not_checked';
                } else {
                    acc[item._id] = 'not_checked';
                }
                    return acc;
                }, {});

            setGsnList(fetchedList);
                setSelectedValue(initialSelectedValue);
                setIsGsnDataLoaded(true);
            } catch (err) {
            console.error(`(${managerType}) Error fetching GSN data`, err);
            if (err.response) {
                console.error(`(${managerType}) GSN Fetch Error Response:`, err.response.data);
            }
            }
        };

    useEffect(() => {
        fetchingGsnData();
    }, []);

    // useEffect for filtering based on searchTerm
    useEffect(() => {
        let filtered = gsnList;
        if (searchTerm) {
            filtered = gsnList.filter(item => 
                item.partyName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredGsnList(filtered);
    }, [searchTerm, gsnList]); // Re-run when searchTerm or the main list changes

    useEffect(() => {
        const fetchingGrnData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                console.log(`(${managerType}) Fetching GRN data with token:`, token);
                const resData = await axios.get(`${url}/getdata`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                const data = resData.data;
                console.log(`(${managerType}) Fetched GRN Data:`, data);
                const fetchedList = data.filter((u) => !u.isHidden);
                setList(fetchedList);
                setIsListDataLoaded(true);
            } catch (err) {
                console.error(`(${managerType}) Error fetching GRN data`, err);
                 if (err.response) {
                    console.error(`(${managerType}) GRN Fetch Error Response:`, err.response.data);
                 }
            }
        };
        fetchingGrnData();
    }, []);

    const formatDate = (oldFormat) => {
        if (!oldFormat) return "N/A";
        const date = new Date(oldFormat);
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: 'numeric', minute: 'numeric', second: 'numeric'
        });
    };

    const showHandler = (index) => {
        setVisibleItem(visibleItem === index ? null : index);
    };

    const handleRadioChange = (_Id, value) => {
        console.log(`(${managerType}) Radio change for ${_Id}:`, value);
        setSelectedValue(prev => ({ ...prev, [_Id]: value }));
    };

    const handleSubmit = async (e, _Id) => {
        e.preventDefault();
        const currentStatus = selectedValue[_Id] || 'not_checked';
        const payload = {
            _Id,
            managerType,
            status: currentStatus
        };
        console.log(`(${managerType}) Submitting verification status:`, payload);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${url}/verify`, payload, {
                 headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                 }
            });
            console.log(`(${managerType}) Verification Response:`, response.data);
            alert('Verification status saved successfully');
            await fetchingGsnData();
        } catch (err) {
            console.error(`(${managerType}) Error saving verification status`, err);
            if (err.response) {
                console.error(`(${managerType}) Verification Error Response:`, err.response.data);
                alert(`Error: ${err.response.data.message || 'Could not save status'}`);
            } else {
                alert('An error occurred while saving the status.');
            }
        }
    };

    const isImageFile = (filename) => {
        if (!filename) return false;
        const extension = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
    };

    const handleDownloadPDF = (index) => {
        const item = gsnList[index]; 
        if (!item) return;
        
        const divElement = document.getElementById(`item-div-${item._id}`);
        if (!divElement) return;

        const partyName = item.partyName || `document-${item._id}`;
        const sanitizedPartyName = partyName.replace(/[^a-zA-Z0-9]/g, '_');
        
        const sanitizedManagerType = managerType.replace(/[^a-zA-Z0-9]/g, '_');

        const elementsToHide = divElement.querySelectorAll('.hide-in-pdf');
        
        const originalDisplayStyles = [];
        elementsToHide.forEach(el => {
            originalDisplayStyles.push(el.style.display);
            el.style.display = 'none';
        });

        setTimeout(() => {
            html2canvas(divElement, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
              .then((canvas) => {
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
                pdf.save(`${sanitizedPartyName}_${sanitizedManagerType}.pdf`);

                elementsToHide.forEach((el, i) => {
                    el.style.display = originalDisplayStyles[i];
                });
            }).catch(err => {
                 console.error("Error generating PDF:", err);
                 elementsToHide.forEach((el, i) => {
                    el.style.display = originalDisplayStyles[i];
                 });
            });
        }, 100);
    };

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
                        style={{ 
                            width: '100%', 
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #ccc' 
                        }}
                    />
                </div>

                {/* Render Filtered List */}
                {filteredGsnList.map((item, index) => {
                    const defaultItem = {
                        _id: "0",
                        grinNo: false,
                        grinDate: "N/A",
                        gsn: "N/A",
                        gsnDate: "N/A",
                        poNo: "N/A",
                        poDate: "N/A",
                        partyName: "N/A",
                        innoviceno: "N/A",
                        innoviceDate: "N/A",
                        receivedFrom: "N/A",
                        lrNo: "N/A",
                        lrDate: "N/A",
                        transName: "N/A",
                        vehicleNo: "N/A",
                        file: "N/A",
                        GeneralManagerSigned: "N/A",
                        PurchaseManagerSigned: "N/A",
                        StoreManagerSigned: "N/A",
                        AccountManagerSigned: "N/A",
                        tableData: [],
                        createdAt: "N/A"
                    };
                    let listItem = defaultItem;
                    const filteredGrn = list.find(u => u.gsn === item.gsn);
                    if (filteredGrn) {
                        listItem = filteredGrn;
                    }
                    const {
                        _id,
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
                        file: gsnBillFile,
                        GeneralManagerSigned,
                        PurchaseManagerSigned,
                        StoreManagerSigned,
                        tableData,
                        createdAt,
                        photoPath: gsnPhotoPath
                    } = item;
                    const materialList = Array.isArray(tableData) ? tableData : [];

                    const isGeneralManagerSigned = !!item.GeneralManagerSigned;
                    const isStoreManagerSigned = !!item.StoreManagerSigned;
                    const isPurchaseManagerSigned = !!item.PurchaseManagerSigned;
                    const isAccountManagerSigned = selectedValue[_id] === 'checked';
                    const isAuditorSigned = !!item.AuditorSigned;

                    const isApprovedByAllFive = isGeneralManagerSigned && isStoreManagerSigned && isPurchaseManagerSigned && isAccountManagerSigned && isAuditorSigned;
                    const statusText = isApprovedByAllFive ? "(Approved)" : "(Pending Approval)";
                    
                    const isAccountManagerEnabled = isGeneralManagerSigned && isStoreManagerSigned && isPurchaseManagerSigned && !!item.grinNo;

                    const grinItem = list.find(u => u.gsn === item.gsn) || {}; // Ensure grinItem is found or default
                    const grinBillFile = grinItem?.file;
                    const grinPhotoPath = grinItem?.photoPath;

                    return (
                        <div key={_id} id={`item-div-${_id}`} className={styles.show}>
                            <h2
                                style={{
                                    color: "black",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    transition: "background-color 0.3s ease",
                                }}
                                onClick={() => showHandler(index)}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                {partyName || 'N/A'}
                                <span style={{ marginLeft: '10px', fontSize: '0.8em', color: isApprovedByAllFive ? 'green' : 'green' }}>
                                    {statusText}
                                </span>
                            </h2>

                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <div className={styles.completeBlock} style={{ display: visibleItem === index ? 'block' : 'none' }}>
                                    <div className={styles.grinDetails}>
                                        <h1 style={{ textAlign: "center" }}>GSN</h1>
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
                                                    <td>{grinNo}</td>
                                                    <td>{formatDate(grinDate)}</td>
                                                    <td>{gsn}</td>
                                                    <td>{formatDate(gsnDate)}</td>
                                                    <td>{poNo}</td>
                                                    <td>{formatDate(poDate)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

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
                                                    <td>{partyName}</td>
                                                    <td>{item.companyName || 'N/A'}</td>
                                                    <td>{innoviceno}</td>
                                                    <td>{formatDate(innoviceDate)}</td>
                                                    <td>{item.address || 'N/A'}</td>
                                                    <td>{item.gstNo || 'N/A'}</td>
                                                    <td>{item.mobileNo || 'N/A'}</td>
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
                                                    <td>{lrNo}</td>
                                                    <td>{transName}</td>
                                                    <td>{vehicleNo}</td>
                                                    <td>{formatDate(lrDate)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{
                                        border: "1px solid #ccc",
                                        width: "90%",
                                        margin: "2% auto",
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
                                        <h5 style={{ textAlign: "center", alignItems: "center" }} >Material List</h5>
                                        <TableComponent tableData={materialList} />
                                    </div>
                                    <div className={styles.grinDetails} style={{ marginTop: '20px' }}>
                                        <label htmlFor=""><h5>Amount Details (GSN)</h5></label>
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
                                                    <td>{item.cgst || 'N/A'}</td>
                                                    <td>{item.sgst || 'N/A'}</td>
                                                    <td>{item.totalAmount || 'N/A'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="timestamp" style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                        backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                        borderRadius: '10px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid #e0e0e0',
                                        margin: '20px auto',
                                        maxWidth: '400px',
                                        fontFamily: "'Roboto', sans-serif",
                                        color: '#333',
                                    }}>
                                        <h1 style={{
                                            fontSize: '24px',
                                            marginBottom: '10px',
                                            color: '#2c3e50',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                        }}>Created At</h1>
                                        <p style={{
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: '#34495e',
                                        }}>{formatDate(createdAt)}</p>
                                    </div>
                                    {/* GSN Uploaded Photo */} 
                                    {gsnPhotoPath && (
                                    <div style={{
                                            width: "90%", margin: "20px auto", padding: "15px", 
                                            border: "1px solid #ccc", borderRadius: "8px", textAlign: "center",
                                            backgroundColor: 'rgba(218, 216, 224, 0.6)', 
                                        }}>
                                            <h2 style={{ color: "#007bff", fontSize: "24px", marginBottom: "15px" }}>Uploaded Photo (GSN)</h2>
                                            <img src={`${url}/${gsnPhotoPath}`} alt="GSN Uploaded Photo" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '5px' }} />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.completeBlock} style={{ display: visibleItem === index ? 'block' : 'none' }}>
                                    <div className={styles.grinDetails}>
                                        <h1 style={{ textAlign: "center" }}>GRIN</h1>
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
                                                    <td>{listItem ? listItem.grinNo : 'N/A'}</td>
                                                    <td>{listItem ? formatDate(listItem.grinDate) : 'N/A'}</td>
                                                    <td>{listItem ? listItem.gsn : 'N/A'}</td>
                                                    <td>{listItem ? formatDate(listItem.gsnDate) : 'N/A'}</td>
                                                    <td>{listItem ? listItem.poNo : 'N/A'}</td>
                                                    <td>{listItem ? formatDate(listItem.poDate) : 'N/A'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

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
                                                    <td>{listItem ? listItem.partyName : 'N/A'}</td>
                                                    <td>{listItem ? listItem.companyName : 'N/A'}</td>
                                                    <td>{listItem ? listItem.innoviceno : "N/A"}</td>
                                                    <td>{listItem ? formatDate(listItem.innoviceDate) : 'N/A'}</td>
                                                    <td>{listItem ? listItem.address : 'N/A'}</td>
                                                    <td>{listItem ? listItem.gstNo : 'N/A'}</td>
                                                    <td>{listItem ? listItem.mobileNo : 'N/A'}</td>
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
                                                    <td>{listItem ? listItem.lrNo : 'N/A'}</td>
                                                    <td>{listItem ? listItem.transName : 'N/A'}</td>
                                                    <td>{listItem ? listItem.vehicleNo : 'N/A'}</td>
                                                    <td>{listItem ? formatDate(listItem.lrDate) : 'N/A'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{
                                        border: "1px solid #ccc",
                                        width: "90%",
                                        margin: "2% auto",
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
                                        <h5 style={{ textAlign: "center", alignItems: "center" }} >Material List</h5>
                                        <TableComponent tableData={listItem ? listItem.tableData : []} />
                                    </div>
                                    <div className={styles.grinDetails} style={{ marginTop: '20px' }}>
                                        <label htmlFor=""><h5>Amount Details (GRIN)</h5></label>
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
                                                    <td>{listItem ? listItem.cgst : 'N/A'}</td>
                                                    <td>{listItem ? listItem.sgst : 'N/A'}</td>
                                                    <td>{listItem ? listItem.totalAmount : 'N/A'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="timestamp" style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                        backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                        borderRadius: '10px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid #e0e0e0',
                                        margin: '20px auto',
                                        maxWidth: '400px',
                                        fontFamily: "'Roboto', sans-serif",
                                        color: '#333',
                                    }}>
                                        <h1 style={{
                                            fontSize: '24px',
                                            marginBottom: '10px',
                                            color: '#2c3e50',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                        }}>Created At</h1>
                                        <p style={{
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: '#34495e',
                                        }}>{formatDate(listItem ? listItem.createdAt : 'N/A')}</p>
                                    </div>
                                    {/* GRN Uploaded Photo */} 
                                    {grinPhotoPath && (
                                        <div style={{
                                            width: "90%", margin: "20px auto", padding: "15px", 
                                            border: "1px solid #ccc", borderRadius: "8px", textAlign: "center",
                                            backgroundColor: 'rgba(218, 216, 224, 0.6)', 
                                        }}>
                                            <h2 style={{ color: "#007bff", fontSize: "24px", marginBottom: "15px" }}>Uploaded Photo (GRIN)</h2>
                                            <img src={`${url}/${grinPhotoPath}`} alt="GRIN Uploaded Photo" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '5px' }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- ADDED: Centered GRN Bill Details --- */}
                            {visibleItem === index && grinBillFile && (
                                    <div style={{
                                    width: "45%", // Takes roughly half width to sit between
                                    margin: "20px auto", 
                                        padding: "15px",
                                    border: "1px solid #ccc", 
                                        borderRadius: "8px",
                                    textAlign: "center",
                                    backgroundColor: 'rgba(218, 216, 224, 0.6)', 
                                }}>
                                    <h2 style={{ color: "#007bff", fontSize: "24px", marginBottom: "15px" }}>Bill Details (GSN or GRIN)</h2>
                                    {isImageFile(grinBillFile) ? (
                                        <img src={`${url}/${grinBillFile}`} alt="GRIN Bill" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '5px' }} />
                                    ) : (
                                        <a href={`${url}/${grinBillFile}`} target="_blank" rel="noopener noreferrer" style={{
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
                            {visibleItem === index && !grinBillFile && (
                                <div style={{ /* Styling for no GRIN bill */ 
                                    width: "45%", margin: "20px auto", textAlign: "center", padding: "15px"
                                }}>
                                     <p style={{ color: "#dc3545", fontSize: "18px" }}>No GRIN bill file available</p>
                                </div>
                            )}
                            {/* --- END: Centered GRN Bill Details --- */}

                            <div className={`${styles.sign} hide-in-pdf`} style={{
                                    width: '90%',
                                    display: 'flex',
                                    margin: '5px',
                                    padding: '1px',
                                    animation: "gradientBG 10s ease infinite",
                                    flexDirection: windowWidth <= 600 ? "column" : "row",
                                    animation: 'fadeIn 1s ease',
                                    margin: windowWidth <= 600 ? '0' : '20px',
                                    justifyContent: 'center',
                                    alignItems: "center",
                            }}>
                                <form style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: "center" }} onSubmit={(e) => handleSubmit(e, _id)} >
                                    <div className={styles.submission} >
                                        <div>
                                            <label htmlFor="Verify"><h6>General Manager,</h6></label><br/><center>
                                            <input
                                                name={`checkbox-${index}`}
                                                style={{
                                                    width: '12px',
                                                    height: '20px',
                                                    transform: 'scale(1.5)',
                                                    cursor: 'pointer',
                                                    marginLeft: '10px'
                                                }}
                                                value='checked'
                                                type="checkbox"
                                                checked={!!GeneralManagerSigned}
                                                readOnly
                                            /></center>
                                        </div>
                                        <div>
                                            <label htmlFor="Verify"><h6>Store Manager,</h6></label><br/><center>
                                            <input
                                                name={`checkbox-${index}`}
                                                style={{
                                                    width: '12px',
                                                    height: '20px',
                                                    transform: 'scale(1.5)',
                                                    cursor: 'pointer',
                                                    marginLeft: '10px'
                                                }}
                                                value='checked'
                                                type="checkbox"
                                                checked={!!StoreManagerSigned}
                                                readOnly
                                            /></center>
                                        </div>
                                        <div>
                                            <label htmlFor="Verify"><h6>Purchase Manager,</h6></label><br/><center>
                                            <input
                                                name={`checkbox-${index}`}
                                                style={{
                                                    width: '12px',
                                                    height: '20px',
                                                    transform: 'scale(1.5)',
                                                    cursor: 'pointer',
                                                    marginLeft: '10px'
                                                }}
                                                value='checked'
                                                type="checkbox"
                                                checked={!!PurchaseManagerSigned}
                                                readOnly
                                            /></center>
                                        </div>
                                        <div>
                                            <label htmlFor="Verify"><h6>Auditor Manager,</h6></label><br/><center>
                                            <input
                                                name={`checkbox-${index}-auditor`}
                                                style={{
                                                    width: '12px',
                                                    height: '20px',
                                                    transform: 'scale(1.5)',
                                                    cursor: 'not-allowed',
                                                    marginLeft: '10px'
                                                }}
                                                value='checked'
                                                type="checkbox"
                                                checked={isAuditorSigned}
                                                readOnly
                                            /></center>
                                        </div>
                                        <div>
                                            <label htmlFor="Verify"><h6>Account Manager</h6></label>
                                            <br />
                                            <center>                                            <input
                                                name={`checkbox-${index}`}
                                                style={{
                                                    width: '12px',
                                                    height: '20px',
                                                    transform: 'scale(1.5)',
                                                    cursor: isAccountManagerEnabled ? 'pointer' : 'not-allowed',
                                                    marginLeft: '10px'
                                                }}
                                                value='checked'
                                                type="checkbox"
                                                checked={selectedValue[_id] === 'checked'} 
                                                onChange={() => handleRadioChange(_id, selectedValue[_id] === 'checked' ? 'not_checked' : 'checked')}
                                                disabled={!isAccountManagerEnabled}
                                            /></center>
                                        </div> <br />
                                        <div>
                                            <button 
                                                disabled={!isAccountManagerEnabled} 
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '100px',
                                                    margin: '5px',
                                                    padding: "0 10px",
                                                    minWidth: "80px",
                                                    borderRadius: '15px',
                                                    border: '2px solid transparent',
                                                    backgroundColor: 'rgba(218, 216, 224, 0.8)',
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    transition: 'background-color 0.3s ease',
                                                    opacity: isAccountManagerEnabled ? 1 : 0.6,
                                                    cursor: isAccountManagerEnabled ? 'pointer' : 'not-allowed',
                                                }}
                                            >Submit</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            {isApprovedByAllFive && (
                                <button 
                                    onClick={() => handleDownloadPDF(index)} 
                                    className="download-pdf-button hide-in-pdf"
                                    style={{ 
                                        marginTop: "10px", 
                                        padding: "5px 10px", 
                                        marginBottom:"20px",
                                        background: "#007bff",
                                        color: "white", 
                                        border: "none", 
                                        cursor: "pointer",
                                        display: "block" 
                                    }}
                                >
                                    Download Final PDF
                                </button>
                            )}
                        </div>
                    );
                })}
                 {/* Optional: Message when no results found */}
                 {filteredGsnList.length === 0 && gsnList.length > 0 && (
                    <p style={{ textAlign: 'center', padding: '20px' }}>No matching entries found.</p>
                )}
                {!isGsnDataLoaded && <p>Loading documents...</p>}
                {isGsnDataLoaded && gsnList.length === 0 && <p>No documents awaiting Account Manager approval.</p>}
            </div>
        </>
    );
}





