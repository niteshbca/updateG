import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // ✅ Added Navigate
import SessionManager from './Components/SessionManager.js/activityinactivity';
import { UserProvider } from './Usercontext';
import LoginCard from './Components/Login/LoginCard';
import Home from './Pages/Home/Home';
import PrivateRoute from './Components/Login/private.route'; // ✅ Use this instead of redeclaring
import Attendee from './Pages/Attendee/Attendee';
import Generalmanager from './Pages/General.anager/Generalmanager';
import Purchasemanager from './Pages/PurchaseManager/Purchasemanager';
import Storemanager from './Pages/StoreManager/Storemanager';
import Accountant from './Pages/AccountantManager/Accountmanager';
import Admin from './Pages/Admin/Admin';
import AddUser from './Components/AdminContent/AddUser';
import ViewForm from './Components/AdminContent/ViewForm';
import Gsn from './Pages/Gsn/Gsn';
import GrinEntry from './Pages/Attendee/GrinEntry';
import EntriesTable from './Components/EntriesTable';
import Grn from './Components/AdminContent/Grn';
import ApprovalSample from './Components/Approval/ApprovalSample';
import InventoryView from './Pages/Inventory/InventoryView';

function App() {
  return (
    <UserProvider>
      <Router>
        <SessionManager />
        <Routes>
        <Route path="/en" element={<EntriesTable />} />
          <Route path="/" element={<Home />} />
          
          <Route path="/admin/log-in" element={<LoginCard value="Admin" />} />
          <Route path="/gsn/log-in" element={<LoginCard value="GSN" />} />
          <Route path="/attendee/log-in" element={<LoginCard value="GRIN" />} />
          <Route path="/accountmanager/log-in" element={<LoginCard value="Account Manager" />} />
          <Route path="/storemanager/log-in" element={<LoginCard value="Store Manager" />} />
          <Route path="/generalmanager/log-in" element={<LoginCard value="General Manager" />} />
          <Route path="/purchasemanager/log-in" element={<LoginCard value="Purchase Manager" />} />
          <Route path="/auditor/log-in" element={<LoginCard value="Auditor" />} />

          {/* Private Routes */}
          <Route path="/admin-dashboard" element={<PrivateRoute allowedRole="admin"><Admin /></PrivateRoute>} />
          <Route path="/purchasemanager-dashboard" element={<PrivateRoute allowedRole="purchasemanager"><Purchasemanager /></PrivateRoute>} />
          <Route path="/storemanager-dashboard" element={<PrivateRoute allowedRole="storemanager"><Storemanager /></PrivateRoute>} />
          <Route path="/generalmanager-dashboard" element={<PrivateRoute allowedRole="generalmanager"><Generalmanager /></PrivateRoute>} />
          <Route path="/accountmanager-dashboard" element={<PrivateRoute allowedRole="accountmanager"><Accountant /></PrivateRoute>} />
          <Route path="/auditor-dashboard" element={<PrivateRoute allowedRole="auditor"><ApprovalSample managerType="Auditor" /></PrivateRoute>} />
          <Route path="/attendee-dashboard" element={<PrivateRoute allowedRole="attendee"><GrinEntry /></PrivateRoute>} />
          <Route path="/gsn-dashboard" element={<PrivateRoute allowedRole="GSN"><Gsn /></PrivateRoute>} />
          <Route path="/grin-dashboard/entry" element={<PrivateRoute allowedRole="attendee"><Attendee /></PrivateRoute>} />
          <Route path="/view-user" element={<PrivateRoute allowedRole="admin"><AddUser /></PrivateRoute>} />
          <Route path="/view-form" element={<PrivateRoute allowedRole="admin"><ViewForm /></PrivateRoute>} />
          <Route path="/grn" element={<PrivateRoute allowedRole="admin"><Grn /></PrivateRoute>} />
          <Route path="/inventory-view" element={<PrivateRoute allowedRole="admin"><InventoryView /></PrivateRoute>} />
         

          {/* 404 Fallback Route */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
