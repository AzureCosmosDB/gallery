import React from "react";
import { useThemeConfig, ErrorCauseBoundary } from "@docusaurus/theme-common";
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from "@docusaurus/theme-common/internal";
import { useHistory, useLocation } from "@docusaurus/router";
import NavbarItem from "@theme/NavbarItem";
import SearchBar from "@theme/SearchBar";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import NavbarLogo from "@theme/Navbar/Logo";
import NavbarSearch from "@theme/Navbar/Search";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";

// Smooth scroll to section by id with navbar offset
function scrollToSection(e, hash) {
  if (hash && hash.startsWith("#")) {
    e.preventDefault();
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      // Get navbar height to offset scroll position
      const navbar = document.querySelector(".navbar");
      const navbarHeight = navbar ? navbar.offsetHeight : 80; // fallback to 80px
      const elementPosition =
        el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight; // exact positioning at section start

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }
}
function useNavbarItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useThemeConfig().navbar.items;
}
function NavbarItems({ items }) {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary
          key={i}
          onError={(error) =>
            new Error(
              `A theme navbar item failed to render.
Please double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:
${JSON.stringify(item, null, 2)}`,
              { cause: error }
            )
          }
        >
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}
function NavbarContentLayout({ left, center, right }) {
  return (
    <div className={styles.navbarCustomInner}>
      <div className={styles.navbarLeft}>{left}</div>
      <div className={styles.navbarCenter}>{center}</div>
      <div className={styles.navbarRight}>{right}</div>
    </div>
  );
}
export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === "search");
  const [activeSection, setActiveSection] = React.useState("home");
  const history = useHistory();
  const location = useLocation();

  // Scroll listener to update active section based on scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'home',
        'learning-paths', 
        'resource-library',
        'quick-links',
        'community-support'
      ];
      
      const navbar = document.querySelector('.navbar');
      const navbarHeight = navbar ? navbar.offsetHeight : 80;
      const scrollPosition = window.scrollY + navbarHeight + 50; // Add some offset for better detection
      
      // Check if we've reached the bottom of the page (more accurate detection)
      const isAtBottom = Math.abs((window.innerHeight + window.scrollY) - document.documentElement.scrollHeight) < 5;
      
      let currentSection = 'home';
      
      // If at bottom, always set to community-support (last section)
      if (isAtBottom) {
        currentSection = 'community-support';
      } else {
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
            if (scrollPosition >= elementTop) {
              currentSection = sectionId;
            }
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Call once to set initial state
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Helper to handle click and set active section
  const handleMenuClick = (e, hash) => {
    scrollToSection(e, hash);
    setActiveSection(hash.replace("#", ""));
  };

  // Always scroll to resource library for dropdown links and apply filter
  const handleDropdownClick = (e, tagHash) => {
    e.preventDefault();

    // Map dropdown items to their corresponding tag filters (can be single tag or array of tags)
    const tagMapping = {
      "#documentation": ["documentation", "concepts", "how-to", "tutorial"], // Parent tag + all subtypes for documentation
      "#solution-accelerators": "solution-accelerator",
      "#workshops": "workshop",
      "#videos": "video",
      "#blogs": "blog",
      "#trainings": "training",
      "#samples": "samples",
    };

    const tagFilter = tagMapping[tagHash];

    if (tagFilter) {
      // Update URL with the tag filter(s)
      const params = new URLSearchParams();

      if (Array.isArray(tagFilter)) {
        // For multiple tags, join them with commas
        params.set("tags", tagFilter.join(","));
      } else {
        // For single tag
        params.set("tags", tagFilter);
      }

      // Use history to update the URL
      history.replace({
        pathname: location.pathname,
        search: `?${params.toString()}`,
      });

      // Scroll to resource library and switch to list view
      requestAnimationFrame(() => {
        const el = document.getElementById("resource-library");
        if (el) {
          const navbar = document.querySelector('.navbar');
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          // Note: Do not switch to list view for navbar dropdown links
        }
      });
    }

    setActiveSection(tagHash.replace("#", ""));
  };

  return (
    <NavbarContentLayout
      left={
        <>
          <NavbarLogo />
        </>
      }
      center={
        <nav className={styles.menuNav}>
          <Link
            to="#home"
            className={`${styles.menuItem} ${
              activeSection === "home" ? styles.activeMenuItem : ""
            }`}
            onClick={(e) => handleMenuClick(e, "#home")}
          >
            Home
          </Link>
          <Link
            to="#learning-paths"
            className={`${styles.menuItem} ${
              activeSection === "learning-paths" ? styles.activeMenuItem : ""
            }`}
            onClick={(e) => handleMenuClick(e, "#learning-paths")}
          >
            Pathways
          </Link>
          <div className={styles.menuItemDropdown}>
            <Link
              to="#resource-library"
              className={`${styles.menuItem} ${
                activeSection === "resource-library"
                  ? styles.activeMenuItem
                  : ""
              }`}
              onClick={(e) => handleMenuClick(e, "#resource-library")}
            >
              Resource Library
            </Link>
            <div className={styles.dropdownMenu}>
              <Link
                to="#documentation"
                className={`${styles.dropdownMenuItem} ${
                  activeSection === "documentation" ? styles.activeMenuItem : ""
                }`}
                onClick={(e) => handleDropdownClick(e, "#documentation")}
              >
                Documentation
              </Link>
              <Link
                to="#solution-accelerators"
                className={`${styles.dropdownMenuItem} ${
                  activeSection === "solution-accelerators"
                    ? styles.activeMenuItem
                    : ""
                }`}
                onClick={(e) =>
                  handleDropdownClick(e, "#solution-accelerators")
                }
              >
                Solution accelerators
              </Link>
              <Link
                to="#workshops"
                className={`${styles.dropdownMenuItem} ${
                  activeSection === "workshops" ? styles.activeMenuItem : ""
                }`}
                onClick={(e) => handleDropdownClick(e, "#workshops")}
              >
                Workshops
              </Link>
              <Link
                to="#videos"
                className={`${styles.dropdownMenuItem} ${
                  activeSection === "videos" ? styles.activeMenuItem : ""
                }`}
                onClick={(e) => handleDropdownClick(e, "#videos")}
              >
                Videos
              </Link>
              <Link
                to="#blogs"
                className={`${styles.dropdownMenuItem} ${
                  activeSection === "blogs" ? styles.activeMenuItem : ""
                }`}
                onClick={(e) => handleDropdownClick(e, "#blogs")}
              >
                Blogs
              </Link>
              <Link
                to="#trainings"
                className={`${styles.dropdownMenuItem} ${
                  activeSection === "trainings" ? styles.activeMenuItem : ""
                }`}
                onClick={(e) => handleDropdownClick(e, "#trainings")}
              >
                Trainings
              </Link>
              <Link
                to="#samples"
                className={`${styles.dropdownMenuItem} ${
                  activeSection === "samples" ? styles.activeMenuItem : ""
                }`}
                onClick={(e) => handleDropdownClick(e, "#samples")}
              >
                Samples
              </Link>
            </div>
          </div>
          <Link
            to="#quick-links"
            className={`${styles.menuItem} ${
              activeSection === "quick-links" ? styles.activeMenuItem : ""
            }`}
            onClick={(e) => handleMenuClick(e, "#quick-links")}
          >
            Quick Links
          </Link>
          <Link
            to="#community-support"
            className={`${styles.menuItem} ${
              activeSection === "community-support" ? styles.activeMenuItem : ""
            }`}
            onClick={(e) => handleMenuClick(e, "#community-support")}
          >
            Community & Support
          </Link>
        </nav>
      }
      right={
        <>
          <NavbarItems items={rightItems} />
          {!searchBarItem && (
            <NavbarSearch>
              <SearchBar />
            </NavbarSearch>
          )}
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
        </>
      }
    />
  );
}
