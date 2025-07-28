import React, { useRef } from 'react';
import styles from '../../styles/Common/Testimonials.module.css';

import Arrowback from '../../assets/arrowback.png';
import Arrowforward from '../../assets/arrowforward.png';
import Farmer_1 from '../../assets/farmer1.jpg';
import Farmer_2 from '../../assets/farmer2.jpg';
import Farmer_3 from '../../assets/farmer3.jpg';
import Farmer_4 from '../../assets/farmer4.jpg';

const Testimonials = () => {
  const slider = useRef();
  let tx = 0;

  const slideForward = () => {
    if (tx > -50) {
      tx -= 25;
    }
    slider.current.style.transform = `translateX(${tx}%)`;
  };

  const slideBackward = () => {
    if (tx < 0) {
      tx += 25;
    }
    slider.current.style.transform = `translateX(${tx}%)`;
  };

  return (
    <div id="testimonials" className={styles.teatimonials}>
      <img src={Arrowforward} alt="" className={styles['next-btn']} onClick={slideForward} />
      <img src={Arrowback} alt="" className={styles['back-btn']} onClick={slideBackward} />
      <div className={styles.slider}>
        <ul ref={slider}>
          <li>
            <div className={styles.slide}>
              <div className={styles['user-info']}>
                <img src={Farmer_1} alt="" />
                <div>
                  <h3>Mohammad Jaber</h3>
                  <span>Hebron</span>
                </div>
              </div>
              <p>"The accuracy of the diagnosis surprised me — great job!"</p>
            </div>
          </li>
          <li>
            <div className={styles.slide}>
              <div className={styles['user-info']}>
                <img src={Farmer_2} alt="" />
                <div>
                  <h3>Reem Abu Sa’da</h3>
                  <span>Gaza</span>
                </div>
              </div>
              <p>"The website helped me quickly identify a disease in my farm <br /> and the recommendations were accurate."</p>
            </div>
          </li>
          <li>
            <div className={styles.slide}>
              <div className={styles['user-info']}>
                <img src={Farmer_3} alt="" />
                <div>
                  <h3>Ahmad Al-Khatib</h3>
                  <span>Tulkarm</span>
                </div>
              </div>
              <p>"An excellent idea! It saved me <br /> time and effort in diagnosing my plant’s condition."</p>
            </div>
          </li>
          <li>
            <div className={styles.slide}>
              <div className={styles['user-info']}>
                <img src={Farmer_4} alt="" />
                <div>
                  <h3>Ali Shreim</h3>
                  <span>Jenin</span>
                </div>
              </div>
              <p>"I hope you develop a mobile version too <br /> but overall the idea is great and the experience was excellent."</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Testimonials;
