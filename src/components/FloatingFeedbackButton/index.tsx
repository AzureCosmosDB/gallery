import React, { useState } from "react";
import { Button } from "@fluentui/react-components";
import NewsletterDialog from "@site/src/theme/NavbarItem/NewsletterDialog";
import styles from "./styles.module.css";

export default function FloatingFeedbackButton(): JSX.Element {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    // Button is disabled; do not open dialog
  };

  return (
    <>
      <Button
        appearance="secondary"
        size="large"
        className={styles.floatingButton}
        onClick={handleClick}
        disabled
      >
        Share Feedback
      </Button>
      <NewsletterDialog open={open} setOpen={setOpen} />
    </>
  );
}

