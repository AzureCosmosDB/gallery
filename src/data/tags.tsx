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

// TODO add icon
export const microsoft: SubType = {
  label: "Microsoft",
  icon: "",
};

export const mistralai: SubType = {
  label: "Mistral AI",
  icon: "",
};

// NN: Updated TagType to suit Static Web Apps
export type TagType =
  | "featured"
  | "javascript"
  | "dotnetCsharp"
  | "java"
  | "python"
  | "typescript"
  | "dalle"
  | "gpt35turbo"
  | "gpt4turbo"
  | "decks"
  | "code"
  | "blogs"
  | "blog"
  | "Videos"
  | "Docs"
  | "gpt4"
  | "llama"
  | "llama2"
  | "agent"
  | "chat"
  | "search"
  | "llmops"
  | "summarization"
  | "pinecone"
  | "azuresql"
  | "azurecosmosdb"
  | "phi2"
  | "orca2"
  | "mistral7b"
  | "mistral8*7b"
  | "embedding-ada"
  | "bicep"
  | "terraform"
  | "prometheus"
  | "pinecone"
  | "appinsights"
  | "loganalytics"
  | "appservice"
  | "monitor"
  | "keyvault"
  | "aca"
  | "cosmosdb"
  | "functions"
  | "blobstorage"
  | "azuresql"
  | "azuredb-mySQL"
  | "swa"
  | "servicebus"
  | "vnets"
  | "aisearch"
  | "openai"
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
  dotnetCsharp: {
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

  // Model Tags
  dalle: {
    label: "Dalle",
    description: "Template use OpenAI Dalle model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/dall-e",
  },
  gpt35turbo: {
    label: "GPT 3.5 Turbo",
    description: "Template use OpenAI GPT 3.5 Turbo model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-3-5-turbo",
  },
  gpt4turbo: {
    label: "GPT 4 Turbo",
    description: "Template use OpenAI GPT 4 Turbo model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4",
  },
  gpt4: {
    label: "GPT 4",
    description: "Template use OpenAI GPT 4 model",
    type: "Model",
    subType: openai,
    url: "https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4",
  },
  "embedding-ada": {
    label: "Embedding-ada",
    description: "Template use OpenAI Embedding-ada model",
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

  // Intelligent Solution Tags
  agent: {
    label: "Agent",
    description: "Template implements copilot that uses agent(s)",
    type: "Intelligent Solution",
  },
  chat: {
    label: "Interactive Chat",
    description: "Template implements interactive chat",
    type: "Intelligent Solution",
  },
  search: {
    label: "Guided Search",
    description: "Template implements guided search",
    type: "Intelligent Solution",
  },
  llmops: {
    label: "LLM Ops",
    description: "Template involves LLM Operations",
    type: "Intelligent Solution",
  },
  summarization: {
    label: "Summarization",
    description: "Template involves summarization and / or augmentation",
    type: "Intelligent Solution",
  },

  // ResourceType Tags
  "decks": {
    label: "Decks",
    description: "Template architecture uses Azure PostgreSQL Database",
    icon: "./img/Azure-PostgreSQL.svg",
    url: "https://azure.microsoft.com/products/postgresql",
    type: "ResourceType",
  },
  videos : {
    label: "Videos",
    description: "Template architecture uses MongoDB Database",
    type: "ResourceType",
  },
  blogs : {
    label: "Blogs",
    description: "Template architecture uses MongoDB Database",
    type: "ResourceType",
  },
  code : {
    label: "Code",
    description: "Template architecture uses MongoDB Database",
    type: "ResourceType",
  },
  Docs : {
    label: "Docs",
    description: "Template architecture uses Pinecone Database",
    type: "ResourceType",
  } 

 
};
