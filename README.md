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

- [Contributing](./CONTRIBUTING.md)

## Getting Started

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
