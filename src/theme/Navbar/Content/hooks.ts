import { useEffect, useState } from 'react';
import { useThemeConfig } from '@docusaurus/theme-common';
import { SECTIONS, SCROLL_OFFSET } from './constants';
import { getNavbarHeight } from './utils';

// Return navbar items from theme config
export const useNavbarItems = (): unknown[] => {
  // ThemeConfig types can be restrictive; keep this lightweight and safe
  const cfg = useThemeConfig() as unknown as Record<string, unknown>;
  return (cfg.navbar?.items as unknown[]) || [];
};

export function useActiveSection(initial = 'home') {
  const [activeSection, setActiveSection] = useState<string>(initial);

  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = getNavbarHeight();
      const scrollPosition = window.scrollY + navbarHeight + SCROLL_OFFSET;

      const isAtBottom =
        Math.abs(window.innerHeight + window.scrollY - document.documentElement.scrollHeight) < 5;

      let currentSection = 'home';

      if (isAtBottom) {
        currentSection = 'community-support';
      } else {
        for (const sectionId of SECTIONS) {
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return [activeSection, setActiveSection] as const;
}
