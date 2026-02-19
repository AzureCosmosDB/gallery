export function scrollToId(id: string, offsetSelector = '.navbar', fallbackOffset = 80): void {
  if (typeof window === 'undefined') return;

  const el = document.getElementById(id);
  if (!el) return;

  const navbar = document.querySelector(offsetSelector) as HTMLElement | null;
  const offset = navbar?.offsetHeight ?? fallbackOffset;

  const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
  const top = elementPosition - offset;

  window.scrollTo({ top, behavior: 'smooth' });
}
