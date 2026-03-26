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
  "Workshop": ["workshop", "documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "training", "blog"],
  
  // Training CTAs - training comes first when both training and documentation are present
  "Training": ["training", "documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "workshop", "blog"],
  
  // Tutorial CTAs - documentation first, then tutorial content (as it's a doc sub-type)
  "Tutorial": ["documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "workshop", "training", "blog"],
  
  // Documentation CTAs - documentation and its sub-types take priority
  "Documentation": ["documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "workshop", "training", "blog"],
  "Concepts": ["documentation", "concepts", "tutorial", "how-to", "solution-accelerator", "video", "workshop", "training", "blog"],
  "How-To Guide": ["documentation", "how-to", "tutorial", "concepts", "solution-accelerator", "video", "workshop", "training", "blog"],
  
  // Video CTAs - documentation first, then doc sub-types, then video content
  "Video": ["documentation", "tutorial", "concepts", "how-to", "video", "solution-accelerator", "workshop", "training", "blog"],
  
  // Blog CTAs - if blog is about workshop/training, those come first before documentation
  // Priority: workshop → training → documentation → tutorial/concepts/how-to → other content → blog
  "Blog": ["workshop", "training", "documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "blog"],
  
  // Sample CTAs - documentation first, then doc sub-types, then samples
  "Sample": ["documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "workshop", "training", "blog"],
  "GitHub Repo": ["documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "workshop", "training", "blog"],
  
  // Solution Accelerator CTAs - documentation first, then doc sub-types, then solution-accelerator
  "Solution Accelerator": ["documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "workshop", "training", "blog"],
  
  // Default fallback for generic CTAs - workshop and training before documentation when present
  "More": ["workshop", "training", "documentation", "tutorial", "concepts", "how-to", "solution-accelerator", "video", "blog"]
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
  
  return resourceTypeTags.sort((firstTag, secondTag) => {
    const firstTagIndex = priorityOrder.indexOf(firstTag.tag);
    const secondTagIndex = priorityOrder.indexOf(secondTag.tag);
    
    // If both tags are in priority list, sort by priority
    if (firstTagIndex !== -1 && secondTagIndex !== -1) {
      return firstTagIndex - secondTagIndex;
    }
    
    // If only one tag is in priority list, prioritize it
    if (firstTagIndex !== -1) return -1;
    if (secondTagIndex !== -1) return 1;
    
    // If neither tag is in priority list, maintain original order
    return 0;
  });
}