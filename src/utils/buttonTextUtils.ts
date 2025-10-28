/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Function to get dynamic button text based on URL
 * @param url - The URL to analyze
 * @returns Appropriate button text based on URL patterns
 */
export function getButtonText(url: string): string {
  if (!url) return "Read More";

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("github.com")) {
    return "Go to GitHub Repo";
  } else if (
    lowerUrl.includes("youtube.com") ||
    lowerUrl.includes("youtu.be")
  ) {
    return "Watch Video";
  } else if (lowerUrl.includes("learn.microsoft.com")) {
    return "Read Article";
  } else if (lowerUrl.includes("techcommunity.microsoft.com")) {
    return "Read Blog";
  } else if (lowerUrl.includes("training") || lowerUrl.includes("/training/")) {
    return "Start Training";
  } else {
    return "Read More";
  }
}
