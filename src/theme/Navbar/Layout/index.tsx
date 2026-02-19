/* eslint-disable import/no-named-as-default */
import React from "react";
import clsx from "clsx";
import { useThemeConfig } from "@docusaurus/theme-common";
import { useHideableNavbar, useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import { translate } from "@docusaurus/Translate";
import NavbarMobileSidebar from "@theme/Navbar/MobileSidebar";
import styles from "./styles.module.css";
import { useAdobeConsentInit } from "./useAdobeConsentInit";

type NavbarBackdropProps = React.HTMLAttributes<HTMLDivElement>;

type NavbarLayoutProps = {
  children: React.ReactNode;
};

function NavbarBackdrop({ className, ...props }: NavbarBackdropProps) {
  return (
    <div role="presentation" {...props} className={clsx("navbar-sidebar__backdrop", className)} />
  );
}

const NavbarLayout: React.FC<NavbarLayoutProps> = ({ children }) => {
  const {
    navbar: { hideOnScroll, style },
  } = useThemeConfig();
  const mobileSidebar = useNavbarMobileSidebar();
  const { navbarRef, isNavbarVisible } = useHideableNavbar(hideOnScroll);

  useAdobeConsentInit();

  return (
    <nav
      ref={navbarRef}
      aria-label={translate({
        id: "theme.NavBar.navAriaLabel",
        message: "Main",
        description: "The ARIA label for the main navigation",
      })}
      className={clsx(
        "navbar",
        "navbar--fixed-top",
        hideOnScroll && [styles.navbarHideable, !isNavbarVisible && styles.navbarHidden],
        {
          "navbar--primary": style === "primary",
          "navbar-sidebar--show": mobileSidebar.shown,
        }
      )}
    >
      {children}
      <NavbarBackdrop onClick={mobileSidebar.toggle} />
      <NavbarMobileSidebar />
    </nav>
  );
};

// eslint-disable-next-line import/no-unused-modules
export default NavbarLayout;
