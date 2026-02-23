export function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}
