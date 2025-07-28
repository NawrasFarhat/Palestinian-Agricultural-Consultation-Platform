// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import logo from '../assets/logo.png';
import AuthService from '../services/AuthService';

const Navbar = ({ role, onLogout }) => {
  const [Sticky, SetSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      window.scrollY > 250 ? SetSticky(true) : SetSticky(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleItemClick = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    try {
      // Use provided onLogout handler if available, otherwise use AuthService
      if (onLogout) {
        onLogout();
      } else {
        AuthService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback logout
      AuthService.logout();
    }
  };

  const renderRoleSpecificItems = () => {
    if (role === 'manager') {
      return (
        <>
          <li onClick={handleItemClick}><Link to="/manager/dashboard">Dashboard</Link></li>
          <li onClick={handleItemClick}><Link to="/manager/diseases">View Diseases</Link></li>
          <li onClick={handleItemClick}><Link to="/manager/add-disease">Add Disease</Link></li>
          <li onClick={handleItemClick}><Link to="/manager/approvals">Pending Approvals</Link></li>
        </>
      );
    } else if (role === 'administrator' || role === 'it') {
      return (
        <>
          <li onClick={handleItemClick}><Link to="/admin/dashboard">Dashboard</Link></li>
          <li onClick={handleItemClick}><Link to="/admin/user-management">User Management</Link></li>
          <li onClick={handleItemClick}><Link to="/admin/database-management">Database Management</Link></li>
          <li onClick={handleItemClick}><Link to="/admin/system-monitoring">System Monitoring</Link></li>
        </>
      );
    } else if (role === 'engineer') {
      return (
        <>
          <li onClick={handleItemClick}><Link to="/engineer/dashboard">Dashboard</Link></li>
      
          <li onClick={handleItemClick}><Link to="/engineer/add-disease-form">Add Disease with Questions</Link></li>
        </>
      );
    }
    return null;
  };

  return (
    <nav className={`${styles.container} ${Sticky ? styles['dark-nav'] : ''}`}>
      <img className={styles.logoimg} src={logo} alt="Logo" />
      <div className={styles['menu-icon']} onClick={() => setMenuOpen(!menuOpen)}>
        &#9776;
      </div>

      <ul className={menuOpen ? styles.open : ''}>
        {/* ✅ العناصر العامة للمزارع أو الزائر */}
        {(!role || role === 'farmer') && (
          <>
            <li onClick={handleItemClick}><a href="#hero">Home</a></li>
            <li onClick={handleItemClick}><a href="#recommendations">Recommendations</a></li>
            <li onClick={handleItemClick}><a href="#testimonials">Testimonials</a></li>
            <li onClick={handleItemClick}><a href="#contact">Contact Us</a></li>
            <li onClick={handleItemClick}><Link to="/farmer/feedback">Feedback</Link></li>
          </>
        )}

        {/* ✅ العناصر الخاصة بالدور */}
        {renderRoleSpecificItems()}

        {/* ✅ زر الدخول أو الخروج */}
        {role ? (
          <li onClick={() => { handleLogout(); navigate("/"); }} className={styles["login-button"]}>
            <button>Logout</button>
          </li>
        ) : (
          <li onClick={handleItemClick} className={styles["login-button"]}>
            <Link to="/login"><button>Login</button></Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
