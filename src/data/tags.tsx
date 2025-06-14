/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export type Tag = {
  label: string;
  description: string;
  icon?: string;
  darkIcon?: string;
  url?: string;
  type?: string;
  subType?: SubType;
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
};

type SubType = {
  label: string;
  icon: string;
  darkIcon?: string;
};

export const openai: SubType = {
  label: "OpenAI",
  icon: "./img/openAI.svg",
  darkIcon: "./img/openAIDark.svg",
};

export const meta: SubType = {
  label: "Meta",
  icon: "./img/meta.svg",
}

export const microsoft: SubType = {
  label: "Microsoft",
  icon: "./img/Microsoft.svg"
};

export const mistralai: SubType = {
  label: "Mistral AI",
  icon: "", // "./img/mistralai.svg",
};

// NN: Updated TagType to suit Static Web Apps
export type TagType =
  | "featured"
  | "microsoft"
  | "community"
  | "deck"
  | "example"
  | "blog"
  | "video"
  | "documentation"
  | "generativeai"
  | "architecturedesign"
  | "tools"
  | "infrastructure"
  | "migration"
  | "analytics"
  | "CQRS"
  | "outbox-pattern"
  | "event-sourcing"
  | "data-modeling"
  | "serverless"
  | "BCDR"
  | "agent"
  | "ragPattern"
  | "chat"
  | "search"
  | "llmops"
  | "summarization"
  | "mcp"
  | "graphrag"
  | "javascript"
  | "csharp"
  | "java"
  | "python"
  | "typescript"
  | "go"
  | "jupyternotebook"
  | "openai"
  | "dalle"
  | "gpt35"
  | "gpt4"
  | "azure-vision"
  | "embedding-ada"
  | "embedding-text-3"
  | "embedding-cohere"
  | "llama"
  | "llama2"
  | "promptflow"
  | "pinecone"
  | "diskann"
  | "vectorcosmosnosql"
  | "vectorcosmosmongo"
  | "vectorpostrgresql"
  | "vectoraisearch"
  | "semantickernel"
  | "langchain"
  | "llamaindex"
  | "springai"
  | "phi2"
  | "orca2"
  | "mistral7b"
  | "mistral8*7b"
  | "bicep"
  | "terraform"
  | "prometheus"
  | "cosmosdb"
  | "appinsights"
  | "loganalytics"
  | "appservice"
  | "documentintelligence"
  | "monitor"
  | "keyvault"
  | "aca"
  | "functions"
  | "blobstorage"
  | "azuresql"
  | "azurepostrgres"
  | "azuredbmysql"
  | "swa"
  | "servicebus"
  | "vnets"
  | "aisearch"
  | "azureai"
  | "apim"
  | "aks"
  | "azurecdn"
  | "frontdoor"
  | "grafana"
  | "azurespringapps"
  | "rediscache"
  | "agw"
  | "azurebot"
  | "ade"
  | "acr"
  | "eventhub"
  | "azurestorage"
  | "azureappconfig"
  | "aistudio"
  | "apicenter"
  | "eventgrid"
  | "diagnosticsettings"
  | "logicapps"
  | "managedidentity"
  | "serviceprincipal"
  | "azuredatafactory";

