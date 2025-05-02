import React from 'react';
import styles from './Table.module.css'; // Ensure you have the necessary CSS module

const TableComponent = ({data,handleTableChange }) => {
    return (
        <table className={styles.table}style={{
            backgroundColor: 'rgba(218, 216, 224, 0.6)',
            borderRadius: '15px',
            }}>
            <thead>
                <tr>
                    <th style={{ width: '1%' }}>Sr. No.</th>
                    <th style={{ width: '25%' }}>Item</th>
                    <th style={{ width: '50%' }}>Description</th>
                    <th style={{ width: '7%' }}>Qnt. No.</th>
                    <th style={{ width: '7%' }}>Qnt. in Kgs</th>
                    <th style={{ width: '10%' }}>Price</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                            <textarea
                            style={{
                                width:"100%",
                                marginLeft:"0px",
                                backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                
                                // border:'1px solid '
                            }}
                                type="text"
                                value={row.item}
                                onChange={(e) => handleTableChange(index, 'item', e.target.value)}
                            />
                        </td>
                        <td>
                            <textarea style={{resize:"vertical",width:"100%", backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                }}
                                value={row.description}
                                onChange={(e) => handleTableChange(index, 'description', e.target.value)}
                                className={styles.textarea} // Apply CSS class for textarea styling
                            />
                        </td>
                        <td>
                            <input
                             style={{width:"100%",marginLeft:"0px", backgroundColor: 'rgba(218, 216, 224, 0.6)',
                             }}
                                type="number"
                                value={row.quantityNo}
                                onChange={(e) => handleTableChange(index, 'quantityNo', e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                             style={{ backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                width:"100%",marginLeft:"0px"}}
                                type="text"
                                value={row.quantityKg}
                                onChange={(e) => handleTableChange(index, 'quantityKg', e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                style={{ backgroundColor: 'rgba(218, 216, 224, 0.6)',
                                    width:"100%",marginLeft:"0px"}}
                                type="number"
                                step="0.01"
                                value={row.price}
                                onChange={(e) => handleTableChange(index, 'price', e.target.value)}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TableComponent;
