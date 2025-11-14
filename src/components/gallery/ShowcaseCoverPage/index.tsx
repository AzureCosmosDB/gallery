/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { Title3, Display, Title2, Button } from "@fluentui/react-components";
import { BookOpen, Library, Users } from "lucide-react";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useHistory, useLocation } from "@docusaurus/router";

const title = "Application Developer Hub";
const description =
  "Discover comprehensive resources, learning paths, and community support to accelerate your PostgreSQL development journey on Azure.";
const subDescription = "for Azure PostgreSQL";

export default function ShowcaseCoverPage() {
  const bgUrl = useBaseUrl("/img-optimized/dotted-background-opacity40.png");
  const history = useHistory();
  const location = useLocation();

  // Scroll to resource library section with filtering
  const scrollToResourceLibrary = (e, tagFilters = []) => {
    e.preventDefault();

    const hasFilters = Array.isArray(tagFilters) && tagFilters.length > 0;

    // Build and update URL params
    const params = new URLSearchParams(location.search);
    if (hasFilters) {
      // Join multiple tags as comma-separated values
      params.set("tags", tagFilters.join(","));
    } else {
      // Remove the tag filter if empty
      params.delete("tags");
    }

    // Update the URL without reloading
    history.replace({
      pathname: location.pathname,
      search: params.toString() ? `?${params.toString()}` : "",
    });

    // Scroll to resource library and possibly switch to list view
    requestAnimationFrame(() => {
      const el = document.getElementById("resource-library");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (hasFilters) {
          // Dispatch custom event to switch to list view
          window.dispatchEvent(new Event("switchToListView"));
        }
      }
    });
  };

  return (
    <div className={styles.coverPageContainer}>
      <div
        className={styles.coverPageAreaContainer}
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <div className={styles.coverPageArea}>
          <div className={styles.titleSection}>
            <Display className={styles.heroTitle}>{title}</Display>
            <Title3 className={styles.greyText}>{subDescription}</Title3>
            <Title3 className={styles.centeredDescription}>
              {description}
            </Title3>
            {/* Cards Row */}
            <div className={styles.cardsRow}>
              {/* Card 1 */}
              <div className={`${styles.cardCommon} ${styles.cardBlueBorder}`}>
                <div className={styles.cardIconWrapper}>
                  <BookOpen size={40} style={{ color: "#0078d4" }} />
                </div>
                <span className={styles.cardTitle}>Learning Pathways</span>
                <span className={styles.cardDesc}>
                  Structured learning paths from beginner to advanced
                </span>
              </div>
              {/* Card 2 */}
              <div className={`${styles.cardCommon} ${styles.cardGreen}`}>
                <div className={styles.cardIconWrapper}>
                  <Library size={40} style={{ color: "#157f15" }} />
                </div>
                <span className={styles.cardTitle}>Resource Library</span>
                <span className={styles.cardLinks}>
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={(e) => scrollToResourceLibrary(e, ["training"])}
                  >
                    Trainings
                  </a>{" "}
                  |
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={(e) =>
                      scrollToResourceLibrary(e, ["concepts", "how-to"])
                    }
                  >
                    Documentation
                  </a>{" "}
                  |
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={(e) => scrollToResourceLibrary(e, ["samples"])}
                  >
                    Samples
                  </a>{" "}
                  |
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={(e) => scrollToResourceLibrary(e, ["blog"])}
                  >
                    Blogs
                  </a>{" "}
                  |
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={(e) => scrollToResourceLibrary(e, ["video"])}
                  >
                    Videos
                  </a>{" "}
                  |
                  <a
                    href="#resource-library"
                    className={styles.resourceLink}
                    onClick={(e) =>
                      scrollToResourceLibrary(e, ["solution-accelerator"])
                    }
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
                <span className={styles.cardTitle}>Community & Support</span>
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
