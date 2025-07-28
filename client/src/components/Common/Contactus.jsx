import React from "react";
import styles from "../../styles/Common/Contactus.module.css";

const Contactus = () => {
  return (
    <div id="contact" className={styles["contact-us"]}>
      <div className={styles["contact-card"]}>
        <p><strong>📍 Address:</strong> Qabatiya, Jenin Governorate, Palestine</p>
        <p><strong>📞 Phone:</strong> 04-2514457</p>
        <p><strong>📱 Mobile:</strong> +972-562-114-114</p>
        <p>
          <strong>🔗 Facebook:</strong>{" "}
          <a href="https://www.facebook.com/palnarc/" target="_blank" rel="noopener noreferrer">
            Palestinian National Agricultural Research Center
          </a>
        </p>
      </div>
    </div>
  );
}

export default Contactus;
