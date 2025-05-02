import React from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Admin.module.css'
import LogOutComponent from '../../Components/LogOut/LogOutComponent'

export default function Admin() {
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
      <LogOutComponent/>
    {/* <video autoPlay muted loop className={styles.videoBackground}>
      <source src="/video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video> */}
   
    <div className={styles.innerContainer}>
      <NavLink to='/view-user'><button style={style.button} >View Users</button></NavLink>
      <NavLink to='/view-form'><button style={style.button}>GSN OR GRIN Form</button></NavLink>
      <NavLink to='/inventory-view'><button style={style.button}>Inventory View</button></NavLink>
      
    </div>
  </div>
  )
}
