export function scrollToIdWithNavbarOffset(id: string, navbarSelector = '.navbar', fallback = 80) {
  const el = document.getElementById(id);
  if (!el) return;

  const navbar = document.querySelector(navbarSelector) as HTMLElement | null;
  const navbarHeight = navbar?.offsetHeight ?? fallback;

  const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - navbarHeight;

  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
}
