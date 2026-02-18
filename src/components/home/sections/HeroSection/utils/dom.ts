export function getNavbarHeight(selector = '.navbar', fallback = 80) {
  const navbar = document.querySelector(selector) as HTMLElement | null;
  return navbar?.offsetHeight ?? fallback;
}

export function scrollToElementId(id: string, offsetPx = 0) {
  const el = document.getElementById(id);
  if (!el) return;

  const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offsetPx;

  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
}
