import React, { useState } from 'react';
import styles from './LoginCard.module.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useUser } from '../../Usercontext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { RxWidth } from 'react-icons/rx';

export default function LoginCard({ value, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { role } = useUser();
  const navigate = useNavigate();
console.log(role)

  const handleLogin = async (e) => {
    console.log(role);
    e.preventDefault();
    try {
      const url = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.post(`${url}/log-in/${role}`, {
        username,
        password,
      });

      if (response.data.token) {
        alert(`You are Logged In`);
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userRole", role);

        switch (role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'attendee':
            navigate('/attendee-dashboard');
            break;
          case 'purchasemanager':
            navigate('/purchasemanager-dashboard');
            break;
          case 'storemanager':
            navigate('/storemanager-dashboard');
            break;
          case 'generalmanager':
            navigate('/generalmanager-dashboard');
            break;
          case 'auditor':
            navigate('/auditor-dashboard');
            break;
          case 'accountmanager':
            navigate('/accountmanager-dashboard');
            break;
          case 'GSN':
            navigate('/gsn-dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred. Please try again.";
      alert(errorMessage);
      console.error('Error during login', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.outer}>
      
      <Form style={{
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center"
      }}  onSubmit={handleLogin} className={styles['form-container']}>
      <h2 >{value}</h2>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          {/* <Form.Label>Username</Form.Label> */}
          <Form.Control
            required
            style={{
              width: '90%',
    padding: '10px 15px',
    fontSize: '1.2rem',
    border: 'none',
    borderRadius: '18px',
    outline: 'none',
    backgroundColor: 'rgba(248, 235, 235, 0.1)',
    color: '#fff',
    caretColor: '#fff',
    transition: 'background-color 0.3s ease',
            }}
            autoComplete="off"
            className={styles['input-field']}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword" style={{ position: 'relative' }}>
          {/* <Form.Label>Password</Form.Label> */}
          <Form.Control
            required
            style={{
              width: '90%',
    padding: '10px 15px',
    fontSize: '1.2rem',
    border: 'none',
    borderRadius: '18px',
    outline: 'none',
    backgroundColor: 'rgba(248, 235, 235, 0.1)',
    color: '#fff',
    caretColor: '#fff',
    transition: 'background-color 0.3s ease',
            }}
            autoComplete="off"
            className={styles['input-field']}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <span onClick={togglePasswordVisibility} className={styles['password-toggle']}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </Form.Group>

        <Button className={styles['login-button']} type="submit">
          Login
        </Button>
      </Form>
    </div>
  );
}
