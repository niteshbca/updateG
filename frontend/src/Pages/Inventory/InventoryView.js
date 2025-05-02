import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './InventoryView.module.css'; // Create this CSS module
import LogOutComponent from '../../Components/LogOut/LogOutComponent';
import TableRenderingComponent from '../../Components/Table/Table.rendering'; // Use the rendering table

export default function InventoryView() {
    const [inventoryData, setInventoryData] = useState([]);
    const [allTableData, setAllTableData] = useState([]); // State for combined table data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const url = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchInventoryData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${url}/gsn/getdata`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setInventoryData(response.data);
                console.log("Fetched Inventory Data:", response.data);

                // Combine all tableData into a single array
                const combinedData = response.data.reduce((acc, entry) => {
                    if (entry.tableData && Array.isArray(entry.tableData)) {
                        // Optionally add party information to each item if needed
                        const itemsWithParty = entry.tableData.map(item => ({
                           ...item,
                           partyName: entry.partyName || 'N/A', // Add party name to each item
                           gsn: entry.gsn || 'N/A', // Add gsn to each item
                           grinNo: entry.grinNo || 'N/A', // Add grinNo to each item
                           createdAt: entry.createdAt // Add entry date
                        }));
                        return acc.concat(itemsWithParty);
                    }
                    return acc;
                }, []);
                setAllTableData(combinedData);
                console.log("Combined Table Data:", combinedData);

            } catch (err) {
                console.error("Error fetching inventory data:", err);
                setError(err.response?.data?.message || "Failed to fetch inventory data.");
            } finally {
                setLoading(false);
            }
        };

        fetchInventoryData();
    }, [url]);

    // This formatDate function might not be needed here anymore unless TableRenderingComponent uses it
    // Or if you add a date column directly in this component's table rendering logic
    // const formatDate = (dateString) => {
    //     if (!dateString) return "N/A";
    //     const date = new Date(dateString);
    //     return date.toLocaleDateString('en-GB', { 
    //         day: '2-digit', 
    //         month: '2-digit', 
    //         year: 'numeric' 
    //     });
    // };

    return (
        <div className={styles.outerContainer}>
            <LogOutComponent />
            <h2 className={styles.title}>Inventory View (All GSN Material Items)</h2>

            {loading && <p className={styles.loading}>Loading inventory data...</p>}
            {error && <p className={styles.error}>Error: {error}</p>}

            {/* Display message if no items found after loading */}            
            {!loading && !error && allTableData.length === 0 && (
                <p className={styles.noData}>No inventory items found.</p>
            )}

            {/* Render the single table with all combined items */}            
            {!loading && !error && allTableData.length > 0 && (
                <div className={styles.tableContainer}> {/* Use table container style */}                   
                    <TableRenderingComponent tableData={allTableData} />
                </div>
            )}
        </div>
    );
} 