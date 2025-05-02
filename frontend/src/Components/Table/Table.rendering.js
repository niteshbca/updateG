// import React from 'react';
// import styles from './Table.module.css'; // Ensure you have the necessary CSS module

// const TableComponent = ({ tableData}) => {
   
//     return (
//         <table className={styles.table} style={{width:"100%",maxWidth:"100%" }}>
//             <thead >
//                 <tr >
//                     <th style={{ width: '1%' }}>Sr. No.</th>
//                     <th style={{ width: '40%' }}>Item</th>
//                     <th style={{ width: '50%' }}>Description</th>
//                     <th style={{ width: '5%' }}>Quantity No.</th>
//                     <th style={{ width: '5%' }}>Quantity in Kgs.</th>
//                 </tr>
//             </thead>
//             <tbody> 

//                 {tableData.map((row, index) => (
//                     <tr key={index}>
                       
//                         <td>{index+1}</td>
//                         <td >{row.item}</td>
//                         <td style={{maxWidth:"200px"}} >{row.description}</td>
//                         <td>{row.quantityNo}</td>
//                         <td>{row.quantityKg}</td>
//                     </tr>
//                 ))}
//             </tbody>
//         </table>
//     );
// };

// export default TableComponent;



import React from 'react';
import styles from './Table.module.css';

const TableComponent = ({ tableData }) => {
    return (
        <table className={styles.table} style={{ width: "100%", maxWidth: "100%" }}>
            <thead>
                <tr>
                    <th style={{ width: '1%' }}>Sr. No.</th>
                    <th style={{ width: '40%' }}>Item</th>
                    <th style={{ width: '50%' }}>Description</th>
                    <th style={{ width: '5%' }}>Quantity No.</th>
                    <th style={{ width: '5%' }}>Quantity in Kgs.</th>
                </tr>
            </thead>
            <tbody>
                {tableData
                    .filter(row => row.item || row.description || row.quantityNo || row.quantityKg) // filter rows with content
                    .map((row, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{row.item}</td>
                            <td style={{ maxWidth: "200px",overflow:"hidden" }}>{row.description}</td>
                            <td>{row.quantityNo}</td>
                            <td>{row.quantityKg}</td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};

export default TableComponent;