// LIST OF AVAILABLE TAGS
// Each tag in lit about must have a defined object here
// One or more tags can be associated per card
// Tag Metadata:
//   - label = short name seen in tag
//   - description = explainer for usage
//   - type = type of tag
//   - icon = svg path for icon
//   - url = url for azure service
export const Tags: { [type in TagType]: Tag } = {
  //============  FOR REGULAR USE
  // Special Tag
  featured: {
    label: "Featured Template",
    description: "This tag is used for featured templates.",
  },


  // Language Tags
  javascript: {
    label: "JavaScript",
    description: "Template contains JavaScript app code",
    type: "Language",
    icon: "./img/js.svg",
  },
  csharp: {
    label: ".NET/C#",
    description: "Template contains .NET and/or C# app code",
    type: "Language",
    icon: "./img/csharp.svg",
  },
  java: {
    label: "Java",
    description: "Template contains Java app code",
    type: "Language",
    icon: "./img/java.svg",
  },
  python: {
    label: "Python",
    description: "Template contains Python app code",
    type: "Language",
    icon: "./img/python.svg",
  },
  typescript: {
    label: "TypeScript",
    description: "Template contains TypeScript app code",
    type: "Language",
    icon: "./img/typescript.svg",
  },
  go: {
    label: "Go",
    description: "Template contains Go app code",
    type: "Language",
    icon: "./img/go.svg",
  },

  // Vector Database Tags
  vectorcosmosnosql: {
    label: "Azure Cosmos DB for NoSQL",
    description: "Template uses Azure Cosmos DB for NoSQL",
    type: "VectorDatabase",
    icon: "./img/cosmos.png",
  },
  vectorcosmosmongo: {
    label: "Azure Cosmos DB for MongoDB",
    description: "Template uses Azure Cosmos DB for MongoDB",
    type: "VectorDatabase",
    icon: "./img/cosmos.png",
  },
  vectorpostrgresql: {
    label: "PostgreSQL",
    description: "Template uses Azure PostgreSQL",
    type: "VectorDatabase",
    icon: "./img/postgresql.svg",
  },
  vectoraisearch: {
    label: "Azure AI Search",
    description: "Template uses Azure AI Search",
    type: "VectorDatabase",
    icon: "./img/aisearch.svg"
  },

  // Model Tags
  dalle: {
    label: "Dalle",
    description: "Template use OpenAI Dalle model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/dall-e",
    icon: "./img/openAI.svg",
    darkIcon: "./img/openAIDark.svg",
  },
  gpt35: {
    label: "GPT 3.5/Turbo",
    description: "Template use OpenAI GPT 3.5 and 3.5 Turbo model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-3-5-turbo",
    icon: "./img/openAI.svg",
    darkIcon: "./img/openAIDark.svg",
  },
  gpt4: {
    label: "GPT 4/4o",
    description: "Template use OpenAI GPT 4 and GPT 4o model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4",
    icon: "./img/openAI.svg",
    darkIcon: "./img/openAIDark.svg",
  },
  "embedding-ada": {
    label: "Embedding ADA",
    description: "Template use OpenAI Embedding-ada model",
    type: "Model",
    subType: openai,
    icon: "./img/openAI.svg",
    darkIcon: "./img/openAIDark.svg",
  },
  "embedding-text-3": {
    label: "Embedding Text 3",
    description: "Template use OpenAI Embedding-text-3 models",
    type: "Model",
    subType: openai,
    icon: "./img/openAI.svg",
    darkIcon: "./img/openAIDark.svg",
  },
  llama: {
    label: "Code Llama",
    description: "Template use Meta Code Llama model",
    type: "Model",
    subType: meta,
    url: "https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-code-llama",
  },
  llama2: {
    label: "Llama 2",
    description: "Template use Meta Llama 2 model",
    type: "Model",
    subType: meta,
    url: "https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-llama-2",
  },
  phi2: {
    label: "Phi 2",
    description: "Template use Microsoft Phi 2 model",
    type: "Model",
    subType: microsoft,
  },
  orca2: {
    label: "Orca 2",
    description: "Template use Microsoft Orca 2 model",
    type: "Model",
    subType: microsoft,
  },
  mistral7b: {
    label: "Mistral 7b",
    description: "Template use Mistral AI Mistral 7b model",
    type: "Model",
    subType: mistralai,
  },
  "mistral8*7b": {
    label: "Mixtral 8x7B",
    description: "Template use Mistral AI Mixtral 8x7B model",
    type: "Model",
    subType: mistralai,
  },

  // GenerativeAI Tags
  agent: {
    label: "Agent",
    description: "Template implements one or more agents",
    type: "GenerativeAI",
  },
  chat: {
    label: "Interactive Chat",
    description: "Template implements interactive chat",
    type: "GenerativeAI",
  },
  ragPattern: {
    label: "RAG Pattern",
    description: "Template implements RAG Pattern",
    type: "GenerativeAI",
  },
  llmops: {
    label: "LLM Ops",
    description: "Template involves LLM Operations",
    type: "GenerativeAI",
  },
  mcp: {
    label: "MCP",
    description: "Multi context protocol, a pattern for building LLM applications",
    type: "GenerativeAI",
  },
  summarization: {
    label: "Summarization",
    description: "Template involves summarization and / or augmentation",
    type: "GenerativeAI",
  },

  // ResourceType Tags
  deck: {
    label: "Presentation",
    description: "Presentation, PPT, PDF, etc.",
    icon: "./img/decks.svg", //need icons for this
    type: "ResourceType",
    buttonText: "View Deck",
  },
  video: {
    label: "Video",
    description: "Video on YouTube, Vimeo, etc.",
    icon: "./img/videos.svg", //need icons for this
    type: "ResourceType",
    buttonText: "Watch Video",
  },
  blog: {
    label: "Blog",
    description: "Blog post",
    icon: "./img/blogs.svg", //need icons for this
    type: "ResourceType",
    buttonText: "Read Blog",
  },
  example: {
    label: "Example",
    description: "Code example",
    icon: "./img/github.svg",
    darkIcon: "./img/githubDark.svg",
    type: "ResourceType",
    buttonText: "Go to GitHub repo",
  },
  documentation: {
    label: "Documentation",
    description: "Documentation",
    icon: "./img/docs.svg",
    type: "ResourceType",
    buttonText: "Read Article",
  },

  // Content Category for filtering content
  generativeai: {
    label: "Generative AI",
    description: "Generative AI and Vector Database content",
    icon: "",
    type: "ContentType"
  },
  architecturedesign: {
    label: "Architecture",
    description: "Architecture and design patterns",
    type: "ContentType"
  },
  tools: {
    label: "Tools",
    description: "Tools and utilities for development",
    type: "ContentType"
  },
  migration: {
    label: "Data Migration",
    description: "Migrating data between services",
    type: "ContentType"
  },
  analytics: {
    label: "Analytics",
    description: "Data Analytics and visualization",
    type: "ContentType"
  },
  microsoft: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  community: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  infrastructure: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  CQRS: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  "outbox-pattern": {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  "event-sourcing": {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  "data-modeling": {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  serverless: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  BCDR: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  search: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  graphrag: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  jupyternotebook: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  openai: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  "azure-vision": {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  "embedding-cohere": {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  promptflow: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  pinecone: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  diskann: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  semantickernel: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  langchain: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  llamaindex: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  springai: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  bicep: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  terraform: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  prometheus: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  cosmosdb: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  appinsights: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  loganalytics: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  appservice: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  documentintelligence: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  monitor: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  keyvault: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  aca: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  functions: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  blobstorage: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  azuresql: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  azurepostrgres: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  azuredbmysql: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  swa: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  servicebus: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  vnets: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  aisearch: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  azureai: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  apim: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  aks: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  azurecdn: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  frontdoor: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  grafana: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  azurespringapps: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  rediscache: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  agw: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  azurebot: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  ade: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  acr: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  eventhub: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  azurestorage: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  azureappconfig: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  aistudio: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  apicenter: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  eventgrid: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  diagnosticsettings: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  logicapps: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  managedidentity: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  serviceprincipal: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  },
  azuredatafactory: {
    label: "",
    description: "",
    icon: "",
    darkIcon: "",
    url: "",
    type: "",
    subType: {
      label: "",
      icon: "",
      darkIcon: ""
    },
    buttonText: "",
    date: ""
  }
};
