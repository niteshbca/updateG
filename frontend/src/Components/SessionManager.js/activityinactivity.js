import { useEffect, useCallback } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const SessionManager = () => {
  const navigate = useNavigate();

  // Token validity check
  const checkTokenValidity = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/'); // Redirect to login
      }
    }
  };

  useEffect(() => {
    checkTokenValidity();
    const intervalId = setInterval(() => {
      checkTokenValidity();
    }, 60000); // Check token every minute

    return () => clearInterval(intervalId); // Cleanup interval
  }, [navigate]);

  // Logout function due to inactivity
  const logOutUser = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/'); // Redirect to login
  }, [navigate]);

  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      clearTimeout(logoutTimer); // Clear existing timer
      logoutTimer = setTimeout(logOutUser, 300000); // 2 minutes = 120000 ms
    };

    const activityEvents = ['mousemove', 'mousedown','mouseup',  'keypress','keydown', 'keyup', 'scroll', 'touchstart','touchmove','touchend', 'wheel','resize',];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Start the initial timer when component mounts

    return () => {
      clearTimeout(logoutTimer); // Cleanup timer
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [logOutUser]);

  return null; // No UI needed, just logic
};

export default SessionManager;
