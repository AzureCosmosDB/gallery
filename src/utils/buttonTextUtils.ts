/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { TagType } from '../data/tags';

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
    match: (url) => url.includes("github.com"),
    text: "Start Workshop",
  },
  {
    match: (url) => url.includes("youtube.com") || url.includes("youtu.be"),
    text: "Watch Video",
  },
  {
    match: (url) => url.includes("techcommunity.microsoft.com"),
    text: "Read Blog",
  },
  {
    match: (url) => url.includes("training") || url.includes("/training/"),
    text: "Start Training",
  },
  {
    match: (url) => url.includes("learn.microsoft.com"),
    text: "Open Documentation",
  },
  {
    match: (url) => url.includes("aka.ms"),
    text: "Explore Solution Accelerator",
  },
];

/**
 * Function to get dynamic button text based on URL and tags
 * @param url - The URL to analyze
 * @param tags - Optional array of tags to consider for button text
 * @returns Appropriate button text based on URL patterns and tags
 */
export function getButtonText(url?: string, tags?: TagType[]): string {
  // Guard clause
  if (!url) return "No URL";

  const lowerUrl = url.toLowerCase();
  
  // Special case: if URL matches blog pattern AND has solution accelerator tag, prioritize solution accelerator CTA
  if (lowerUrl.includes("techcommunity.microsoft.com") && tags?.includes('solution-accelerator' as TagType)) {
    return "Explore Solution Accelerator";
  }

  // If this is a blog link but the card also has a documentation tag,
  // prefer showing the documentation CTA instead of the blog CTA.
  if (lowerUrl.includes("techcommunity.microsoft.com") && tags?.includes('documentation' as TagType)) {
    return "Open Documentation";
  }

  // .find is more idiomatic than a loop or if/else chain
  const rule = BUTTON_RULES.find(r => r.match(lowerUrl));

  return rule?.text ?? "Read More";
}
