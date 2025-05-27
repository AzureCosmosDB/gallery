// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import { themes as prismThemes } from "prism-react-renderer";
import { manageCookieLabel } from "./constants.js";

/** @type {import('@docusaurus/types').Config} */
const config = {
  customFields: {
    env: process.env.REACT_APP_GITHUB_TOKEN,
    description:
      "Your one-stop for everything Azure Cosmos DB. Code samples, docs, videos, decks, etc. Everything in one location. Community contributions are welcome.",
  },

  title: "Azure Cosmos DB Gallery",
  tagline: "Discover - Create - Contribute",
  url: "https://azurecosmosdb.github.io",
  baseUrl: "/gallery/",
  favicon: "img/favicon.ico",
  organizationName: "azurecosmosdb",
  projectName: "gallery",
  deploymentBranch: "gh-pages",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  scripts: [
    "https://js.monitor.azure.com/scripts/c/ms.analytics-web-4.min.js",
    "https://wcpstatic.microsoft.com/mscc/lib/v2/wcp-consent.js",
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },
      colorMode: {
        defaultMode: "light",
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "Azure Cosmos DB Gallery",
        logo: {
          alt: "Azure Cosmos DB logo",
          src: "img/logo.png",
          href: "/",
          target: "_self",
          width: 32,
          height: 32,
        },
        items: [
          {
            type: "custom-NavbarButton",
            position: "right",
          },
          {
            type: "custom-NavbarButtonGithub",
            href: "https://github.com/NucleoidJS/Nucleoid",
            position: "right",
          },
        ],
      },
      footer: {
        style: "light",
        links: [
          {
            label: "Privacy Statement",
            to: "https://privacy.microsoft.com/privacystatement",
          },
          {
            label: manageCookieLabel,
            to: " ",
          },
          {
            label: "Built With Docusaurus",
            to: "https://docusaurus.io",
          },
          {
            label: `Copyright © ${new Date().getFullYear()} Microsoft`,
            to: "https://microsoft.com",
          },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),

  plugins: [
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 70,
        max: 1030,
        min: 640,
        steps: 2,
        disableInDev: false,
      },
    ],
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        blog: {
          showReadingTime: true,
          routeBasePath: 'blog',
          blogTitle: 'Azure Cosmos DB Gallery Blog',
          blogDescription: 'Latest updates, community stories, and developer news',
          feedOptions: {
            type: 'all', // 'rss' | 'atom' | 'all'
            title: 'Azure Cosmos DB Gallery Blog RSS Feed',
            description: 'Stay updated with new blog posts from Azure Cosmos DB Gallery',
            language: 'en',
            copyright: `Copyright © ${new Date().getFullYear()} Microsoft`,
          },
        },
        gtag: {
          trackingID: 'G-CNSKHL41CT',
          anonymizeIP: true,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};

module.exports = config;
