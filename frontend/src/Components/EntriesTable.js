import React, { useEffect, useState } from "react";
import axios from "axios";

const EntriesTable = () => {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/entries")
            .then(response => {
                setEntries(response.data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }, []);

    return (
        <div className="container">
            <h2>Database Entries</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>GRIN No</th>
                        <th>GRIN Date</th>
                        <th>GSN</th>
                        <th>GSN Date</th>
                        <th>PO No</th>
                        <th>PO Date</th>
                        <th>Party Name</th>
                        <th>Invoice No</th>
                        <th>Invoice Date</th>
                        <th>LR No</th>
                        <th>LR Date</th>
                        <th>Transporter</th>
                        <th>Vehicle No</th>
                        <th>File</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.grinNo}</td>
                            <td>{new Date(entry.grinDate).toLocaleDateString()}</td>
                            <td>{entry.gsn}</td>
                            <td>{new Date(entry.gsnDate).toLocaleDateString()}</td>
                            <td>{entry.poNo}</td>
                            <td>{new Date(entry.poDate).toLocaleDateString()}</td>
                            <td>{entry.partyName}</td>
                            <td>{entry.innoviceno}</td>
                            <td>{new Date(entry.innoviceDate).toLocaleDateString()}</td>
                            <td>{entry.lrNo}</td>
                            <td>{new Date(entry.lrDate).toLocaleDateString()}</td>
                            <td>{entry.transName}</td>
                            <td>{entry.vehicleNo}</td>
                            <td>
                                <a href={`http://localhost:5000/${entry.file}`} target="_blank" rel="noopener noreferrer">
                                    View File
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EntriesTable;
