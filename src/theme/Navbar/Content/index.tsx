/* eslint-disable import/no-named-as-default-member */
import React from "react";
import { ErrorCauseBoundary } from "@docusaurus/theme-common";
import { splitNavbarItems, useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import { useHistory, useLocation } from "@docusaurus/router";
import NavbarItem from "@theme/NavbarItem";
import SearchBar from "@theme/SearchBar";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import NavbarLogo from "@theme/Navbar/Logo";
import NavbarSearch from "@theme/Navbar/Search";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";

import { useNavbarItems, useActiveSection } from "./hooks";
import { smoothScrollToHash } from "./utils";
import { getTagForHash, applyTagFilter } from "./services";
import { NAV_ITEMS } from "./constants";

type NavbarItemsProps = {
  items: unknown[];
};

function NavbarItems({ items }: NavbarItemsProps) {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary
          key={i}
          onError={(error) =>
            new Error(
              `A theme navbar item failed to render.\nPlease double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:\n${JSON.stringify(
                item,
                null,
                2
              )}`,
              { cause: error as Error }
            )
          }
        >
          <NavbarItem {...(item as Record<string, unknown>)} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}

function NavbarContentLayout({
  left,
  center,
  right,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className={styles.navbarCustomInner}>
      <div className={styles.navbarLeft}>{left}</div>
      <div className={styles.navbarCenter}>{center}</div>
      <div className={styles.navbarRight}>{right}</div>
    </div>
  );
}

const NavbarContent: React.FC = () => {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems();
  const [, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === "search");
  const [activeSection, setActiveSection] = useActiveSection("home");
  const history = useHistory();
  const location = useLocation();

  const navItemClass = React.useCallback(
    (id: string, base: string) =>
      `${base} ${activeSection === id ? styles.activeMenuItem : ""}`.trim(),
    [activeSection]
  );

  const handleMenuClick = (e: React.MouseEvent, hash: string) => {
    smoothScrollToHash(e, hash);
    setActiveSection(hash.replace("#", ""));
  };

  const handleDropdownClick = (e: React.MouseEvent, tagHash: string) => {
    e.preventDefault();
    const tagFilter = getTagForHash(tagHash);
    if (tagFilter) {
      applyTagFilter(history, location, tagFilter);
    }
    setActiveSection(tagHash.replace("#", ""));
  };

  const onNavClick = (href: string, kind: "menu" | "dropdown") => (e: React.MouseEvent) => {
    if (kind === "menu") {
      handleMenuClick(e, href);
    } else {
      handleDropdownClick(e, href);
    }
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
          {NAV_ITEMS.map((item) => {
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;

            if (!hasChildren) {
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={navItemClass(item.id, styles.menuItem)}
                  onClick={onNavClick(item.href, "menu")}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.id}
                className={styles.menuItemDropdown}
                role="group"
                aria-label={`${item.label} group`}
              >
                <Link
                  to={item.href}
                  className={navItemClass(item.id, styles.menuItem)}
                  onClick={onNavClick(item.href, "menu")}
                  aria-haspopup="true"
                  aria-expanded={activeSection === item.id}
                >
                  {item.label}
                </Link>
                <div
                  className={styles.dropdownMenu}
                  role="menu"
                  aria-label={`${item.label} submenu`}
                >
                  {item.children?.map((child) => (
                    <Link
                      key={child.id}
                      to={child.href}
                      className={navItemClass(child.id, styles.dropdownMenuItem)}
                      onClick={onNavClick(child.href, "dropdown")}
                      role="menuitem"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
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
};

export default NavbarContent;
