/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Configuration interface for button text rules
 */
interface ButtonRule {
  match: (url: string) => boolean;
  text: string;
}

/**
 * Button text rules configuration
 * Rules are evaluated in order - first match wins
 */
const BUTTON_RULES: ButtonRule[] = [
  {
    match: (url) => url.includes('github.com'),
    text: 'Start Workshop',
  },
  {
    match: (url) => url.includes('youtube.com') || url.includes('youtu.be'),
    text: 'Watch Video',
  },
  {
    match: (url) => url.includes('techcommunity.microsoft.com'),
    text: 'Read Blog',
  },
  {
    match: (url) => url.includes('training') || url.includes('/training/'),
    text: 'Start Training',
  },
  {
    match: (url) => url.includes('learn.microsoft.com'),
    text: 'Open Documentation',
  },
  {
    match: (url) => url.includes('aka.ms'),
    text: 'Explore Solution Accelerator',
  },
];

/**
 * Function to get dynamic button text based on URL
 * @param url - The URL to analyze
 * @returns Appropriate button text based on URL patterns
 */
export function getButtonText(url?: string): string {
  // Guard clause
  if (!url) return 'No URL';

  const lowerUrl = url.toLowerCase();

  // .find is more idiomatic than a loop or if/else chain
  const rule = BUTTON_RULES.find((r) => r.match(lowerUrl));

  return rule?.text ?? 'Read More';
}
