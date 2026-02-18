import type { ReactNode } from 'react';

export type HeroResourceLink = {
  label: string;
  tags: string[];
};

export type CoverCardConfig =
  | {
      kind: 'section';
      id: string;
      title: string;
      description: string;
      icon: ReactNode;
      sectionId: string;
      className?: string;
    }
  | {
      kind: 'resource';
      id: string;
      title: string;
      icon: ReactNode;
      description?: string;
      className?: string;
      links: HeroResourceLink[];
      sectionId: string;
    };
