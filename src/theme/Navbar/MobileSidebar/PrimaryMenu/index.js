import React from 'react';
import { useThemeConfig } from '@docusaurus/theme-common';
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
function useNavbarItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useThemeConfig().navbar.items;
}
// The primary menu displays the navbar items
export default function NavbarMobilePrimaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();
  // TODO how can the order be defined for mobile?
  // Should we allow providing a different list of items?
  const items = useNavbarItems();
  const history = useHistory();
  const location = useLocation();

  const handleScroll = (e, hash) => {
    if (hash && hash.startsWith('#')) {
      e.preventDefault();
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
      mobileSidebar.toggle();
    }
  };

  const handleFilterNavigate = (e, tag) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('tags', tag);
    history.replace({ pathname: location.pathname, search: `?${params.toString()}` });
    requestAnimationFrame(() => {
      const el = document.getElementById('resource-library');
      if (el) {
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight - 20;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
    mobileSidebar.toggle();
  };

  const hasRealNavItems =
    Array.isArray(items) &&
    items.some((it) => it.type !== 'custom-NavbarButton' && it.type !== 'search');

  if (hasRealNavItems) {
    return (
      <ul className="menu__list">
        {items.map((item, i) => (
          <NavbarItem mobile {...item} onClick={() => mobileSidebar.toggle()} key={i} />
        ))}
      </ul>
    );
  }

  return (
    <ul className="menu__list">
      <li className="menu__list-item">
        <Link className="menu__link" to="#home" onClick={(e) => handleScroll(e, '#home')}>
          Home
        </Link>
      </li>
      <li className="menu__list-item">
        <Link
          className="menu__link"
          to="#learning-paths"
          onClick={(e) => handleScroll(e, '#learning-paths')}
        >
          Learning Pathways
        </Link>
      </li>
      <li className="menu__list-item">
        <Link
          className="menu__link"
          to="#resource-library"
          onClick={(e) => handleScroll(e, '#resource-library')}
        >
          Resource Library
        </Link>
        <ul className="menu__list">
          <li className="menu__list-item">
            <a
              className="menu__link"
              href="#documentation"
              onClick={(e) => handleFilterNavigate(e, 'concepts')}
            >
              Documentation
            </a>
          </li>
          <li className="menu__list-item">
            <a
              className="menu__link"
              href="#solution-accelerators"
              onClick={(e) => handleFilterNavigate(e, 'solution-accelerator')}
            >
              Solution Accelerators
            </a>
          </li>
          <li className="menu__list-item">
            <a
              className="menu__link"
              href="#workshops"
              onClick={(e) => handleFilterNavigate(e, 'workshop')}
            >
              Workshops
            </a>
          </li>
          <li className="menu__list-item">
            <a
              className="menu__link"
              href="#videos"
              onClick={(e) => handleFilterNavigate(e, 'video')}
            >
              Videos
            </a>
          </li>
          <li className="menu__list-item">
            <a
              className="menu__link"
              href="#blogs"
              onClick={(e) => handleFilterNavigate(e, 'blog')}
            >
              Blogs
            </a>
          </li>
          <li className="menu__list-item">
            <a
              className="menu__link"
              href="#trainings"
              onClick={(e) => handleFilterNavigate(e, 'training')}
            >
              Trainings
            </a>
          </li>
          <li className="menu__list-item">
            <a
              className="menu__link"
              href="#samples"
              onClick={(e) => handleFilterNavigate(e, 'samples')}
            >
              Samples
            </a>
          </li>
        </ul>
      </li>
      <li className="menu__list-item">
        <Link
          className="menu__link"
          to="#quick-links"
          onClick={(e) => handleScroll(e, '#quick-links')}
        >
          Quick Links
        </Link>
      </li>
      <li className="menu__list-item">
        <Link
          className="menu__link"
          to="#community-support"
          onClick={(e) => handleScroll(e, '#community-support')}
        >
          Community & Support
        </Link>
      </li>
    </ul>
  );
}
