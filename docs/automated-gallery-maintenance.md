# Automated gallery maintenance

This repository uses a scheduled GitHub Actions workflow to audit the published catalog, discover new Azure Cosmos DB resources, classify candidates, and publish a proposal branch plus an unassigned Copilot handoff issue.

The site remains static. The maintenance workflow does not deploy infrastructure, call a private application API, merge pull requests, or push directly to `main`.

## Workflow

The `Audit gallery content` workflow runs every Monday at 06:17 UTC and supports manual dispatch.

Pull requests run a read-only validation job that:

1. installs dependencies with `npm ci`;
2. runs the gallery audit tests;
3. runs discovery against local fixtures; and
4. builds the Docusaurus site.

Scheduled and manual runs:

1. verify that `main` has the required human-approval ruleset;
2. create `automation/gallery-content-updates-<run-id>-<attempt>` from the current `main` branch;
3. audit every live catalog entry;
4. discover bounded candidates from approved feeds, YouTube channels, GitHub organizations, and Microsoft Learn;
5. classify candidates and evidence-backed retirement proposals with the tool-free `gallery-curator` Copilot agent;
6. validate the proposed catalog and static site;
7. publish a new proposal branch, compare link, and unassigned issue without rewriting an earlier review branch; and
8. upload the complete review bundle for 30 days.

Before classification, the workflow installs the Azure Cosmos DB Agent Kit's `cosmosdb-best-practices` skill from a pinned commit and verifies its SHA-256 checksum. The repository includes a focused `humanizer` skill. A preflight check requires Copilot CLI to discover both skills, and classification explicitly enables skill retrieval. The curator uses Agent Kit guidance to enforce current Cosmos DB product boundaries and uses humanizer only to make evidence concise and neutral; humanizer cannot change verdicts, confidence, indexes, URLs, or JSON structure.

Each run creates a proposal from `main` on a new branch. Rejection commits therefore remain in the draft PR where the reviewer made them and cannot be erased by a later scheduled run.

## Required repository configuration

The maintenance workflows use the built-in Actions `GITHUB_TOKEN`; they require no authentication secrets.

| Job | Scoped access |
| --- | --- | --- |
| Scheduled/manual audit | Contents write, Issues write, Pull requests read, Copilot requests write |
| Pull-request validation | Contents read, Pull requests read |
| Review-command application | Contents write, Pull requests write |

Keep the repository default workflow permission read-only. Write permissions are granted only to jobs that publish or revise a proposal branch. The workflows never create, approve, or merge pull requests.

### Enable the required repository settings

An `AzureCosmosDB` owner or repository administrator must:

1. Open **Settings > Actions > General > Workflow permissions**.
2. Keep **Read repository contents and packages permissions** as the default.
3. Keep **Allow GitHub Actions to create and approve pull requests** disabled, as required by enterprise policy.
4. Confirm the organization enables **Allow use of Copilot CLI billed to the organization**.

The job-scoped `permissions` blocks remain the source of least privilege. Do not add a PAT, GitHub App private key, or publisher secret as a fallback.

Validate the configuration by manually running **Audit gallery content**: classification must report `complete`, and an eligible proposal must publish an automation branch, compare link, and unassigned issue.

### Assign the proposal to Copilot

When a run publishes eligible catalog changes, review the unassigned issue and compare link from its job summary. If the proposal is ready, assign the issue to Copilot. The issue instructs Copilot to reproduce the validated catalog diff, run the focused tests and build, and create a draft pull request to `main`.

Select PR reviewers according to the team's current ownership and rotation; no individual reviewer is hardcoded. GitHub sends review-request notifications through each selected reviewer's configured channels.

### Initial enablement

An organization owner or repository administrator must complete these steps after this pull request is merged:

1. Approve GitHub Actions for the repository and allow the pinned actions used by the gallery workflows.
2. Keep default workflow permissions read-only and keep Actions-created pull requests disabled.
3. Confirm **Allow use of Copilot CLI billed to the organization** is enabled.
4. Create and keep an active `Protect main` ruleset enabled with at least one approving review, stale approval dismissal, approval after the latest push, and required resolution of review threads. The audit job verifies these settings and fails before promotion when they are absent. Neither token needs permission to bypass it.
5. Open **Actions > Audit gallery content**, choose **Run workflow**, and review the artifact, proposal branch, compare link, and unassigned issue from the first complete run.
6. In **Settings > Pages**, change **Build and deployment > Source** from the legacy `gh-pages` branch to **GitHub Actions**. The updated deployment workflow does not use `GH_PAT` and does not push generated files to a branch.
7. Merge a normal documentation-only pull request and confirm **Deploy to GitHub Pages** publishes `main` to `https://azurecosmosdb.github.io/gallery/`.

The workflow uses `${{ github.repository }}` and the checked-out `origin`; it does not contain a personal fork name or a personal GitHub Pages URL.

The automatic maintenance schedule has one cron entry: Monday at 06:17 UTC. `workflow_dispatch` remains available only for explicit setup, recovery, and verification runs; it does not add another automatic run.

## Human review

The draft PR is the publication boundary. Automation never approves or merges it.

The PR body assigns stable review IDs:

- `A1`, `A2`, and so on for additions;
- `U1`, `U2`, and so on for canonical URL updates;
- `R1`, `R2`, and so on for retirements; and
- `S1`, `S2`, and so on for skipped high-confidence additions.

A repository user with write access can reject one or more proposed changes by opening **Actions > Apply gallery review command > Run workflow**, entering the draft pull request number, and supplying comma-separated proposal IDs:

