import React, { useEffect, useState } from 'react';
import Styles from './Admin.module.css';
import Signup from '../../Components/Signup/Signup'; // Assuming you have a SignIn component
import axios from 'axios';
import LogOutComponent from '../LogOut/LogOutComponent';
import { FaTimes } from 'react-icons/fa'; // Import a close icon from react-icons

export default function Admin() {
  const [add, setadd] = useState('');
  const [users, setUsers] = useState(null);
  const [fetched, setFetched] = useState();
  const [managers, setManagers] = useState([]); // Initialize as empty array
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState('');
  const [list, setList] = useState('');
  const [reload, setReload] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hide = () => {
    setadd('');
    setIsModalOpen(false);
  };

  const handleClick = (fetchEndpoint, listTitle) => {
    // Only fetch if the section is being opened or endpoint changes
    if (!show || fetched !== fetchEndpoint) {
        setFetched(fetchEndpoint);
        setShow(true); // Ensure list is shown when clicking members
        setList(listTitle);
    } else {
        setShow(false); // Hide if clicking the same section again
        setFetched(null); // Clear fetched endpoint
    }
  };

  useEffect(() => {
    const getAllData = async () => {
      if (!fetched) { // Only fetch if 'fetched' endpoint is set
          setManagers([]); // Clear managers if no endpoint selected
          return;
      }
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("No auth token found");
            // Handle missing token, maybe redirect to login
            return;
        }
        const url = process.env.REACT_APP_BACKEND_URL;
        console.log(`Fetching data from: ${url}${fetched}`); 
        const getData = await axios.get(`${url}${fetched}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log("Fetched Data:", getData.data);
        setManagers(getData.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response) {
            console.error("Error Response:", err.response.data);
            // Maybe show an error message to the user
        }
        setManagers([]); // Clear managers on error
      }
    };
    getAllData();
  }, [fetched, reload]); // Depend on fetched and reload

  const handleAdd = (signupEndpoint, rolePosition) => {
    setadd(signupEndpoint);
    setPosition(rolePosition);
    setIsModalOpen(true); 
  };

  const handleDelete = (_id, endpoint) => {
     if (!_id || !endpoint) {
         console.error("Missing ID or endpoint for deletion");
         return;
     }
     // Confirmation dialog
     if (!window.confirm(`Are you sure you want to delete user ${_id}?`)) {
        return;
     }

    const postDelete = async () => {
      try {
        const token = localStorage.getItem('authToken');
         if (!token) {
            console.error("No auth token found for delete");
            return;
        }
        const url = process.env.REACT_APP_BACKEND_URL;
        console.log(`Attempting to delete: ${url}${endpoint}/delete/${_id}`);
        await axios.delete(`${url}${endpoint}/delete/${_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        alert('User deleted successfully!');
        setReload((prev) => !prev); // Trigger data refetch
      } catch (err) {
        console.error("Error deleting user:", err);
        if (err.response) {
            console.error("Delete Error Response:", err.response.data);
             alert(`Error deleting user: ${err.response.data.message || 'Server error'}`);
        } else {
             alert('Error deleting user. Network error or server unavailable.');
        }
      }
    };
    postDelete();
  };

  // Helper to create manager sections
  const renderManagerSection = (name, role, signupPath, getAllPath) => (
          <div
            className={Styles.admin}
            style={{
              backgroundColor: 'rgba(218, 216, 224, 0.6)',
              borderRadius: '10px',
              padding: '15px',
              margin: '10px 0',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
        <div className={Styles.name}>{name}</div>
            <div className={Styles.right}>
              <div
                className={Styles.rightOne}
            onClick={() => handleAdd(signupPath, role)}
                style={{
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '15px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  color: 'black',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor =  'rgba(255, 255, 255, 0.8)')}
              >
                Add
              </div>
              <div
                className={Styles.rightSecond}
            onClick={() => handleClick(getAllPath, name)}
                style={{
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '15px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  color: 'black',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#218838')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor =  'rgba(255, 255, 255, 0.8)')}
              >
                Members
              </div>
            </div>
          </div>
  );

  return (
    <div>
      <div className={Styles.gradientBackground} >
        <LogOutComponent />
        <h1 style={{ textAlign: 'center', margin: '15px', color: '#2c3e50' }}>Admin DashBoard</h1>
        <div
          className={Styles.outerContainer}
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
          >
          {/* Render existing manager sections using the helper */}
          {renderManagerSection('Admin', 'Admin', '/sign-up/admin', '/getAll/admin')}
          {renderManagerSection('GSN', 'gsn', '/sign-up/gsn', '/getAll/gsn')}
          {renderManagerSection('GRIN', 'GRIN', '/sign-up/attendee', '/getAll/attendee')}
          {renderManagerSection('Purchase Manager', 'Purchase Manager', '/sign-up/purchasemanager', '/getAll/purchasemanager')}
          {renderManagerSection('Store Manager', 'Store Manager', '/sign-up/storemanager', '/getAll/storemanager')}
          {renderManagerSection('General Manager', 'General Manager', '/sign-up/generalmanager', '/getAll/generalmanager')}
         
          {/* **** ADDED: Auditor Section **** */}
          {renderManagerSection('Auditor', 'Auditor', '/sign-up/auditor', '/getAll/auditor')}
          {/* **** END ADDED **** */}

          {/* Render Account Manager Section */} 
          {renderManagerSection('Account Manager', 'Account Manager', '/sign-up/accountmanager', '/getAll/accountmanager')}
          
          {/* List of Members (conditional rendering) */}
          <div className="list" style={{ 
              display: show ? 'block' : 'none', 
              width: '90%', 
              maxWidth: '800px', 
              marginTop: '20px', 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              padding: '15px',
              borderRadius: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                 <h3 style={{ color: 'black', margin: 0 }}>{list} Members</h3>
                 <FaTimes 
                    style={{ cursor: 'pointer', fontSize: '20px' }} 
                    onClick={() => setShow(false)} // Close button for the list
                />
            </div>
            {managers.length > 0 ? (
                <ol style={{ listStyleType: 'decimal', paddingLeft: '20px', margin: 0 }}>
              {managers.map((u, index) => (
                <li
                  key={u._id}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    margin: '20px',
                    border: '1px solid #ccc',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9',
                    color: '#333',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e9ecef')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                >
                  <span>{index + 1}.</span>
                    <span>Name: {u.name ?? 'N/A'}</span> 
                    <span>Username: {u.username ?? 'N/A'}</span>
                  <img
                        style={{ height: '25px', cursor: 'pointer', marginLeft: 'auto' }}
                    src="/delete.png"
                        alt="Delete User"
                        onClick={() => handleDelete(u._id, fetched)}
                  />
                </li>
              ))}
            </ol>
            ) : (
                 <p style={{ textAlign: 'center', color: '#555' }}>No members found for {list}.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Signup Form */}
      {isModalOpen && (
        <div style={{
            position: 'fixed',
            top: '0%',
            left: '0%',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
          <div style={{
              backgroundColor: 'rgba(218, 216, 224, 0.6)',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '400px',
              position: 'relative',
          }}>
            <FaTimes
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                cursor: 'pointer',
                fontSize: '20px',
              }}
              onClick={() => setIsModalOpen(false)}
            />
            <Signup toadd={add} hide={hide} position={position} />
          </div>
        </div>
      )}
    </div>
  );
}