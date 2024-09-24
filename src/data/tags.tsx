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
  | "decks"
  | "samples"
  | "blogs"
  | "videos"
  | "docs"
  | "generativeAI"
  | "eventSouring"
  | "IoT"
  | "migrations"
  | "healthcare"
  | "analytics"
  | "agent"
  | "ragPattern"
  | "chat"
  | "search"
  | "llmops"
  | "summarization"
  | "javascript"
  | "csharp"
  | "java"
  | "python"
  | "typescript"
  | "jupyternotebook"
  | "openai"
  | "dalle"
  | "gpt35"
  | "gpt4"
  | "embedding-ada"
  | "embedding-text-3"
  | "llama"
  | "llama2"
  | "pinecone"
  | "vectorcosmosnosql"
  | "vectorcosmosmongo"
  | "vectorpostrgresql"
  | "vectoraisearch"
  | "semantickernel"
  | "langchain"
  | "llamaindex"
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

  // Vector Database Tags
  vectorcosmosnosql: {
    label: "Azure Cosmos DB for NoSQL",
    description: "Template uses Azure Cosmos DB for NoSQL",
    type: "VectorDatabase",
    icon: "./img/logo.png",
  },
  vectorcosmosmongo: {
    label: "Azure Cosmos DB for MongoDB",
    description: "Template uses Azure Cosmos DB for MongoDB",
    type: "VectorDatabase",
    icon: "./img/logo.png",
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
  },
  gpt35: {
    label: "GPT 3.5/Turbo",
    description: "Template use OpenAI GPT 3.5 and 3.5 Turbo model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-3-5-turbo",
  },
  gpt4: {
    label: "GPT 4/4o",
    description: "Template use OpenAI GPT 4 and GPT 4o model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4",
  },
  "embedding-ada": {
    label: "Embedding ADA",
    description: "Template use OpenAI Embedding-ada model",
    type: "Model",
    subType: openai,
  },
  "embedding-text-3": {
    label: "Embedding Text 3",
    description: "Template use OpenAI Embedding-text-3 models",
    type: "Model",
    subType: openai,
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
    description: "Template implements copilot that uses agent(s)",
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
  summarization: {
    label: "Summarization",
    description: "Template involves summarization and / or augmentation",
    type: "GenerativeAI",
  },

  // ResourceType Tags
  "decks": {
    label: "Decks",
    description: "Presentation decks, PPT, PDF, etc.",
    icon: "./img/decks.svg", //need icons for this
    type: "ResourceType"
  },
  "videos" : {
    label: "Videos",
    description: "Videos on YouTube, Vimeo, etc.",
    icon: "./img/videos.svg", //need icons for this
    type: "ResourceType",
  },
  blogs : {
    label: "Blogs",
    description: "Blog posts",
    icon: "./img/blogs.svg", //need icons for this
    type: "ResourceType",
  },
  samples : {
    label: "Samples",
    description: "Code samples",
    icon: "./img/github-mark.svg",
    type: "ResourceType",
  },
  docs : {
    label: "Docs",
    description: "Documentation",
    icon: "./img/docs",
    type: "ResourceType",
  } 

 
};
