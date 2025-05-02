import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RxHamburgerMenu } from "react-icons/rx";

export default function LogOutComponent() {
  const [sidebar, setSidebar] = useState(true)
  const navigate = useNavigate();

  const handleClick = () => {
    setSidebar(!sidebar)
  }
  const handleLogOut = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    navigate('/')
  }

  return (
    <div
    
    >
      <div
        style={{
          width: "10vw",
          maxWidth: "200px",
          textAlign: 'center',
          minWidth: "130px",
          position: "fixed",
          top: "10px", left: "0px",
          padding: "10px",
          zIndex: '1000',
          backgroundColor: sidebar ? '' : 'blue',
          color: sidebar ? '' : 'white',
          display: "flex",
          justifyContent: "center",
          transform: sidebar ? 'translateX(-10px)' : 'translateX(0)',
          transition: 'transform 0.3s ease', // Specifies a smooth transition
        }}

        onClick={handleClick}
      ><RxHamburgerMenu />
      </div>
      <div
        style={{
          width: "10vw",
          minWidth: "130px",
          maxWidth: "200px",
          backgroundColor: "white",
          height: "100vh",      // Covers the full viewport height
          position: "fixed",    // Use fixed to keep it pinned to the viewport
          left: "0px",
          top: "0px",           // Start at the top of the viewport
          display: sidebar ? 'none' : 'block',
          overflow: "hidden",   // Prevents scrolling inside the div
          zIndex: "900",
          textAlign: "center",
          border: "1px solid #ccc",
          borderRadius: '4px'

        }}>
        <button style={{


          position: "relative",
          margin: " auto",
          color: "black",
          top: "50px",


        }}
          onClick={handleLogOut}
        >LogOut</button>

      </div>

    </div>
  )
}
