// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
// Updated for GitHub Pages deployment - trigger pipeline

import { themes as prismThemes } from "prism-react-renderer";
import { manageCookieLabel } from "./constants.js";

/** @type {import('@docusaurus/types').Config} */
const config = {
  customFields: {
    description:
      "Build scalable, secure, and high-performance applications with Azure PostgreSQL. Get started with our comprehensive documentation, samples, and community resources.",
    disclaimerSection: {
      title: "Azure PostgreSQL Developer Hub",
      description:
        "Build scalable, secure, and high-performance applications with Azure PostgreSQL. Get started with our comprehensive documentation, samples, and community resources.",
    },
    quickLinks: [
      {
        icon: "Globe",
        color: "#9a14fa",
        label: "Azure PostgreSQL Service",
        description: "Official Azure PostgreSQL product page and pricing",
        href: "http://aka.ms/postgres",
      },
      {
        icon: "BookOpen",
        color: "#1960fc",
        label: "Documentation",
        description: "Complete guides and API references",
        href: "https://aka.ms/postgresqldocs",
      },
      {
        icon: "Rss",
        color: "#04a841",
        label: "Blog",
        description: "Latest updates and insights",
        href: "https://aka.ms/azurepostgresblog",
      },
      // {
      //   icon: "FileText",
      //   color: "#9a14fa",
      //   label: "AI Infographic & ebook",
      //   description: "AI-powered PostgreSQL resources",
      //   href: "/ai-infographic-ebook",
      // },
      {
        icon: "GraduationCap",
        color: "#f54a00",
        label: "Microsoft Learn",
        description: "Structured learning paths",
        href: "https://learn.microsoft.com/training/paths/build-ai-apps-azure-database-postgresql/",
      },
      {
        icon: "Play",
        color: "#e80913",
        label: "Video Learning",
        description: "Step-by-step video tutorials",
        href: "https://youtube.com/playlist?list=PLmsFUfdnGr3ySdB8_FVI71bp8wVsgMQU7",
      },
    ],
    learningPathsSection: {
      paths: [
        {
          icon: "Database",
          iconColor: "#0078d4",
          title: "Developing Core Applications",
          description:
            "Master the fundamentals of building production-ready applications with PostgreSQL Flexible Server on Azure",
          level: "Beginner",
          duration: "2-3 hours",
          tags: ["Database Setup", "Connection Management"],
          filterTag: "developing-core-applications",
        },
        {
          icon: "Bot",
          iconColor: "#157f15",
          title: "Building Generative AI Apps",
          description:
            "Learn to integrate AI capabilities with PostgreSQL vector extensions and build intelligent applications",
          level: "Intermediate",
          duration: "3-4 hours",
          tags: ["Vector Extensions", "AI Integration"],
          filterTag: "building-genai-apps",
        },
        {
          icon: "Layers",
          iconColor: "#5c2d91",
          title: "Building AI Agents",
          description:
            "Create sophisticated AI agents that leverage PostgreSQL for data persistence and workflow automation",
          level: "Advanced",
          duration: "4-5 hours",
          tags: ["Agent Architecture", "Workflow Management"],
          filterTag: "building-ai-agents",
        },
      ],
    },
    communitySupportSection: {
      title: "Community & Support",
      description:
        "Connect with fellow developers, get support, and contribute to the Azure PostgreSQL ecosystem",
      cards: [
        {
          title: "Contact Us",
          desc: "Have questions or need help? Our team is here to support you.",
          icon: "Mail",
          actions: [
            {
              label: "Email",
              href: "mailto:AskAzurePostgreSQL@microsoft.com",
              variant: "outlined",
              icon: "Mail",
            },
            {
              label: "Technical Support Portal",
              href: "https://azure.microsoft.com/support/",
              variant: "outlined",
              icon: "ExternalLink",
            },
          ],
        },
        {
          title: "Stay Tuned",
          desc: "Stay updated with the latest news, tips, and announcements.",
          icon: "Bell",
          actions: [
            {
              href: "https://www.linkedin.com/company/azure-database-for-postgresql/",
              icon: "Linkedin",
            },
            {
              href: "https://x.com/AzureDBPostgres",
              icon: "X",
            },
            {
              href: "https://aka.ms/azurepostgresblog",
              icon: "BookOpen",
            },
          ],
        },
        // {
        //   title: "Join the Community",
        //   desc: "Join our exclusive developer community for Azure PostgreSQL with early access to features.",
        //   icon: "Users",
        //   iconColor: "#20b256",
        //   iconBg: "#e6f7ed",
        //   actions: [
        //     { label: "Forum", href: "/forum" },
        //     {
        //       label: "Discord",
        //       href: "https://discord.com/invite/azurepostgres",
        //     },
        //   ],
        // },
        // {
        //   title: "How to Contribute",
        //   desc: "Help improve Azure PostgreSQL documentation, samples, and tooling.",
        //   icon: "Handshake",
        //   iconColor: "#543ef6",
        //   iconBg: "#edeafd",
        //   actions: [{ label: "Contribute Guide", href: "/contribute" }],
        // },
        {
          title: "Submit Your Ideas",
          desc: "Share feedback, request features, and vote on improvements to Azure PostgreSQL.",
          icon: "Lightbulb",
          iconColor: "#9a15fa",
          iconBg: "#f5e6fd",
          actions: [
            { label: "Submit Idea", href: "https://aka.ms/pgfeedback" },
          ],
        },
        {
          title: "Events & Webinars",
          desc: "",
          icon: "Calendar",
          iconColor: "#ea252d",
          iconBg: "#fdeaea",
          events: [
            // {
            //   title: "Building AI Apps with PostgreSQL",
            //   description:
            //     "Learn to integrate AI capabilities with PostgreSQL vector extensions",
            //   date: "November 12, 2025",
            //   time: "2:00 PM PST",
            // },
            // {
            //   title: "PostgreSQL Performance Optimization",
            //   description:
            //     "Best practices for optimizing your PostgreSQL database performance",
            //   date: "December 5, 2025",
            //   time: "10:00 AM PST",
            // },
          ],
          actions: [],
        },
      ],
    },
  },

  title: "Application Developer Hub",
  tagline: "Discover - Create - Contribute",
  url: "https://EmumbaOrg.github.io",
  baseUrl: "/postgres-gallery/",
  favicon: "img/logo.png",
  organizationName: "EmumbaOrg",
  projectName: "postgres-gallery",
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
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: "Application Developer Hub",
        logo: {
          alt: "Azure PostgreSQL App logo",
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
          // {
          //   type: "custom-NavbarButtonGithub",
          //   href: "https://github.com/NucleoidJS/Nucleoid",
          //   position: "right",
          // },
        ],
      },
      footer: {
        style: "light",
        links: [
          {
            label: "Privacy & Cookies",
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
            label: ` © ${new Date().getFullYear()} Microsoft`,
            to: "https://microsoft.com",
          },
        ],
      },
      prism: {
        theme: prismThemes.github,
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

  headTags: [
    // Preconnect to Google Fonts for Roboto
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "anonymous",
      },
    },
    // Load Roboto font
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
      },
    },
    // DNS prefetch for external resources
    {
      tagName: "link",
      attributes: {
        rel: "dns-prefetch",
        href: "https://api.github.com",
      },
    },
    // Optimize rendering
    {
      tagName: "meta",
      attributes: {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
      },
    },
  ],

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        blog: {
          showReadingTime: true,
          routeBasePath: "blog",
          blogTitle: "Application Developer Hub Blog",
          blogDescription:
            "Latest updates, community stories, and developer news",
          feedOptions: {
            type: "all", // 'rss' | 'atom' | 'all'
            title: "Application Developer Hub Blog RSS Feed",
            description:
              "Stay updated with new blog posts from Application Developer Hub",
            language: "en",
            copyright: `Copyright © ${new Date().getFullYear()} Microsoft`,
          },
        },
        gtag: {
          trackingID: "G-CNSKHL41CT",
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
