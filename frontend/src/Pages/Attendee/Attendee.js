import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import style from './Inputgrin.module.css';
import styles from './Fileupload.module.css'; // Import the CSS module
import TableComponent from '../../Components/Table/TableEntry'; // Import the TableComponent
import LogOutComponent from '../../Components/LogOut/LogOutComponent';
import { useLocation } from 'react-router-dom';

export default function Attendee() {
    const location = useLocation();
    const initialselectedValue = location.state?.selectedvalue || '';
    const gsndate = location.state?.innoviceDate || '';
    const initialGrinNo = location.state?.selectedGrinNo || '';
    const initialGsn = location.state?.selectedGsn || '';
    const initialGrinDate = location.state?.selectedGrinDate || '';
    const initialGsnDate = location.state?.selectedGsnDate || '';
    
    const initialgsnDate = gsndate && !isNaN(new Date(gsndate))
        ? new Date(gsndate).toISOString().split('T')[0]
        : '';

    const [grinNo, setGrinNo] = useState(initialGrinNo);
    const [grinDate, setGrinDate] = useState(initialGrinDate);
    const [gsn, setGsn] = useState(initialGsn);
    const [gsnDate, setGsnDate] = useState(initialGsnDate);
    const [poNo, setPoNo] = useState('');
    const [poDate, setPoDate] = useState('');
    const [partyName, setpartyName] = useState(initialselectedValue);
    const [innoviceno, setInnoviceno] = useState('');
    const [innoviceDate, setInnoviceDate] = useState(initialgsnDate);
    const [receivedFrom, setReceivedFrom] = useState('');
    const [lrNo, setLrNo] = useState('');
    const [lrDate, setLrDate] = useState('');
    const [transName, setTransName] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [materialInfo, setMaterialInfo] = useState(''); // State for textarea
    const [file, setFile] = useState(null);
    const [photo, setPhoto] = useState(null); // Add photo state

    // Add state for new fields
    const [gstNo, setGstNo] = useState("");
    const [cgst, setCgst] = useState("");
    const [sgst, setSgst] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [mobileNo, setMobileNo] = useState("");

    // State for calculated total amount
    const [totalAmount, setTotalAmount] = useState(0);

    const [tableData, setTableData] = useState(
        Array.from({ length: 20 }, () => ({
            item: '',
            description: '',
            quantityNo: '',
            quantityKg: '',
            price: ''
        }))
    );

    useEffect(() => {
        if (initialselectedValue) {
            setpartyName(initialselectedValue);
            console.log("Auto-filled Party Name:", initialselectedValue);
        }
        if (initialgsnDate) {
            setInnoviceDate(initialgsnDate);
            console.log("Auto-filled Invoice Date:", initialgsnDate);
        }
        if (initialGrinNo) {
            setGrinNo(initialGrinNo);
            console.log("Auto-filled GRIN No:", initialGrinNo);
        }
        if (initialGsn) {
            setGsn(initialGsn);
            console.log("Auto-filled GSN:", initialGsn);
        }
        if (initialGrinDate) {
            setGrinDate(initialGrinDate);
            console.log("Auto-filled GRIN Date:", initialGrinDate);
        }
        if (initialGsnDate) {
            setGsnDate(initialGsnDate);
            console.log("Auto-filled GSN Date:", initialGsnDate);
        }
    }, [initialselectedValue, initialgsnDate, initialGrinNo, initialGsn, initialGrinDate, initialGsnDate]);

    const [backendData, setbackendData] = useState([]);
    const [filteredbackend, setfilteredBackend] = useState([]);
    const popupRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Add handler for photo change
    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleTableChange = (index, field, value) => {
        const updatedData = [...tableData];
        updatedData[index][field] = value;
        setTableData(updatedData);
    };

    const resetForm = () => {
        setGrinNo('');
        setGrinDate('');
        setGsn('');
        setGsnDate('');
        setPoNo('');
        setPoDate('');
        setpartyName('');
        setInnoviceno('');
        setInnoviceDate('');
        setReceivedFrom('');
        setLrNo('');
        setLrDate('');
        setTransName('');
        setVehicleNo('');
        setMaterialInfo('');
        setFile(null);
        setPhoto(null); // Reset photo
        // Reset new fields
        setGstNo('');
        setCgst('');
        setSgst('');
        setCompanyName('');
        setAddress('');
        setMobileNo('');
        setTotalAmount(0); // Reset total amount

        setTableData(
            Array.from({ length: 20 }, (_, index) => ({
                item: `Item ${index + 1}`,
                description: `Description ${index + 1}`,
                quantityNo: '',
                quantityKg: '',
                price: ''
            }))
        );
    };

    // useEffect for calculating total amount
    useEffect(() => {
        let subTotal = 0;
        tableData.forEach(row => {
            const qty = parseFloat(row.quantityNo) || 0;
            const price = parseFloat(row.price) || 0;
            subTotal += qty * price;
        });

        const cgstVal = parseFloat(cgst) || 0;
        const sgstVal = parseFloat(sgst) || 0;

        // Assuming cgst and sgst state hold the AMOUNT, not percentage
        const finalTotal = subTotal + cgstVal + sgstVal;
        console.log("Calculated Total Amount:", finalTotal); // Debug log
        setTotalAmount(finalTotal);
    }, [tableData, cgst, sgst]);

    const submitHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('grinNo', grinNo);
        formData.append('grinDate', grinDate);
        formData.append('gsn', gsn);
        formData.append('gsnDate', gsnDate);
        formData.append('poNo', poNo);
        formData.append('poDate', poDate);
        formData.append('partyName', partyName);
        formData.append('innoviceno', innoviceno);
        formData.append('innoviceDate', innoviceDate);
        formData.append('receivedFrom', receivedFrom);
        formData.append('lrNo', lrNo);
        formData.append('lrDate', lrDate);
        formData.append('transName', transName);
        formData.append('vehicleNo', vehicleNo);
        formData.append('materialInfo', materialInfo); // Append textarea content
        formData.append('tableData', JSON.stringify(tableData)); // Append table data as JSON

        // Log and Append new fields
        console.log("Frontend Sending - GST:", gstNo, "CGST:", cgst, "SGST:", sgst);
        console.log("Frontend Sending - Company:", companyName, "Address:", address, "Mobile:", mobileNo);
        formData.append("gstNo", gstNo);
        formData.append("cgst", cgst);
        formData.append("sgst", sgst);
        formData.append("companyName", companyName);
        formData.append("address", address);
        formData.append("mobileNo", mobileNo);
        formData.append("totalAmount", totalAmount.toString()); // Convert to string to ensure proper transmission

        if (file) {
            formData.append('file', file);
        }

        // Append photo if selected (optional)
        if (photo) {
            formData.append('photo', photo);
            console.log("Photo added to form data:", photo.name);
        }

        try {
            const url = process.env.REACT_APP_BACKEND_URL;
            const token = localStorage.getItem('authToken');
            console.log("Submitting to URL:", `${url}/upload-data`);
            console.log("Using token:", token ? "Token exists" : "No token found");
            console.log("FormData contents:", Object.fromEntries(formData.entries())); // Debug log
            
            const response = await axios.post(`${url}/upload-data`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("Response:", response.data);
            
            // Show appropriate message based on whether entry was created or updated
            if (response.status === 200) {
                alert('Entry Updated Successfully');
            } else {
                alert('Entry Created Successfully');
            }
            
            resetForm();
        } catch (error) {
            alert('Error in uploading data');
            console.error('Error uploading file:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
            }
        }
    };

    useEffect(() => {
        const getData = async () => {
            try {
                const url = process.env.REACT_APP_BACKEND_URL;
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`${url}/gsn/getdata`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log(res.data);
                setbackendData(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        getData();
    }, []);

    useEffect(() => {
        const func = async () => {
            const filtered = backendData.filter((u) =>
                u.partyName.toLowerCase().includes(partyName.toLowerCase())
            );
            setfilteredBackend(filtered);
            if (filtered.length > 0) {
                setIsVisible(true);
            } else {
                setIsVisible(false); // Hide popup when no match found
            }
        };
        func();
    }, [partyName]);

    const handleFocus = () => {
        setIsVisible(true);
    };

    const handleBlur = (event) => {
        setTimeout(() => setIsVisible(false), 1000);
    };

    const handleSelectParty = (party) => {
        setpartyName(party);
        setIsVisible(false); // Close popup after selection
    };

    // Inline CSS Styles
    const containerStyle = {
        width:"130%",
        overflow: 'hidden',
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

    return (
        <>
            <LogOutComponent />
            <div style={containerStyle} >
                <style>{globalStyles}</style>
                <div
                    style={{
                        
                        width: '100vw',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div
                        id="nav"
                        style={{
                            
                            width: '90%',
                            height: '30px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '25px',
                            padding: '10px',
                            marginTop: '20px',
                        }}
                    >
                        <h2>GRIN Details</h2>
                    </div>

                    <div style={{
                        width: '90vw', maxWidth: '700px',

                    }}>
                        <form
                            action=""
                            onSubmit={submitHandler}
                            style={{ margin: '20px', width: '100%',
                                
                             }}
                        >
                            {/* GRIN NO. and Date */}
                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>GRIN NO:</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        readOnly
                                        value={grinNo}
                                        onChange={(e) => setGrinNo(e.target.value)}
                                    />
                                    <input
                                        className={styles.dateInput}
                                        style={{ margin: '10px', maxWidth: '500px' }}
                                        type="date"
                                        value={grinDate}
                                        onChange={(e) => setGrinDate(e.target.value)}
                                    />
                                </div>

                                {/* GSN and Date */}
                                <div className={styles.formRow}>
                                    <label className={styles.label}>GSN:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={gsn}
                                        readOnly
                                        required
                                        onChange={(e) => setGsn(e.target.value)}
                                    />
                                    <input
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ margin: '10px' }}
                                        value={gsnDate}
                                        readOnly 
                                        required
                                        onChange={(e) => setGsnDate(e.target.value)}
                                    />
                                </div>

                                {/* P.O. NO. and Date */}
                                <div className={styles.formRow}>
                                    <label className={styles.label}>P.O. NO:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={poNo}
                                        onChange={(e) => setPoNo(e.target.value)}
                                    />
                                    <input
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ margin: '10px' }}
                                        value={poDate}
                                        onChange={(e) => setPoDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Party Details */}
                            <div className={styles.form}>
                                {/* Party Name Input */}
                                <div className={styles.formRow} style={{ position: 'relative' }}>
                                    <label className={styles.label}>Party Name:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={partyName}
                                        onFocus={handleFocus}
                                        onBlur={(event) => handleBlur(event)}
                                        readOnly
                                        onChange={(e) => setpartyName(e.target.value)}
                                    />
                                    {/* Popup for Party Name Suggestions */}
                                    <div
                                        className="popUp"
                                        ref={popupRef}
                                        style={{
                                            display: isVisible ? 'block' : 'none',
                                            position: 'absolute',
                                            zIndex: '1000',
                                            top: '100%',
                                            width: '100%',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#ffffff',
                                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            transition: 'opacity 0.3s ease-in-out',
                                            opacity: isVisible ? 1 : 0,
                                        }}
                                    >
                                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                            {filteredbackend.map((u, _id) => (
                                                <li
                                                    key={u._id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectParty(u.partyName);
                                                    }}
                                                    style={{ cursor: 'pointer', padding: '8px 0' }}
                                                >
                                                    {u.partyName}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {/* Hidden Dummy Input */}
                                    <input
                                        type="text"
                                        className={`${styles.dateInput} ${styles.dummy}`}
                                        style={{ visibility: 'hidden' }}
                                    />
                                </div>

                                {/* Party Invoice No and Date Input */}
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Party Invoice No:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={innoviceno}
                                        onChange={(e) => setInnoviceno(e.target.value)}
                                    />
                                    <input
                                        className={styles.dateInput}
                                        type="date"
                                        readOnly
                                        value={innoviceDate}
                                        onChange={(e) => setInnoviceDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* Transport Details */}
                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>L.R. No:</label>
                                    <input
                                        className={styles.input}
                                        style={{ marginBottom: '20px' }}
                                        type="text"
                                        value={lrNo}
                                        onChange={(e) => setLrNo(e.target.value)}
                                    />
                                    <input
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ marginTop: '30px' }}
                                        value={lrDate}
                                        onChange={(e) => setLrDate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Name of Transporter:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={transName}
                                        onChange={(e) => setTransName(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className={`${styles.dateInput} ${styles.dummy}`}
                                        style={{ visibility: 'hidden' }}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Vehicle No:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className={`${styles.dateInput} ${styles.dummy}`}
                                        style={{ visibility: 'hidden' }}
                                    />
                                </div>
                            </div>

                            {/* Added Section for New Fields */}
                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Company Name:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Address:</label>
                                    <textarea
                                        className={styles.input} // Use input style or create a textarea style
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows={3} // Adjust rows as needed
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>GST No:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={gstNo}
                                        onChange={(e) => setGstNo(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Mobile No:</label>
                                    <input
                                        className={styles.input}
                                        type="tel" // Use tel type for mobile numbers
                                        value={mobileNo}
                                        onChange={(e) => setMobileNo(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>CGST:</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        step="0.01"
                                        value={cgst}
                                        onChange={(e) => setCgst(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>SGST:</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        step="0.01"
                                        value={sgst}
                                        onChange={(e) => setSgst(e.target.value)}
                                    />
                                </div>
                                {/* Display Calculated Total Amount */}
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Total Amount:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={totalAmount.toFixed(2)} // Format to 2 decimal places
                                        readOnly // Make it non-editable
                                        style={{ fontWeight: 'bold', backgroundColor: '#e9ecef' }} // Style for read-only
                                    />
                                </div>
                            </div>
                            {/* End Added Section */}

                            {/* Material Information (Table) */}
                            <div className={styles.forms}>
                                <div
                                    className={styles.formRow}
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        //  backgroundColor:"rgba(218, 216, 224, 0.8)" 
                                        //  backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                         borderRadius: '15px',
                                        }}
                                >
                                    <label className={styles.label}>Material Information:</label>
                                    <TableComponent
                                        data={tableData}
                                        handleTableChange={handleTableChange}
                                    />
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className={style.form}
                            style={{backgroundColor:"rgba(218, 216, 224, 0.6)" }}
                            >
                                <div className={style.formRow}>
                                    <label className={style.label}>Upload Bill (Optional):</label>
                                    <label
                                        className={style.custom}
                                        htmlFor="file-upload"
                                    >
                                        {file !== null ? `${file.name}` : 'Select Bill'}
                                    </label>
                                    <input
                                        id="file-upload"
                                        className={style.fileInput}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                
                                {/* Add Photo Upload Field */}
                                <div className={style.formRow}>
                                    <label className={style.label}>Upload Photo (Optional):</label>
                                    <label
                                        className={style.custom}
                                        htmlFor="photo-upload"
                                    >
                                        {photo !== null ? `${photo.name}` : 'Select Photo'}
                                    </label>
                                    <input
                                        id="photo-upload"
                                        className={style.fileInput}
                                        type="file"
                                        accept="image/jpeg, image/png, image/jpg, .pdf"
                                        onChange={handlePhotoChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div id="btn">
                                <button
                                    style={{
                                         width: '100%',
                                        backgroundColor:"rgba(218, 216, 224, 0.8)" }}
                                    className={style.button}
                                    id={styles.btn}
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}