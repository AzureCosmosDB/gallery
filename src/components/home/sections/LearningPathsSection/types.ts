export type LearningPath = {
  id: string;
  iconName?: "Database" | "Bot" | "Layers";
  iconColor?: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  tags: string[];
  filterTag: string;
};
