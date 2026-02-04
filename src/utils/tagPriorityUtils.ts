/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TagType } from "../data/tags";

/**
 * Maps CTA button text to preferred resource type tag priority
 * This ensures the most relevant tag appears first based on the card's action
 * Content hierarchy: Primary content type (video, workshop, training, etc.) 
 * comes before delivery format (blog)
 * Example: Blog about video → video tag first, then blog tag
 */
export const CTA_TO_RESOURCE_TYPE_PRIORITY: Record<string, TagType[]> = {
  // Workshop CTAs - workshop comes first when both workshop and documentation are present
  "Start Workshop": ["workshop", "documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "training", "samples", "blog"],
  
  // Training CTAs - training comes first when both training and documentation are present
  "Start Training": ["training", "documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "workshop", "samples", "blog"],
  
  // Tutorial CTAs - documentation first, then tutorial content (as it's a doc sub-type)
  "Start Tutorial": ["documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "workshop", "training", "samples", "blog"],
  
  // Documentation CTAs - documentation and its sub-types take priority
  "Documentation": ["documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "workshop", "training", "samples", "blog"],
  "View Documentation": ["documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "workshop", "training", "samples", "blog"],
  "Read Concepts": ["documentation", "concepts", "tutorial", "how-to", "solution-accelerator", "video", "workshop", "training", "samples", "blog"],
  "Read How-To Guide": ["documentation", "how-to", "tutorial", "concepts", "solution-accelerator", "video", "workshop", "training", "samples", "blog"],
  
  // Video CTAs - documentation first, then doc sub-types, then video content
  "Watch Video": ["documentation", "tutorial", "concepts", "how-to", "video", "solution-accelerator", "workshop", "training", "samples", "blog"],
  
  // Blog CTAs - if blog is about workshop/training, those come first before documentation
  // Priority: workshop → training → documentation → tutorial/concepts/how-to → other content → blog
  "Read Blog": ["workshop", "training", "documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "samples", "blog"],
  
  // Sample CTAs - documentation first, then doc sub-types, then samples
  "View Sample": ["documentation", "tutorial", "concepts", "how-to", "samples", "solution-accelerator", "video", "workshop", "training", "blog"],
  "Go to GitHub Repo": ["documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "samples", "video", "workshop", "training", "blog"],
  
  // Solution Accelerator CTAs - documentation first, then doc sub-types, then solution-accelerator
  "Explore Solution Accelerator": ["documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "samples", "workshop", "training", "blog"],
  
  // Default fallback for "Read More" and other generic CTAs - workshop and training before documentation when present
  "Read More": ["workshop", "training", "documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "samples", "blog"]
};

/**
 * Default resource type priority order when no CTA match is found
 */
export const DEFAULT_RESOURCE_TYPE_PRIORITY: TagType[] = [
  "documentation",
  "tutorial", 
  "concepts", 
  "how-to",
  "solution-accelerator",
  "video", 
  "workshop",
  "training",
  "samples",
  "blog"
];

/**
 * Gets the resource type tag priority based on CTA button text
 * @param buttonText - The CTA button text from getButtonText()
 * @returns Array of resource type tags in priority order
 */
export function getResourceTypePriorityByCTA(buttonText: string): TagType[] {
  return CTA_TO_RESOURCE_TYPE_PRIORITY[buttonText] || DEFAULT_RESOURCE_TYPE_PRIORITY;
}

/**
 * Sorts resource type tags based on CTA button text priority
 * @param resourceTypeTags - Array of resource type tag objects
 * @param buttonText - The CTA button text
 * @returns Sorted array with CTA-relevant tags first
 */
export function sortResourceTypeTagsByCTA(
  resourceTypeTags: Array<{ tag: TagType; [key: string]: any }>,
  buttonText: string
): Array<{ tag: TagType; [key: string]: any }> {
  const priorityOrder = getResourceTypePriorityByCTA(buttonText);
  
  return resourceTypeTags.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.tag);
    const bIndex = priorityOrder.indexOf(b.tag);
    
    // If both tags are in priority list, sort by priority
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one tag is in priority list, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither tag is in priority list, maintain original order
    return 0;
  });
}