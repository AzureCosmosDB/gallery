import React from "react";
import {
  useThemeConfig,
  ErrorCauseBoundary,
  useColorMode,
} from "@docusaurus/theme-common";
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from "@docusaurus/theme-common/internal";
import NavbarItem from "@theme/NavbarItem";
import NavbarColorModeToggle from "@theme/Navbar/ColorModeToggle";
import SearchBar from "@theme/SearchBar";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import NavbarLogo from "@theme/Navbar/Logo";
import NavbarSearch from "@theme/Navbar/Search";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";

// Smooth scroll to section by id
function scrollToSection(e, hash) {
  if (hash && hash.startsWith("#")) {
    e.preventDefault();
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // Helper to handle click and set active section
  const handleMenuClick = (e, hash) => {
    scrollToSection(e, hash);
    setActiveSection(hash.replace("#", ""));
  };

  // Always scroll to resource library for dropdown links
  const handleDropdownClick = (e, tagHash) => {
    scrollToSection(e, "#resource-library");
    setActiveSection(tagHash.replace("#", ""));
  };

  return (
    <NavbarContentLayout
      left={
        <>
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
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
            Learning paths
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
            </div>
          </div>
          <Link
            to="#quick-links"
            className={`${styles.menuItem} ${
              activeSection === "quick-links" ? styles.activeMenuItem : ""
            }`}
            onClick={(e) => handleMenuClick(e, "#quick-links")}
          >
            Quick links
          </Link>
          <Link
            to="#community-support"
            className={`${styles.menuItem} ${
              activeSection === "community-support" ? styles.activeMenuItem : ""
            }`}
            onClick={(e) => handleMenuClick(e, "#community-support")}
          >
            Community & support
          </Link>
        </nav>
      }
      right={
        <>
          {/* <NavbarColorModeToggle className={styles.colorModeToggle} /> */}
          <NavbarItems items={rightItems} />
          {!searchBarItem && (
            <NavbarSearch>
              <SearchBar />
            </NavbarSearch>
          )}
        </>
      }
    />
  );
}
