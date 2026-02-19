import React from 'react';
import { NAVBAR_FALLBACK_HEIGHT } from './constants';

export const getNavbarHeight = (): number => {
  const nav = document.querySelector('.navbar') as HTMLElement | null;
  return nav ? nav.offsetHeight : NAVBAR_FALLBACK_HEIGHT;
};

export function scrollToElementById(id: string, behavior: ScrollBehavior = 'smooth'): void {
  const el = document.getElementById(id);
  if (!el) return;
  const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - getNavbarHeight();
  window.scrollTo({ top: offsetPosition, behavior });
}

export function smoothScrollToHash(e: React.MouseEvent, hash?: string): void {
  if (hash && hash.startsWith('#')) {
    e.preventDefault();
    scrollToElementById(hash.slice(1));
  }
}
