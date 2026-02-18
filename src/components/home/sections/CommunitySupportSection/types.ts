export type CardAction = {
  label: string;
  href: string;
  variant?: 'outlined' | 'filled';
  icon?: string; // icon name OR "X"
  fullWidth?: boolean;
};

export type EventItem = {
  title: string;
  description: string;
  date: string; // ISO string recommended
  time: string;
};

export type CommunityCardType = {
  id: string; // stable key
  title: string;
  desc: string;
  icon: string; // lucide icon name
  iconColor?: string;
  iconBg?: string;
  actions: CardAction[];
  events?: EventItem[];
  layout?: 'default' | 'stackedActions';
};

export type CommunitySupportSectionType = {
  title: string;
  description: string;
  cards: CommunityCardType[];
};
