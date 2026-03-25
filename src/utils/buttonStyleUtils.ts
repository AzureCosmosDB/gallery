/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export interface ButtonStyles {
  backgroundColor: string;
  border: string;
  color: string;
  borderRadius: string;
}

const BUTTON_STYLE_MAP: Record<string, ButtonStyles> = {
  Documentation: {
    backgroundColor: "#ECF9FF",
    border: "1px solid #AED4F2",
    color: "#0078D4",
    borderRadius: "3px 3px 14px 14px",
  },
  "Solution Accelerator": {
    backgroundColor: "#F1FBF1",
    border: "1px solid #B7D8B7",
    color: "#107C10",
    borderRadius: "3px 3px 14px 14px",
  },
  Video: {
    backgroundColor: "#FFEFFD",
    border: "1px solid #E6B9E1",
    color: "#B140A3",
    borderRadius: "3px 3px 14px 14px",
  },
  Training: {
    backgroundColor: "#FAF4FF",
    border: "1px solid #CDBFDE",
    color: "#5C2D91",
    borderRadius: "3px 3px 14px 14px",
  },
  Workshop: {
    backgroundColor: "#FAF4FF",
    border: "1px solid #CDBFDE",
    color: "#5C2D91",
    borderRadius: "3px 3px 14px 14px",
  },
  Blog: {
    backgroundColor: "#FEF7EE",
    border: "1px solid #DDC4A2",
    color: "#CE811D",
    borderRadius: "3px 3px 14px 14px",
  },
};

const DEFAULT_BUTTON_STYLES: ButtonStyles = {
  backgroundColor: "#ECF9FF",
  border: "1px solid #AED4F2",
  color: "#0078D4",
  borderRadius: "3px 3px 14px 14px",
};

/**
 * Returns CTA button styles (background, border, text color, border-radius) based on button text.
 */
export function getButtonStyles(buttonText: string): ButtonStyles {
  return BUTTON_STYLE_MAP[buttonText] ?? DEFAULT_BUTTON_STYLES;
}
