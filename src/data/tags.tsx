/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export type Tag = {
  label: string;
  description: string;
  url?: string;
  type?: string | string[];
  subType?: SubType[];
  buttonText?: string;
  date?: string; // ISO 8601 format ("2024-09-23")
  color?:
    | "blue"
    | "green"
    | "slate"
    | "purple"
    | "orange"
    | "brown"
    | "mustard"
    | "red"
    | "teal"
    | "indigo";
};

export type User = {
  title: string;
  description: string;
  preview: string;
  website: string;
  author: string;
  source: string | null;
  tags: TagType[];
  video?: string;
  previewTags?: TagType[];
  image?: string;
  date?: string;
  priority?: "P0" | "P1" | "P2";
  order?: number;
  tileNumber?: number; // Optional tile number for learning path ordering
  learningPathTitle?: string; // Optional title for learning path context
  learningPathDescription?: string; // Optional description for learning path context
  meta?: {
    author?: string;
    date?: string;
    duration?: string;
  };
};

type SubType = {
  label: string;
};

// NN: Updated TagType to suit Static Web Apps
export type TagType =
  | "featured"
  | "flexibleserver"
  | "genai"
  | "overview"
  | "fundamentals-overview"
  | "genai-overview"
  | "vector-search"
  | "azure-ai-extension"
  | "semantic-search"
  | "agents"
  | "graph"
  | "rag"
  | "concepts"
  | "how-to"
  | "documentation"
  | "solution-accelerator"
  | "workshop"
  | "tutorial"
  | "javascript"
  | "python"
  | "training"
  | "dotnet"
  | "java"
  | "video"
  | "horizondb"
  | "fundamentals"
  | "app-dev"
  | "blog"
  | "getting-started"
  | "connect-&-query"
  | "visual-studio-code-extension"
  | "best-practices"
  | "devops"
  | "microsoft-fabric"
  | "powerbi"
  | "azure-data-factory-(adf)"
  | "go"
  | "php"
  | "analytics"
  | "developing-core-applications"
  | "building-genai-apps"
  | "building-ai-agents";

