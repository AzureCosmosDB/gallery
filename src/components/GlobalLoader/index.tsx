import React from "react";
import { Loader2 } from "lucide-react";
import styles from "./GlobalLoader.module.css";

const GlobalLoader: React.FC = () => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderContainer}>
        <Loader2 className={styles.spinner} />
      </div>
    </div>
  );
};

export default GlobalLoader;
