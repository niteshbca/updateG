import React, { useEffect, } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Home.module.css';
import { useUser } from '../../Usercontext';

export default function Home() {
  const { setRole } = useUser();
  // const [isLoggedin, setIsloggedin] = useState(false);

  const handleclick = (role) => {
    setRole(role);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // setIsloggedin(true);
    }
  }, []);
const style = {
  button: {
    backgroundColor: 'rgba(218, 216, 224, 0.8)',
    border: 'none',
    borderRadius: '28px',
    color: 'black',
    fontSize: '20px',
    fontFamily: `'Poppins', sans-serif`,
    fontWeight: 'normal',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#ff5722',
    transform: 'scale(1.05)',
  }
}
  return (
    <div className={styles.outerContainer}>
      <video autoPlay muted loop className={styles.videoBackground}>
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div><h1 style={{color:'#fff',fontSize:'46px'}}>LogIn as</h1></div>
      <div className={styles.innerContainer}>
        <NavLink to='/admin/log-in'><button style={style.button}  onClick={() => { handleclick('admin') }}>Admin</button></NavLink>
        
        <NavLink to='/gsn/log-in'><button style={style.button} onClick={() => { handleclick('GSN') }}>GSN</button></NavLink>
        <NavLink to='/attendee/log-in'><button style={style.button} onClick={() => { handleclick('attendee') }}>GRIN</button></NavLink>

        
    
        <NavLink to='/purchasemanager/log-in'>
          <button style={style.button} onClick={() => { handleclick('purchasemanager') }}>Purchase Manager</button>
        </NavLink>
        <NavLink to='/storemanager/log-in'>
          <button style={style.button} onClick={() => { handleclick('storemanager') }}>Store Manager</button>
        </NavLink>
        <NavLink to='/generalmanager/log-in'>
          <button style={style.button} onClick={() => { handleclick('generalmanager') }}>General Manager</button>
        </NavLink>
        <NavLink to='/auditor/log-in'>
          <button style={style.button} onClick={() => { handleclick('auditor') }}>Auditor</button>
        </NavLink>
        <NavLink to='/accountmanager/log-in'>
          <button style={style.button} onClick={() => { handleclick('accountmanager') }}>Accountant</button>
        </NavLink>
      </div>
    </div>
  );
}

