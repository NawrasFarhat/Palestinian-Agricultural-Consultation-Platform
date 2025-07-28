import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/Common/Hero.module.css';

const Hero = () => {
  return (
    <div id='hero' className={`${styles.hero} ${styles.container}`}>
      <div className={styles['hero-text']}>
        <h1>Keep Your Plants Thriving!</h1>
        <p>
          Welcome to our plant disease diagnosis platform,<br />
          where we offer a unique experience powered by an interactive chatbot.<br />
          Our smart assistant asks targeted questions to accurately assess the health of your crops,<br />
          ensuring a fast and reliable diagnosis that helps you protect your plants with confidence.
        </p>
        <Link to="/chatbot">
          <button className={styles.btn}>Protect Your Plant</button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