```text
A2, U1, R1
```

GitHub permits manual workflow dispatch only for users with repository write access. The workflow removes `A<n>` additions, restores the previous URL for `U<n>` updates, and restores `R<n>` retirements. It validates the revised catalogs and static build before pushing the new proposal. IDs must come from the current PR body; unknown or stale IDs fail closed.

Before merging the draft:

1. compare every numbered item with the actual base-to-head catalog diff;
2. open each source and confirm it is the intended canonical resource;
3. verify descriptions are complete plain text and do not contain encoded entities;
4. require strong deterministic evidence for every retirement;
5. inspect each retirement's audit outcome, HTTP status, observed destination, reason codes, criteria, and replacement URL;
6. confirm no live source also appears in `static/retired-templates.json`;
7. confirm Microsoft documentation URLs are canonical and do not contain locale path segments such as `/en-us/`;
8. require green CI and resolve review comments; and
9. merge only through the repository's normal protected-branch process.

Catalog changes are published only after the draft PR is merged and the existing Pages workflow succeeds.

## Reports and artifacts

Each maintenance run uploads `gallery-content-review-<run-id>` containing:

- `audit-report.json` and `audit-summary.md`;
- `article-candidates.json` and `article-candidates.md` (legacy filenames containing all supported content types);
- `run-metadata.json`; and
- when classification completes, `promotion-result.json` and `promotion-summary.md`.

`run-metadata.json` is authoritative for run completeness. Do not treat a run as complete when a source is partial, classification is skipped or incomplete, or no promotion result exists.

## Failure handling

| Condition | Expected behavior | Maintainer action |
| --- | --- | --- |
| One source times out, rate limits, truncates, or returns malformed data | Source and run are marked partial; no promotion | Inspect the artifact, retry later, then fix or disable the source if persistent |
| Copilot organization policy blocks Actions | Classification is incomplete; existing draft is preserved | Enable organization-billed Copilot CLI use and rerun manually |
| Copilot output fails schema validation twice | Classification is incomplete; existing draft is preserved | Inspect captured diagnostics and rerun after correcting the prompt or CLI issue |
| Promotion produces no catalog diff | No branch or issue is published | Confirm the latest complete artifact contains no eligible changes |
| Proposal issue creation returns 403 | The proposal branch remains available without an issue | Verify the audit job has job-scoped Issues write permission |
| Build or tests fail | No branch or PR mutation | Fix on a normal reviewed PR, then rerun maintenance |
| Generated metadata is malformed | Do not merge the draft | Fix the ingestion or validation rule, regenerate from `main`, and review again |
| A review-command dispatch fails | Catalogs and PR body remain unchanged | Use the current PR number and IDs from its latest body; confirm the initiating user has repository write access |
| Branch push returns 403 | Publication fails without changing `main` | Verify the audit job has job-scoped Contents write permission |
| Review-command PR update returns 403 | The proposal remains unchanged | Verify the review-command job has job-scoped Contents and Pull requests write permissions |
| Copilot CLI authentication fails | Classification is incomplete; existing draft is preserved | Verify organization-billed Copilot CLI use is enabled and rerun manually |
| A localized Microsoft Learn URL is committed manually | Tests fail with `localized Microsoft documentation URL` | Remove the locale path segment, for example change `/en-us/azure/cosmos-db/...` to `/azure/cosmos-db/...` |

## Rollback and disablement

To pause maintenance without affecting the published gallery, disable `Audit gallery content` in the Actions UI. The site and existing catalog continue to work.

To discard a generated proposal:

1. close the unassigned proposal issue or Copilot-created draft pull request without merging;
2. delete the associated `automation/gallery-content-updates-<run-id>-<attempt>` branch; and
3. rerun the workflow when the underlying issue is fixed.

Every run starts a new branch from current `main`, so earlier proposal and rejection history remains intact. If a catalog PR was merged incorrectly, revert that catalog PR through the normal protected-branch process; do not force-push `main`.

## Local validation

```shell
npm ci
npm run test:gallery-audit
npm run gallery:audit:fixtures
npm run build
```

Live deterministic discovery can be run with `npm run gallery:audit`. It uses public endpoints and may be affected by network availability and rate limits. Copilot classification accepts `COPILOT_GITHUB_TOKEN`, `GH_TOKEN`, or `GITHUB_TOKEN` in precedence order and should not be run with broad tool permissions.

## Configuration changes

- Edit `.github/gallery-audit/sources.json` to add, disable, or tune an approved source.
- Edit `.github/gallery-audit/policy.json` for global request, concurrency, lookback, and candidate limits.
- Edit `.github/gallery-audit/relevance-prompt.md` only through a reviewed PR with fixture and classification tests.
- Update the pinned Copilot CLI version only after a successful manual run and review of its generated proposal.

The Copilot CLI version is pinned in `.github/workflows/audit-gallery-content.yml`. A version update must include passing tests and fixtures, a successful manual workflow run, and review of the complete generated draft before the pin is merged.

## Documentation maintenance requirements

Keep the documentation in the same pull request as an operational change:

- update this runbook when workflow permissions, secrets, schedules, branch names, review commands, failure behavior, or tool versions change;
- update `docs/content-source-policy.md` when source eligibility, allowlists, product scope, canonical URL rules, or retirement evidence changes;
- update `Contributing.md` when contributor validation or catalog review requirements change; and
- update `README.md` when local setup, deployment, or the high-level maintenance workflow changes.

See [Content source policy](./content-source-policy.md) for source eligibility and approval requirements.
