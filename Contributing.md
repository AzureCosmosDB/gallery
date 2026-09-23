# Contributing

_We are still working on our contribution guidelines. In the meantime, please feel free to open issues and provide feedback on how to streamline the process._

## Introduction

This project welcomes contributions and suggestions. Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit <https://cla.opensource.microsoft.com>.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the Microsoft Open Source Code of Conduct. For more information see the Code of Conduct FAQ or contact <opencode@microsoft.com> with any additional questions or comments.

## Raising Issues

We very much welcome issues to help us improve the project. When submitting an issue, select the appropriate template and fill out the information requested. This will help us to understand the issue and resolve it as quickly as possible. Be sure to include as much information as you can, including configuration files, logs, and hosting model.

## Catalog Contributions

Catalog changes may be submitted manually or proposed by the automated maintenance workflow. In both cases:

- use a canonical public source URL;
- use locale-neutral Microsoft documentation URLs without segments such as `/en-us/`;
- provide complete title, description, author, date, website, preview, and tag metadata;
- keep descriptions factual, complete, and free of encoded feed entities;
- avoid duplicate resources after URL normalization; and
- include strong evidence for removals or retirements.

Generated maintenance pull requests are always drafts. Their bodies label additions as `A<n>`, URL updates as `U<n>`, retirements as `R<n>`, and skipped items as `S<n>`. An authorized maintainer can comment `Reject: A1, U1, R1` to remove those changes from the current proposal. A maintainer must review the complete catalog diff and merge it through the normal protected-branch process before publication.

See [Automated gallery maintenance](./docs/automated-gallery-maintenance.md) and [Content source policy](./docs/content-source-policy.md) for the operating and source-approval requirements.

## Validation

Use npm and the committed `package-lock.json`:

```shell
npm ci
npm run test:gallery-audit
npm run gallery:audit:fixtures
npm run build
```

All four commands must pass before a catalog or maintenance-automation pull request is ready for review.
