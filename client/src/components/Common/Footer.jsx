import React from 'react';
import styles from '../../styles/Common/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles["footer-content"]}>
        <p>© 2025 Smart Agri Diagnosis. All rights reserved.</p>
        <p>Made by the team</p>
      </div>
    </footer>
  );
}

export default Footer;
