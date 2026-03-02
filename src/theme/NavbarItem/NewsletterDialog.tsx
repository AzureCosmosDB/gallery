import React, { useState } from "react";
import { isValidEmail } from "./utils/email";
import {
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  Input,
} from "@fluentui/react-components";
import style from "./styles.module.css";

export default function NewsletterDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubscribe() {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setOpen(false);
    // Here you can add your subscribe logic
  }

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogSurface className={style.newsletterDialogSurface}>
        <DialogBody className={style.newsletterDialogBody}>
          <DialogTitle className={style.newsletterDialogTitle}>
            Subscribe to our Newsletter
          </DialogTitle>
          <DialogContent>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
              }}
            >
              <label
                htmlFor="newsletter-email"
                style={{
                  width: "100%",
                  fontWeight: 500,
                  marginBottom: "0.25rem",
                  display: "block",
                }}
              >
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={style.newsletterInput}
              />
              {error && (
                <span
                  style={{
                    color: "#d13438",
                    fontSize: "0.95rem",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  {error}
                </span>
              )}
              <div className={style.newsletterBulletsSection}>
                <div style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
                  What you'll receive:
                </div>
                <ul
                  style={{
                    textAlign: "left",
                    margin: 0,
                    paddingLeft: "1.2rem",
                    fontSize: "1rem",
                  }}
                >
                  <li>Weekly PostgreSQL tips and best practices</li>
                  <li>New feature announcements and updates</li>
                  <li>Exclusive tutorials and guides</li>
                  <li>Community events and webinar invitations</li>
                </ul>
              </div>
            </div>
          </DialogContent>
          <div className={style.newsletterActions}>
            <Button
              appearance="secondary"
              className={`${style.button} ${style.newsletterButton}`}
              onClick={handleSubscribe}
            >
              Subscribe
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </div>
          <div className={style.newsletterDisclaimer}>
            By subscribing, you agree to receive marketing emails from
            Microsoft. You can unsubscribe at any time.
          </div>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
