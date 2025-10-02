import React from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import styles from "./styles.module.css";
import { ArrowRight, Database, Bot, Layers } from "lucide-react";
import ShowcaseCards from "../../pages/ShowcaseCards";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { featuredUsers } from "../../data/users";
import siteConfig from "@generated/docusaurus.config";

export type LearningPath = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  level: string;
  duration: string;
  tags: string[];
};

function getDefaultPathsFromConfig(): LearningPath[] {
  const learningPathsSection = (
    siteConfig.customFields as { learningPathsSection?: { paths?: any[] } }
  )?.learningPathsSection;
  const configPaths = learningPathsSection?.paths;
  if (!Array.isArray(configPaths)) return [];
  return configPaths.map((p: any) => {
    let icon;
    switch (p.icon) {
      case "Database":
        icon = <Database size={28} color={p.iconColor || "#0078d4"} />;
        break;
      case "Bot":
        icon = <Bot size={28} color={p.iconColor || "#157f15"} />;
        break;
      case "Layers":
        icon = <Layers size={28} color={p.iconColor || "#5c2d91"} />;
        break;
      default:
        icon = null;
    }
    return {
      icon,
      title: p.title,
      description: p.description,
      level: p.level,
      duration: p.duration,
      tags: p.tags || [],
    };
  });
}

const defaultPaths: LearningPath[] = getDefaultPathsFromConfig();

export default function LearningPathsSection({
  paths = defaultPaths,
}: {
  paths?: LearningPath[];
}) {
  const history = useHistory();
  const location = useLocation();
  const onTileClick = (idx) => {
    let newSearch = "";
    if (idx === 0) {
      // Only set the filter for path 1
      const params = new URLSearchParams(location.search);
      params.set("tags", "developing-core-applications");
      newSearch = params.toString();
    } else if (idx === 1) {
      // Only set the filter for path 2
      const params = new URLSearchParams();
      params.set("tags", "building-genai-apps");
      newSearch = params.toString();
    } else if (idx === 2) {
      // Only set the filter for path 3
      const params = new URLSearchParams();
      params.set("tags", "building-ai-agents");
      newSearch = params.toString();
    }
    const scrollToGallery = () => {
      const el = document.getElementById("resource-library");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        // Dispatch custom event after scrolling
        window.dispatchEvent(new Event("switchToListView"));
      }
    };
    if (idx === 0 || idx === 1 || idx === 2) {
      history.replace({
        pathname: location.pathname,
        search: `?${newSearch}`,
      });

      requestAnimationFrame(() => {
        const el = document.getElementById("resource-library");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          // Dispatch custom event after scrolling
          window.dispatchEvent(new Event("switchToListView"));
        }
      });
    } else {
      scrollToGallery();
    }
  };
  return (
    <section className={styles.learningPathsSection}>
      <div className={styles.left}>
        <h2 className={styles.heading}>Learning pathways</h2>
        <div className={styles.sectionDesc}>
          Choose from structured learning paths designed to guide you through
          PostgreSQL development on Azure, from basic application development to
          advanced AI integration.
        </div>
        <div className={styles.tiles}>
          {paths.map((path, idx) => (
            <div
              className={styles.tile}
              key={idx}
              onClick={() => onTileClick(idx)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.icon}>{path.icon}</div>
              <div className={styles.tileContent}>
                <div className={styles.tileTitle}>{path.title}</div>
                <div className={styles.tileDesc}>{path.description}</div>
                <div className={styles.tagsRow}>
                  <span className={styles.levelChip}>{path.level}</span>
                  <span className={styles.durationChip}>{path.duration}</span>
                </div>
                <div className={styles.tags}>
                  {path.tags.map((tag, i) => (
                    <span className={styles.chip} key={i}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ArrowRight size={20} className={styles.arrow} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <h2 className={styles.heading}>Featured Resources</h2>
        <div className={styles.sectionDesc}>
          Discover our latest and most popular resources, including
          comprehensive guides, tutorials, and solution accelerators.
        </div>
        <Swiper
          spaceBetween={24}
          slidesPerView={1}
          style={{ width: 400, minWidth: 300, maxWidth: 420 }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          modules={[Autoplay]}
        >
          {featuredUsers.map((user, idx) => (
            <SwiperSlide key={idx}>
              <ShowcaseCards filteredUsers={[user]} coverPage={true} noGrid />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
