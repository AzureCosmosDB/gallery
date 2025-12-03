/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react';
import Head from '@docusaurus/Head';

export default function StructuredData() {
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Azure Cosmos DB Gallery",
    "alternateName": "Cosmos DB Gallery",
    "url": "https://azurecosmosdb.github.io/gallery/",
    "description": "Your best source for patterns and content for Azure Cosmos DB. Discover 100+ code samples, tutorials, and resources for building AI applications.",
    "publisher": {
      "@type": "Organization",
      "name": "Microsoft",
      "url": "https://microsoft.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://azurecosmosdb.github.io/gallery/img/logo.png",
        "width": 32,
        "height": 32
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://azurecosmosdb.github.io/gallery/?tags={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "en-US"
  };

  const softwareApplicationData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Azure Cosmos DB",
    "applicationCategory": "DatabaseApplication",
    "operatingSystem": "Cloud",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "Microsoft",
      "url": "https://microsoft.com"
    },
    "description": "Azure Cosmos DB is a globally distributed, multi-model database service with built-in vector search capabilities for building AI applications."
  };

  const collectionPageData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Azure Cosmos DB Gallery - Code Samples",
    "description": "A curated collection of 100+ code samples for building AI applications with Azure Cosmos DB",
    "url": "https://azurecosmosdb.github.io/gallery/",
    "about": [
      {
        "@type": "Thing",
        "name": "Vector Search"
      },
      {
        "@type": "Thing",
        "name": "RAG Pattern"
      },
      {
        "@type": "Thing",
        "name": "Generative AI"
      },
      {
        "@type": "Thing",
        "name": "Multi-Agent Systems"
      }
    ]
  };

  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify(websiteStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(softwareApplicationData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(collectionPageData)}
      </script>
    </Head>
  );
}
