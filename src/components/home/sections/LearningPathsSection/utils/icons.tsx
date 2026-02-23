import React from "react";
import { Database, Bot, Layers } from "lucide-react";
import type { LearningPath } from "../types";

export function renderPathIcon(path: Pick<LearningPath, "iconName" | "iconColor">) {
  const size = 28;
  const color = path.iconColor;

  switch (path.iconName) {
    case "Database":
      return <Database size={size} color={color || "#0078d4"} />;
    case "Bot":
      return <Bot size={size} color={color || "#157f15"} />;
    case "Layers":
      return <Layers size={size} color={color || "#5c2d91"} />;
    default:
      return null;
  }
}
