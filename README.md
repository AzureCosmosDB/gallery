# Website

This repository is your one-stop shop for Azure Cosmos DB resources, including:

- GitHub Samples: Code in Python, JavaScript, and C#
- Docs & Articles: In-depth guides and insights
- Videos & Blogs: Engaging, informative content
- Data Migration Tools: Smooth transition utilities

And more!

Explore all things Azure Cosmos DB in one place!

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## How to Contribute

Contributions to this project are more than welcome. Make sure you check out the following documents, to successfully contribute to the project:

- [Contributing](./Contributing.md)
- [Automated gallery maintenance](./docs/automated-gallery-maintenance.md)
- [Content source policy](./docs/content-source-policy.md)

## Getting Started

### Installation

```shell
npm ci
```

### Local Development

```shell
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```shell
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

The repository deploys through `.github/workflows/deploy.yml` after reviewed changes merge to `main`. The workflow uploads the static build with GitHub's official Pages actions and does not require a personal access token. GitHub Pages publishes the site at <https://azurecosmosdb.github.io/gallery/>. Contributors should not publish from personal forks or run a manual deployment against the upstream site.

## Automated Maintenance

The weekly maintenance workflow audits existing entries, discovers catalog-aligned content from approved sources, and opens one draft pull request for human review. Its Copilot curator uses the Azure Cosmos DB Agent Kit and a repository humanizer skill. A new proposal requests review from `jagord_microsoft`; GitHub notification routing sends that request to `jagord@microsoft.com`. The workflow never merges or publishes catalog changes automatically.

See [Automated gallery maintenance](./docs/automated-gallery-maintenance.md) for setup and operations, and [Content source policy](./docs/content-source-policy.md) for source eligibility.
