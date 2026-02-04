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
  if (!url) return "NO Url";

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("github.com")) {
    return "Start Workshop";
  } else if (
    lowerUrl.includes("youtube.com") ||
    lowerUrl.includes("youtu.be")
  ) {
    return "Watch Video";
  } else if (lowerUrl.includes("techcommunity.microsoft.com")) {
    return "Read Blog";
  } else if (lowerUrl.includes("training") || lowerUrl.includes("/training/")) {
    return "Start Training";
  } else if (lowerUrl.includes("learn.microsoft.com")) {
    return "Documentation";
  } 
  else if (lowerUrl.includes("aka.ms")) {
    return "Explore Solution Accelerator";
  } 
  else {
    console.log("URL did not match any conditions: ", url);
    return "Read More";
  }
}
