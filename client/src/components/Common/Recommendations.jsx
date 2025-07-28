import React from 'react';
import styles from '../../styles/Common/Recommendations.module.css';

import Recommendations_1 from '../../assets/sun plants.jpg';
import Recommendations_2 from '../../assets/water plants.jpg';
import Recommendations_3 from '../../assets/manage soil.jpg';
import Recommendations_4 from '../../assets/inspect crops.jpg';
import Recommendations_icon_1 from '../../assets/sun plants icon.png';
import Recommendations_icon_2 from '../../assets/water plants icon.png';
import Recommendations_icon_3 from '../../assets/manage soil icon.png';
import Recommendations_icon_4 from '../../assets/inspect crops icon.png';

const Recommendations = () => {
  return (
    <div id='recommendations' className={styles.Recommendations}>
      <div className={styles.Recommendation}>
        <img src={Recommendations_1} alt="" />
        <div className={styles.caption}>
          <img src={Recommendations_icon_1} alt="" />
          <p>
            Olive trees require full sun exposure for at least 6 hours a day<br />
            Make sure to plant them in open areas to ensure high productivity and better oil quality.
          </p>
        </div>
      </div>
      <div className={styles.Recommendation}>
        <img src={Recommendations_2} alt="" />
        <div className={styles.caption}>
          <img src={Recommendations_icon_2} alt="" />
          <p>
            Olive trees are drought-tolerant, but they need regular watering during the first 3 years after planting.<br />
            Once established, deep watering once every two weeks is usually sufficient, depending on soil type and climate.
          </p>
        </div>
      </div>
      <div className={styles.Recommendation}>
        <img src={Recommendations_3} alt="" />
        <div className={styles.caption}>
          <img src={Recommendations_icon_3} alt="" />
          <p>
            Regularly monitor the trees for signs of diseases or pests such as the olive fruit fly.<br />
            Frequent inspections allow for early intervention and reduced crop loss.
          </p>
        </div>
      </div>
      <div className={styles.Recommendation}>
        <img src={Recommendations_4} alt="" />
        <div className={styles.caption}>
          <img src={Recommendations_icon_4} alt="" />
          <p>
            Olive trees prefer well-drained soil.<br />
            Keep the soil balanced through regular testing, and enrich it with organic fertilizer to promote healthy growth and improve disease resistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
