/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { Title3, Display, Title2, Button } from "@fluentui/react-components";
import { BookOpen, Library, Users } from "lucide-react";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";

const title = "Application Developer Hub";
const description =
  "Discover comprehensive resources, learning paths, and community support to accelerate your PostgreSQL development journey on Azure.";
const subDescription = "for Azure PostgreSQL";

export default function ShowcaseCoverPage() {
  const bgUrl = useBaseUrl("/img/dotted-background-opacity40.png");
  // Scroll to resource library section
  const scrollToResourceLibrary = (e) => {
    e.preventDefault();
    const el = document.getElementById("resource-library");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={styles.coverPageContainer}>
      <div
        className={styles.coverPageAreaContainer}
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <div className={styles.coverPageArea}>
          <div className={styles.titleSection}>
            <Display style={{ fontSize: "64px", fontWeight: 700 }}>
              {title}
            </Display>
            <Title3 className={styles.greyText}>{subDescription}</Title3>
            <Title3 className={styles.centeredDescription}>
              {description}
            </Title3>
            {/* Cards Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 32,
                margin: "32px 0",
              }}
            >
              {/* Card 1 */}
              <div className={`${styles.cardCommon} ${styles.cardBlue}`}>
                <div className={styles.cardIconWrapper}>
                  <BookOpen size={40} style={{ color: "#0078d4" }} />
                </div>
                <span className={styles.cardTitle}>Learning pathways</span>
                <span className={styles.cardDesc}>
                  Structured learning paths from beginner to advanced
                </span>
              </div>
              {/* Card 2 */}
              <div className={`${styles.cardCommon} ${styles.cardGreen}`}>
                <div className={styles.cardIconWrapper}>
                  <Library size={40} style={{ color: "#157f15" }} />
                </div>
                <span className={styles.cardTitle}>Resource library</span>
                <span className={styles.cardLinks}>
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={scrollToResourceLibrary}
                  >
                    Trainings
                  </a>{" "}
                  |
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={scrollToResourceLibrary}
                  >
                    Documentation
                  </a>{" "}
                  |
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={scrollToResourceLibrary}
                  >
                    Samples
                  </a>{" "}
                  |
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={scrollToResourceLibrary}
                  >
                    Blogs
                  </a>{" "}
                  |
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={scrollToResourceLibrary}
                  >
                    Videos
                  </a>{" "}
                  |
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={scrollToResourceLibrary}
                  >
                    Solution Accelerators
                  </a>
                </span>
              </div>
              {/* Card 3 */}
              <div className={`${styles.cardCommon} ${styles.cardPurple}`}>
                <div className={styles.cardIconWrapper}>
                  <Users size={40} style={{ color: "#5c2d91" }} />
                </div>
                <span className={styles.cardTitle}>Community & support</span>
                <span className={styles.cardDesc}>
                  Connect with developers and get expert help
                </span>
              </div>
            </div>
          </div>
          {/* <div className={styles.subtitleSection}>
            <Title1>{subtitle}</Title1>
            <ShowcaseCards filteredUsers={featuredUsers} coverPage={true} />
          </div> */}
        </div>
      </div>
    </div>
  );
}
