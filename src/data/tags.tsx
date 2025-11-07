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
  | "vector"
  | "azureai"
  | "semantic"
  | "agent"
  | "graph"
  | "rag"
  | "concepts"
  | "how-to"
  | "solution-accelerator"
  | "tutorial"
  | "javascript"
  | "python"
  | "training"
  | "dotnet"
  | "java"
  | "video"
  | "oriondb"
  | "fundamentals"
  | "app-dev"
  | "blog"
  | "getting-started"
  | "connect"
  | "vscode"
  | "best-practice"
  | "devops"
  | "fabric"
  | "powerbi"
  | "adf"
  | "go"
  | "php"
  | "samples"
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
  agent: {
    label: "Agents",
    description: "Template implements one or more agents",
    type: "GenerativeAI",
    buttonText: "Go to Github repo",
    color: "green",
  },
  rag: {
    label: "RAG Pattern",
    description: "Template implements RAG Pattern",
    type: "GenerativeAI",
    buttonText: "Go to Github repo",
    color: "green",
  },

  fundamentals: {
    label: "Azure PostgreSQL Fundamentals",
    description: "Fundamental concepts and getting started content",
    type: "ContentType",
    subType: [{ label: "Overview" }, { label: "getting-started" }],
    color: "blue",
  },

  "app-dev": {
    label: "Application Development (Core)",
    description: "Application Development",
    type: "ContentType",
    color: "purple",
    subType: [
      { label: "Connect" },
      { label: "vscode" },
      { label: "best-practice" },
      { label: "devops" },
    ],
  },

  overview: {
    label: "Overview",
    description: "Template provides an overview of GenAI capabilities",
    type: ["GenerativeAI", "ContentType"],
    color: "slate",
  },
  semantic: {
    label: "Semantic Operators",
    description: "Template uses Semantic Operators",
    type: "GenerativeAI",
    color: "green",
  },
  vector: {
    label: "Vector Search",
    description: "Template uses a Vector Search",
    type: "GenerativeAI",
    color: "green",
  },
  graph: {
    label: "GraphRAG",
    description: "Template uses GraphRAG",
    type: "GenerativeAI",
    color: "green",
  },
  azureai: {
    label: "Azure AI services integration",
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
    buttonText: "Watch Video",
  },
  blog: {
    label: "Blog",
    description: "Blog post",
    type: "ResourceType",
    buttonText: "Read Blog",
    color: "brown",
  },

  "solution-accelerator": {
    label: "Solution Accelerator and Workshop",
    description: "Solution Accelerator",
    type: "ResourceType",
    buttonText: "Explore Solution Accelerator",
    color: "indigo",
  },

  concepts: {
    label: "Concepts",
    description: "Concepts article",
    type: "ResourceType",
    buttonText: "Read Concepts",
    color: "slate",
  },

  "how-to": {
    label: "How-To guide",
    description: "How-To guide",
    type: "ResourceType",
    buttonText: "Read How-To Guide",
    color: "blue",
  },

  tutorial: {
    label: "Tutorial",
    description: "Tutorial",
    type: "ResourceType",
    buttonText: "Start Tutorial",
    color: "green",
  },

  training: {
    label: "Training",
    description: "Training",
    type: "ResourceType",
    buttonText: "Start Training",
    color: "purple",
  },

  samples: {
    label: "Samples",
    description: "Sample",
    type: "ResourceType",
    buttonText: "View Sample",
    color: "teal",
  },

  // Content Category for filtering content
  genai: {
    label: "Generative AI",
    description: "Generative AI and Vector Database content",
    type: "ContentType",
    color: "green",
    subType: [
      { label: "Overview" },
      { label: "Vector" },
      { label: "RAG" },
      { label: "Agent" },
      { label: "Semantic" },
      { label: "Graph" },
      { label: "AzureAI" },
    ],
  },

  analytics: {
    label: "Analytics",
    description: "Data Analytics and visualization",
    type: "ContentType",
    color: "orange",
    subType: [{ label: "PowerBI" }, { label: "Fabric" }, { label: "ADF" }],
  },
  devops: {
    label: "CI/CD",
    description: "Data Analytics and visualization",
    color: "red",
  },
  powerbi: {
    label: "PowerBI",
    description: "Power BI",
    color: "mustard",
  },
  fabric: {
    label: "Microsoft Fabric",
    description: "Microsoft Fabric",
    color: "purple",
  },
  adf: {
    label: "Azure Data Factory and Synapse",
    description: "Azure Data Factory",
    color: "indigo",
  },

  connect: {
    label: "Connect and Query",
    description: "Connect to Azure Database for PostgreSQL",
    color: "blue",
  },
  vscode: {
    label: "Visual Studio Code Extension",
    description: "Integrate with Visual Studio Code",
    color: "teal",
  },
  "best-practice": {
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

  oriondb: {
    label: "Azure OrionDB for PostgreSQL",
    description: "Content related to Azure OrionDB for PostgreSQL",
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
