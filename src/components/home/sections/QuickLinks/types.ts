export type QuickLinkItem = {
  id: string;
  icon: string; // lucide icon name
  color?: string; // optional, default via CSS if missing
  label: string;
  description: string;
  href: string;
};