// LIST OF AVAILABLE TAGS
// Each tag in lit about must have a defined object here
// One or more tags can be associated per card
// Tag Metadata:
//   - label = short name seen in tag
//   - description = explainer for usage
//   - type = type of tag
//   - url = url for azure service
export const Tags: { [type in TagType]: Tag } = {
  //============  FOR REGULAR USE
  // Special Tag
  featured: {
    label: "Featured Template",
    description: "This tag is used for featured templates.",
    color: "orange",
  },

  // Language Tags for filtering content
  python: {
    label: "Python",
    description: "Template contains Python app code",
    type: "Language",
    color: "blue",
  },
  dotnet: {
    label: ".NET",
    description: "Template contains .NET app code",
    type: "Language",
    color: "purple",
  },
  java: {
    label: "Java",
    description: "Template contains Java app code",
    type: "Language",
    color: "red",
  },
  go: {
    label: "Go",
    description: "Template contains Go app code",
    type: "Language",
    color: "teal",
  },
  php: {
    label: "PHP",
    description: "Template contains PHP app code",
    type: "Language",
    color: "indigo",
  },
  javascript: {
    label: "JavaScript",
    description: "Template contains JavaScript app code",
    type: "Language",
    color: "mustard",
  },

  // GenAI Tags for filtering content (subtype)
  agents: {
    label: "Agents",
    description: "Template implements one or more agents",
    type: "GenerativeAI",
    buttonText: "GitHub Repo",
    color: "green",
  },
  rag: {
    label: "RAG",
    description: "Template implements RAG Pattern",
    type: "GenerativeAI",
    buttonText: "GitHub Repo",
    color: "green",
  },

  fundamentals: {
    label: "Fundamentals",
    description: "Fundamental concepts and getting started content",
    type: "ContentType",
    subType: [{ label: "Overview" }, { label: "Getting Started" }],
    color: "blue",
  },

  "app-dev": {
    label: "Application Development (Core)",
    description: "Application Development",
    type: "ContentType",
    color: "purple",
    subType: [
      { label: "Connect & Query" },
      { label: "Visual Studio Code Extension" },
      { label: "Best Practices" },
      { label: "DevOps" },
    ],
  },

  overview: {
    label: "Overview",
    description: "Template provides an overview of capabilities",
    type: ["GenerativeAI", "ContentType"],
    color: "slate",
  },
  "fundamentals-overview": {
    label: "Overview",
    description: "Fundamentals overview content",
    type: "ContentType",
    color: "slate",
  },
  "genai-overview": {
    label: "Overview",
    description: "Generative AI overview content",
    type: "ContentType",
    color: "slate",
  },
  "semantic-search": {
    label: "Semantic Search",
    description: "Template uses Semantic Operators",
    type: "GenerativeAI",
    color: "green",
  },
  "vector-search": {
    label: "Vector Search",
    description: "Template uses a Vector Search",
    type: "GenerativeAI",
    color: "green",
  },
  graph: {
    label: "Graph",
    description: "Template uses GraphRAG",
    type: "GenerativeAI",
    color: "green",
  },
  "azure-ai-extension": {
    label: "Azure AI Extension",
    description: "Template integrates with Azure AI services",
    type: ["GenerativeAI", "ContentType"],
    color: "brown",
  },

  // ResourceType Tags for filtering content

  video: {
    label: "Video",
    color: "orange",
    description: "Video on YouTube, Vimeo, etc.",
    type: "ResourceType",
    buttonText: "Video",
  },
  blog: {
    label: "Blog",
    description: "Blog post",
    type: "ResourceType",
    buttonText: "Blog",
    color: "brown",
  },

  "solution-accelerator": {
    label: "Solution Accelerator",
    description: "Solution Accelerators",
    type: "ResourceType",
    buttonText: "Solution Accelerator",
    color: "indigo",
  },

  workshop: {
    label: "Workshop",
    description: "Interactive workshop or hands-on lab",
    type: "ResourceType",
    buttonText: "Workshop",
    color: "purple",
  },

  documentation: {
    label: "Documentation",
    description:
      "Documentation resources including concepts, how-to guides, and tutorials",
    type: "ResourceType",
    buttonText: "Documentation",
    color: "blue",
    subType: [
      { label: "Concepts" },
      { label: "How To" },
      { label: "Tutorial" },
    ],
  },

  concepts: {
    label: "Concepts",
    description: "Concepts article",
    type: "ResourceType",
    buttonText: "Concepts",
    color: "slate",
  },

  "how-to": {
    label: "How To",
    description: "How To guide",
    type: "ResourceType",
    buttonText: "How-To Guide",
    color: "blue",
  },

  tutorial: {
    label: "Tutorial",
    description: "Tutorial",
    type: "ResourceType",
    buttonText: "Tutorial",
    color: "green",
  },

  training: {
    label: "Training",
    description: "Training",
    type: "ResourceType",
    buttonText: "Training",
    color: "purple",
  },

  // Content Category for filtering content
  genai: {
    label: "Generative AI",
    description: "Generative AI and Vector Database content",
    type: "ContentType",
    color: "green",
    subType: [
      { label: "Overview" },
      { label: "Vector Search" },
      { label: "RAG" },
      { label: "Agents" },
      { label: "Semantic Search" },
      { label: "Graph" },
      { label: "Azure AI Extension" },
    ],
  },

  analytics: {
    label: "Analytics",
    description: "Data Analytics and visualization",
    type: "ContentType",
    color: "orange",
    subType: [
      { label: "PowerBI" },
      { label: "Microsoft Fabric" },
      { label: "Azure Data Factory (ADF)" },
    ],
  },
  devops: {
    label: "DevOps",
    description: "Data Analytics and visualization",
    color: "red",
  },
  powerbi: {
    label: "PowerBI",
    description: "Power BI",
    color: "mustard",
  },
  "microsoft-fabric": {
    label: "Microsoft Fabric",
    description: "Microsoft Fabric",
    color: "purple",
  },
  "azure-data-factory-(adf)": {
    label: "Azure Data Factory (ADF)",
    description: "Azure Data Factory",
    color: "indigo",
  },

  "connect-&-query": {
    label: "Connect and Query",
    description: "Connect to Azure Database for PostgreSQL",
    color: "blue",
  },
  "visual-studio-code-extension": {
    label: "Visual Studio Code Extension",
    description: "Integrate with Visual Studio Code",
    color: "teal",
  },
  "best-practices": {
    label: "Best Practices",
    description: "Best Practices for Application Development",
    color: "green",
  },
  "getting-started": {
    label: "Getting Started",
    description: "Getting Started with Azure Database for PostgreSQL",
    color: "slate",
  },

  // Services Category for filtering content
  flexibleserver: {
    label: "Azure Database for PostgreSQL",
    description:
      "Content related to Azure Database for PostgreSQL - Flexible Server",
    type: "Service",
    color: "blue",
  },

  horizondb: {
    label: "Azure HorizonDB",
    description: "Content related to Azure HorizonDB for PostgreSQL",
    type: "Service",
    color: "purple",
  },

  // Learning Path Tags for filtering content
  "developing-core-applications": {
    label: "Developing Core Applications",
    description: "Learning path for developing core applications",
    type: "LearningPath",
    color: "orange",
  },
  "building-genai-apps": {
    label: "Building Generative AI Apps",
    description: "Learning path for building GenAI applications",
    type: "LearningPath",
    color: "green",
  },
  "building-ai-agents": {
    label: "Building AI Agents",
    description: "Learning path for building AI agents",
    type: "LearningPath",
    color: "teal",
  },
};
