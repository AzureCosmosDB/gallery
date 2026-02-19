import React, { useState } from "react";
import { Button } from "@fluentui/react-components";
import { shareFeedbackHandler } from "../../utils/githubUtils";
import styles from "./styles.module.css";
import NewsletterDialog from "src/theme/NavbarItem/NewsletterDialog";

// eslint-disable-next-line import/no-unused-modules
export default function FloatingFeedbackButton(): JSX.Element {
  const [open, setOpen] = useState(false);
  const handleClick = shareFeedbackHandler();

  return (
    <>
      <Button
        appearance="secondary"
        size="large"
        className={styles.floatingButton}
        onClick={handleClick}
      >
        Share Feedback
      </Button>
      <NewsletterDialog open={open} setOpen={setOpen} />
    </>
  );
}
