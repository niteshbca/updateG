// import React from 'react'
// import {Navigate} from 'react-router-dom'

// const PrivateRoute=({children,allowedRole})=>{
//     const token =localStorage.getItem('authToken')
//     const userRole = localStorage.getItem('userRole')

//     if(!token||userRole!==allowedRole){
//         return <Navigate to='/' replace/>
//     }
//     return children
// }

// export default PrivateRoute





import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ allowedRole, children }) => {
  const userRole = localStorage.getItem('role'); // ✅ Check stored role

  if (!userRole) {
    return <Navigate to="/" />; // Not logged in
  }

  if (userRole !== allowedRole) {
    return <Navigate to="/" />; // Role mismatch
  }

  return children;
};

export default PrivateRoute;
