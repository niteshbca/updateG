import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import style from '../Attendee/Inputgrin.module.css';
import styles from "../Attendee/Fileupload.module.css"; // Import the CSS module
import TableComponent from '../../Components/Table/TableEntry'; // Import the TableComponent
import LogOutComponent from '../../Components/LogOut/LogOutComponent';

export default function Gsn() {
    const [grinNo, setGrinNo] = useState("");
    const [grinDate, setGrinDate] = useState("");
    const [gsn, setGsn] = useState("");
    const [gsnDate, setGsnDate] = useState("");
    const [poNo, setPoNo] = useState("");
    const [poDate, setPoDate] = useState("");

    const [partyName, setpartyName] = useState("");
    const [innoviceno, setInnoviceno] = useState("");
    const [innoviceDate, setInnoviceDate] = useState("");
    const [receivedFrom, setReceivedFrom] = useState("");

    const [lrNo, setLrNo] = useState("");
    const [lrDate, setLrDate] = useState("");
    const [transName, setTransName] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");

    const [materialInfo, setMaterialInfo] = useState("");
    const [file, setFile] = useState(null);
    const [photo, setPhoto] = useState(null);

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

    const [backendData, setbackendData] = useState([])
    const [filteredbackend, setfilteredBackend] = useState([])
    const popupRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    // State for Company Name suggestions
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [isCompanyPopupVisible, setIsCompanyPopupVisible] = useState(false);
    const companyPopupRef = useRef(null); // Ref for company popup

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

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
        setPhoto(null);
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

    const submitHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("grinNo", grinNo);
        formData.append("grinDate", grinDate);
        formData.append("gsn", gsn);
        formData.append("gsnDate", gsnDate);
        formData.append("poNo", poNo);
        formData.append("poDate", poDate);
        formData.append("partyName", partyName);
        formData.append("innoviceno", innoviceno);
        formData.append("innoviceDate", innoviceDate);
        formData.append("lrNo", lrNo);
        formData.append("lrDate", lrDate);
        formData.append("transName", transName);
        formData.append("vehicleNo", vehicleNo);
        formData.append("materialInfo", materialInfo);
        formData.append("tableData", JSON.stringify(tableData));

        // Log and Append new fields
        console.log("Frontend Sending - GST:", gstNo, "CGST:", cgst, "SGST:", sgst);
        console.log("Frontend Sending - Company:", companyName, "Address:", address, "Mobile:", mobileNo);
        formData.append("gstNo", gstNo);
        formData.append("cgst", cgst);
        formData.append("sgst", sgst);
        formData.append("companyName", companyName);
        formData.append("address", address);
        formData.append("mobileNo", mobileNo);
        formData.append("totalAmount", totalAmount); // Append calculated total amount

        if (file) {
            formData.append("file", file);
        }

        if (photo) {
            formData.append("photo", photo);
        }

        try {
            const url = process.env.REACT_APP_BACKEND_URL;
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${url}/gsn/upload-data`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            console.log(response);
            alert("Details Submitted Successfully");
            resetForm();
        } catch (error) {
            alert("Error in uploading data");
            console.error('Error uploading data:', error);
            if (error.response) {
                 console.error('Error response:', error.response.data);
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
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setbackendData(res.data);
                console.log(backendData);
            } catch (err) {
                console.log(err);
            }
        };
        getData();
    }, []);

    useEffect(() => {
        const func = async () => {
            const filtered = backendData.filter(u => u.partyName.toLowerCase().includes(partyName.toLowerCase()));
            setfilteredBackend(filtered);
            if (filtered.length > 0) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        func();
    }, [partyName]);

    // useEffect for filtering company names
    useEffect(() => {
        if (companyName && companyName.length > 0) {
            // Filter unique companies based on input
            const uniqueCompanies = backendData.reduce((acc, current) => {
                if (current.companyName && current.companyName.toLowerCase().includes(companyName.toLowerCase())) {
                    // Add company only if it's not already in the accumulator
                    if (!acc.some(item => item.companyName.toLowerCase() === current.companyName.toLowerCase())) {
                        acc.push(current); // Store the whole object to retrieve details later
                    }
                }
                return acc;
            }, []);
            setFilteredCompanies(uniqueCompanies);
            setIsCompanyPopupVisible(true); // Show popup when filtering
        } else {
            setFilteredCompanies([]); // Clear suggestions if input is empty
            setIsCompanyPopupVisible(false); // Hide popup
        }
    }, [companyName, backendData]);

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
        setTotalAmount(finalTotal);

    }, [tableData, cgst, sgst]); // Recalculate when table data, cgst, or sgst changes

    const handleFocus = () => {
        setIsVisible(true);
    };

    const handleBlur = (event) => {
        setTimeout(() => setIsVisible(false), 1000);
    };

    const handleSelectParty = (party) => {
        setpartyName(party);
        setIsVisible(false);
    };

    // Handlers for Company Name suggestions
    const handleCompanyFocus = () => {
        if (companyName && filteredCompanies.length > 0) {
            setIsCompanyPopupVisible(true);
        }
    };

    const handleCompanyBlur = () => {
        // Delay hiding to allow click on suggestion
        setTimeout(() => setIsCompanyPopupVisible(false), 200);
    };

    const handleSelectCompany = (selectedCompanyData) => {
        console.log("Selected Company Data:", selectedCompanyData);
        setCompanyName(selectedCompanyData.companyName || "");
        setAddress(selectedCompanyData.address || "");
        setGstNo(selectedCompanyData.gstNo || "");
        setMobileNo(selectedCompanyData.mobileNo || "");
        setCgst(selectedCompanyData.cgst || "");
        setSgst(selectedCompanyData.sgst || "");
        setIsCompanyPopupVisible(false); // Hide popup after selection
    };

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
    `;

    return (
        <>
            <LogOutComponent />
            <div style={containerStyle}>
                <style>{globalStyles}</style>
                <div style={{ width: "90vw", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div id="nav"
                        style={{
                            width: "90%",
                            height: "30px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: 'center',
                            fontSize: "25px",
                            padding: '10px',
                            marginTop: "20px"
                        }}
                    >
                        <h2>GSN Details</h2>
                    </div>

                    <div style={{ width: "90vw", maxWidth: '700px' }}>
                        <form action="" onSubmit={submitHandler} style={{ margin: '40px', width: "100%" }}>
                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>GRIN NO:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="number"
                                        value={grinNo}
                                        onChange={(e) => setGrinNo(e.target.value)}
                                    />
                                    <input
                                        required
                                        className={styles.dateInput}
                                        style={{ margin: "10px", maxWidth: "500px" }}
                                        type="date"
                                        value={grinDate}
                                        onChange={(e) => setGrinDate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>GSN:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="text"
                                        value={gsn}
                                        onChange={(e) => setGsn(e.target.value)}
                                    />
                                    <input
                                        required
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ margin: "10px" }}
                                        value={gsnDate}
                                        onChange={(e) => setGsnDate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>P.O. NO:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="text"
                                        value={poNo}
                                        onChange={(e) => setPoNo(e.target.value)}
                                    />
                                    <input
                                        required
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ margin: "10px" }}
                                        value={poDate}
                                        onChange={(e) => setPoDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.form}>
                                <div className={styles.formRow} style={{ position: "relative" }}>
                                    <label className={styles.label}>Party Name:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        style={{ marginLeft: '5px' }}
                                        type="text"
                                        value={partyName}
                                        onFocus={handleFocus}
                                        onBlur={(event) => handleBlur(event)}
                                        onChange={(e) => setpartyName(e.target.value)}
                                    />
                                    <div
                                        className='popUp'
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
                                            opacity: isVisible ? 1 : 0
                                        }}
                                    >
                                        <ul style={{ listStyle: 'none' }}>
                                            {filteredbackend.map((u, _id) => (
                                                <li key={u._id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectParty(u.partyName)
                                                    }}
                                                    style={{ cursor: "pointer" }}
                                                >{u.partyName}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <input type="text" className={`${styles.dateInput} ${styles.dummy}`} style={{ visibility: "hidden" }} />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Party Invoice No:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="text"
                                        style={{ marginLeft: '4px', }}
                                        value={innoviceno}
                                        onChange={(e) => setInnoviceno(e.target.value)}
                                    />
                                    <input
                                        required
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ marginTop: "25px" }}
                                        value={innoviceDate}
                                        onChange={(e) => setInnoviceDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.form}>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>L.R. No:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        style={{ marginBottom: "20px" }}
                                        type="text"
                                        value={lrNo}
                                        onChange={(e) => setLrNo(e.target.value)}
                                    />
                                    <input
                                        required
                                        className={styles.dateInput}
                                        type="date"
                                        style={{ marginTop: "30px" }}
                                        value={lrDate}
                                        onChange={(e) => setLrDate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Name of Transporter:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="text"
                                        value={transName}
                                        onChange={(e) => setTransName(e.target.value)}
                                    />
                                    <input type="text" className={`${styles.dateInput} ${styles.dummy}`} style={{ visibility: "hidden" }} />
                                </div>

                                <div className={styles.formRow}>
                                    <label className={styles.label}>Vehicle No:</label>
                                    <input
                                        required
                                        className={styles.input}
                                        type="text"
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value)}
                                    />
                                    <input type="text" className={`${styles.dateInput} ${styles.dummy}`} style={{ visibility: "hidden" }} />
                                </div>
                            </div>

                            <div className={styles.forms}>
                                <div className={styles.formRow} style={{ dissplay: "flex", flexDirection: 'column' }}>
                                    <label className={styles.label}>Material Information:</label>
                                    <TableComponent data={tableData} handleTableChange={handleTableChange} />
                                </div>
                            </div>

                            <div className={style.form} style={{backgroundColor:"rgba(218, 216, 224, 0.6)" }}>
                                <div className={style.formRow}>
                                    <label className={style.label}>Upload Bill (Optional):</label>
                                    <label className={style.custom} htmlFor="file-upload">
                                        {file ? `${file.name}` : 'Select Bill File'}
                                    </label>
                                    <input
                                        id='file-upload'
                                        className={style.fileInput}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                
                                <div className={style.formRow}>
                                    <label className={style.label}>Upload Photo (Optional):</label>
                                    <label className={style.custom} htmlFor="photo-upload">
                                        {photo ? `${photo.name}` : 'Select Photo'}
                                    </label>
                                    <input
                                        id='photo-upload'
                                        className={style.fileInput} 
                                        type="file"
                                        accept="image/jpeg, image/png, image/jpg, .pdf"
                                        onChange={handlePhotoChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className={styles.form}>
                                <div className={styles.formRow} style={{ position: "relative" }}>
                                    <label className={styles.label}>Company Name:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        onFocus={handleCompanyFocus}
                                        onBlur={handleCompanyBlur}
                                    />
                                    <div
                                        className='companyPopUp'
                                        ref={companyPopupRef}
                                        style={{
                                            display: isCompanyPopupVisible && filteredCompanies.length > 0 ? 'block' : 'none',
                                            position: 'absolute',
                                            zIndex: '1000',
                                            top: '100%',
                                            left: '0',
                                            width: 'calc(100% - 2px)',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#ffffff',
                                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                            borderRadius: '8px',
                                            padding: '10px',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                            {filteredCompanies.map((compData) => (
                                                <li key={compData._id}
                                                    onClick={() => handleSelectCompany(compData)}
                                                    style={{ cursor: "pointer", padding: "8px 5px", borderBottom: "1px solid #eee" }}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                >
                                                    {compData.companyName}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Address:</label>
                                    <textarea
                                        className={styles.input}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows={3}
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
                                        type="tel"
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
                                <div className={styles.formRow}>
                                    <label className={styles.label}>Total Amount:</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={totalAmount.toFixed(2)}
                                        readOnly
                                        style={{ fontWeight: 'bold', backgroundColor: '#e9ecef' }}
                                    />
                                </div>
                            </div>

                            <div id="btn">
                                <button style={{ width: "100%" }} className={style.button} id={styles.btn}>Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}