export type NavChildItem = {
  id: string;
  label: string;
  href: `#${string}`;
};

export type NavItem = NavChildItem & {
  children?: readonly NavChildItem[];
};

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'learning-paths', label: 'Learning Pathways', href: '#learning-paths' },
  {
    id: 'resource-library',
    label: 'Resource Library',
    href: '#resource-library',
    children: [
      { id: 'documentation', label: 'Documentation', href: '#documentation' },
      {
        id: 'solution-accelerators',
        label: 'Solution accelerators',
        href: '#solution-accelerators',
      },
      { id: 'workshops', label: 'Workshops', href: '#workshops' },
      { id: 'videos', label: 'Videos', href: '#videos' },
      { id: 'blogs', label: 'Blogs', href: '#blogs' },
      { id: 'trainings', label: 'Trainings', href: '#trainings' },
      { id: 'samples', label: 'Samples', href: '#samples' },
    ],
  },
  { id: 'quick-links', label: 'Quick Links', href: '#quick-links' },
  { id: 'community-support', label: 'Community & Support', href: '#community-support' },
] as const;

export const SECTIONS = NAV_ITEMS.map((item) => item.id);

export const NAVBAR_FALLBACK_HEIGHT = 80; // px
export const SCROLL_OFFSET = 50; // px, extra offset for detection

export const TAG_MAPPING: Record<string, string | string[]> = {
  '#documentation': ['documentation', 'concepts', 'how-to', 'tutorial'],
  '#solution-accelerators': 'solution-accelerator',
  '#workshops': 'workshop',
  '#videos': 'video',
  '#blogs': 'blog',
  '#trainings': 'training',
  '#samples': 'samples',
};
