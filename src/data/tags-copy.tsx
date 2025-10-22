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
  },

  // Language Tags for filtering content
  python: {
    label: "Python",
    description: "Template contains Python app code",
    type: "Language",
  },
  dotnet: {
    label: ".NET",
    description: "Template contains .NET app code",
    type: "Language",
  },
  java: {
    label: "Java",
    description: "Template contains Java app code",
    type: "Language",
  },
  go: {
    label: "Go",
    description: "Template contains Go app code",
    type: "Language",
  },
  php: {
    label: "PHP",
    description: "Template contains PHP app code",
    type: "Language",
  },
  javascript: {
    label: "JavaScript",
    description: "Template contains JavaScript app code",
    type: "Language",
  },

  // GenAI Tags for filtering content (subtype)
  agent: {
    label: "Agents",
    description: "Template implements one or more agents",
    type: "GenerativeAI",
    buttonText: "Go to Github repo",
  },
  rag: {
    label: "RAG Pattern",
    description: "Template implements RAG Pattern",
    type: "GenerativeAI",
    buttonText: "Go to Github repo",
  },

  fundamentals: {
    label: "Azure PostgreSQL Fundamentals",
    description: "Fundamental concepts and getting started content",
    type: "ContentType",
    subType: [{ label: "Overview" }, { label: "getting-started" }],
  },

  "app-dev": {
    label: "Application Development (Core)",
    description: "Application Development",
    type: "ContentType",
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
  },
  semantic: {
    label: "Semantic Operators",
    description: "Template uses Semantic Operators",
    type: "GenerativeAI",
  },
  vector: {
    label: "Vector Search",
    description: "Template uses a Vector Search",
    type: "GenerativeAI",
  },
  graph: {
    label: "GraphRAG",
    description: "Template uses GraphRAG",
    type: "GenerativeAI",
  },
  azureai: {
    label: "Azure AI services integration",
    description: "Template integrates with Azure AI services",
    type: ["GenerativeAI", "ContentType"],
  },

  // ResourceType Tags for filtering content

  video: {
    label: "Video",
    description: "Video on YouTube, Vimeo, etc.",
    type: "ResourceType",
    buttonText: "Watch Video",
  },
  blog: {
    label: "Blog",
    description: "Blog post",
    type: "ResourceType",
    buttonText: "Read Blog",
  },

  "solution-accelerator": {
    label: "Solution Accelerator and Workshop",
    description: "Solution Accelerator",
    type: "ResourceType",
    buttonText: "Explore Solution Accelerator",
  },

  concepts: {
    label: "Concepts",
    description: "Concepts article",
    type: "ResourceType",
    buttonText: "Read Concepts",
  },

  "how-to": {
    label: "How-To guide",
    description: "How-To guide",
    type: "ResourceType",
    buttonText: "Read How-To Guide",
  },

  tutorial: {
    label: "Tutorial",
    description: "Tutorial",
    type: "ResourceType",
    buttonText: "Start Tutorial",
  },

  training: {
    label: "Training",
    description: "Training",
    type: "ResourceType",
    buttonText: "Start Training",
  },

  samples: {
    label: "Samples",
    description: "Sample",
    type: "ResourceType",
    buttonText: "View Sample",
  },

  // Content Category for filtering content
  genai: {
    label: "Generative AI",
    description: "Generative AI and Vector Database content",
    type: "ContentType",
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
    subType: [{ label: "PowerBI" }, { label: "Fabric" }, { label: "ADF" }],
  },
  devops: {
    label: "CI/CD",
    description: "Data Analytics and visualization",
  },
  powerbi: {
    label: "PowerBI",
    description: "Power BI",
  },
  fabric: {
    label: "Microsoft Fabric",
    description: "Microsoft Fabric",
  },
  adf: {
    label: "Azure Data Factory and Synapse",
    description: "Azure Data Factory",
  },

  connect: {
    label: "Connect and Query",
    description: "Connect to Azure Database for PostgreSQL",
  },
  vscode: {
    label: "Visual Studio Code Extension",
    description: "Integrate with Visual Studio Code",
  },
  "best-practice": {
    label: "Best Practices",
    description: "Best Practices for Application Development",
  },
  "getting-started": {
    label: "Getting Started",
    description: "Getting Started with Azure Database for PostgreSQL",
  },

  // Services Category for filtering content
  flexibleserver: {
    label: "Azure Database for PostgreSQL",
    description:
      "Content related to Azure Database for PostgreSQL - Flexible Server",
    type: "Service",
  },

  oriondb: {
    label: "Azure OrionDB for PostgreSQL",
    description: "Content related to Azure OrionDB for PostgreSQL",
    type: "Service",
  },

  // Learning Path Tags for filtering content
  "developing-core-applications": {
    label: "Developing core applications",
    description: "Learning path for developing core applications",
    type: "LearningPath",
  },
  "building-genai-apps": {
    label: "Building generative AI apps",
    description: "Learning path for building GenAI applications",
    type: "LearningPath",
  },
  "building-ai-agents": {
    label: "Building AI agents",
    description: "Learning path for building AI agents",
    type: "LearningPath",
  },
};
