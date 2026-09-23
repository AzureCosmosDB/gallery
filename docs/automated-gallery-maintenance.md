# Automated gallery maintenance

This repository uses a scheduled GitHub Actions workflow to audit the published catalog, discover new Azure Cosmos DB resources, classify candidates, and open a draft catalog update pull request for human review.

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
7. open a new draft maintenance pull request without rewriting an earlier review branch; and
8. upload the complete review bundle for 30 days.

Before classification, the workflow installs the Azure Cosmos DB Agent Kit's `cosmosdb-best-practices` skill from a pinned commit and verifies its SHA-256 checksum. The repository includes a focused `humanizer` skill. A preflight check requires Copilot CLI to discover both skills, and classification explicitly enables skill retrieval. The curator uses Agent Kit guidance to enforce current Cosmos DB product boundaries and uses humanizer only to make evidence concise and neutral; humanizer cannot change verdicts, confidence, indexes, URLs, or JSON structure.

Each run creates a proposal from `main` on a new branch. Rejection commits therefore remain in the draft PR where the reviewer made them and cannot be erased by a later scheduled run.

## Required repository configuration

Create these Actions secrets before enabling scheduled promotion:

| Secret | Purpose | Minimum access |
| --- | --- | --- |
| `COPILOT_GITHUB_TOKEN` | Authenticates the pinned GitHub Copilot CLI used for classification | Active Copilot subscription, Copilot Requests account permission, public repository access only |
| `GALLERY_UPDATE_TOKEN` | Authorizes review commenters, pushes the automation branch, and creates or edits its draft PR | Fine-grained repository token with Administration read, Contents read/write, and Pull requests read/write |

Use a maintained automation identity where organizational policy permits. Record the owner and rotation date outside the repository. Rotate either token immediately when its owner changes or access is suspected to be compromised.

The workflow's normal `GITHUB_TOKEN` remains read-only. Write credentials are exposed only to the final draft-PR publication step.

### Create the required tokens

Create two separate fine-grained personal access tokens. They cannot be combined because **Copilot Requests** is available only when the token's resource owner is the user's personal account, while catalog publication needs repository permissions under the `AzureCosmosDB` organization.

#### Create `COPILOT_GITHUB_TOKEN`

Use a maintained automation identity that has an active GitHub Copilot subscription and is allowed to use Copilot CLI by the organization or enterprise policy.

1. Sign in as the automation identity and open **Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**, or open the [fine-grained token form](https://github.com/settings/personal-access-tokens/new).
2. Set a descriptive name such as `AzureCosmosDB gallery Copilot classification` and choose the shortest practical expiration allowed by policy.
3. For **Resource owner**, select the automation identity's **personal account**, not `AzureCosmosDB`.
4. For **Repository access**, select **Public repositories**. Classification reads only this public repository and does not need repository write access.
5. Under **Permissions > Account permissions**, add **Copilot Requests**. Do not add repository or organization write permissions.
6. Generate the token and copy it immediately; GitHub displays the value only once.

Copilot requests consume the token owner's Copilot premium-request allowance. The token fails if that identity loses its Copilot subscription or if Copilot CLI is disabled by organization or enterprise policy.

#### Create `GALLERY_UPDATE_TOKEN`

Use a maintained automation identity that is a member of `AzureCosmosDB` and has permission to create branches and pull requests in `AzureCosmosDB/gallery`.

1. From the same fine-grained token page, select **Generate new token**.
2. Set a descriptive name such as `AzureCosmosDB gallery maintenance publisher` and choose the shortest practical expiration allowed by policy.
3. For **Resource owner**, select **AzureCosmosDB**.
4. If prompted, enter a justification describing the weekly gallery-maintenance draft pull request workflow.
5. For **Repository access**, select **Only select repositories**, then select **gallery**.
6. Under **Repository permissions**, grant only:
   - **Administration: Read-only**
   - **Contents: Read and write**
   - **Pull requests: Read and write**
7. Leave all other repository and organization permissions at their defaults. Administration read is used only to verify that a review-command commenter has write, maintain, or admin access. The token does not need Actions, Workflows, Pages, or permission to bypass branch protection.
8. Generate the token and copy it immediately.
9. If organization policy marks it `pending`, an `AzureCosmosDB` owner must approve it before the workflow can publish a branch or draft pull request. Until approval, it can read only public resources.

#### Add the repository secrets

An administrator with repository write access must add both values to `AzureCosmosDB/gallery`:

1. Open **Settings > Secrets and variables > Actions > Secrets**.
2. Select **New repository secret**.
3. Add the Copilot token with the exact name `COPILOT_GITHUB_TOKEN`.
4. Add the publisher token with the exact name `GALLERY_UPDATE_TOKEN`.
5. Never paste either value into an issue, pull request, workflow input, command argument, or log.

GitHub CLI can install the secrets without exposing them in shell history; each command prompts for the value:

```shell
gh secret set COPILOT_GITHUB_TOKEN --repo AzureCosmosDB/gallery
gh secret set GALLERY_UPDATE_TOKEN --repo AzureCosmosDB/gallery
gh secret list --repo AzureCosmosDB/gallery
```

`gh secret list` confirms only that the names exist. Validate the values by manually running **Audit gallery content**: classification must report `complete`, and an eligible proposal must be able to create or update the draft maintenance pull request.

### Configure the new-PR email notification

When the weekly run creates a maintenance pull request, it requests a review from `jagord_microsoft`. GitHub sends that review-request notification through the account's configured notification channels.

To route the email to `jagord@microsoft.com`:

1. Sign in to GitHub as `jagord_microsoft` and verify `jagord@microsoft.com` under **Settings > Emails**.
2. Open **Settings > Notifications** and enable **Email** for participating and review-request notifications.
3. Under organization email routing, route notifications for `AzureCosmosDB` to `jagord@microsoft.com`.
4. After the first generated PR, confirm that `jagord_microsoft` appears under **Reviewers** and that the review-request email arrived.

This uses GitHub's notification system and requires no SMTP credentials or mail-service secret in the repository.

### Initial enablement

An organization owner or repository administrator must complete these steps after this pull request is merged:

1. Approve GitHub Actions for the repository and allow the pinned actions used by the gallery workflows.
2. Create and install `COPILOT_GITHUB_TOKEN` and `GALLERY_UPDATE_TOKEN` by following the preceding token procedures. Confirm the organization-owned publisher token is approved before the first run.
3. Confirm the automation identity can use GitHub Copilot CLI and can create branches and pull requests in `AzureCosmosDB/gallery`.
4. Create and keep an active `Protect main` ruleset enabled with at least one approving review, stale approval dismissal, approval after the latest push, and required resolution of review threads. The audit job verifies these settings and fails before promotion when they are absent. Neither token needs permission to bypass it.
5. Configure `jagord_microsoft` to route `AzureCosmosDB` review-request notifications to `jagord@microsoft.com`.
6. Open **Actions > Audit gallery content**, choose **Run workflow**, and review the artifact and draft pull request from the first complete run.
7. In **Settings > Pages**, change **Build and deployment > Source** from the legacy `gh-pages` branch to **GitHub Actions**. The updated deployment workflow does not use `GH_PAT` and does not push generated files to a branch.
8. Merge a normal documentation-only pull request and confirm **Deploy to GitHub Pages** publishes `main` to `https://azurecosmosdb.github.io/gallery/`.

The workflow uses `${{ github.repository }}` and the checked-out `origin`; it does not contain a personal fork name or a personal GitHub Pages URL.

The automatic maintenance schedule has one cron entry: Monday at 06:17 UTC. `workflow_dispatch` remains available only for explicit setup, recovery, and verification runs; it does not add another automatic run.

## Human review

The draft PR is the publication boundary. Automation never approves or merges it.

The PR body assigns stable review IDs:

- `A1`, `A2`, and so on for additions;
- `U1`, `U2`, and so on for canonical URL updates;
- `R1`, `R2`, and so on for retirements; and
- `S1`, `S2`, and so on for skipped high-confidence additions.

A repository owner, member, or collaborator can reject one or more proposed changes with one comment:

```text
Reject: A2, U1, R1
```

The comment workflow removes `A<n>` additions, restores the previous URL for `U<n>` updates, and restores `R<n>` retirements. It validates the revised catalogs and static build before pushing the new proposal. IDs must come from the current PR body; unknown or stale IDs fail closed.

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
| Copilot token is missing | Classification is skipped; existing draft is preserved | Restore the secret and rerun manually |
| Copilot output fails schema validation twice | Classification is incomplete; existing draft is preserved | Inspect captured diagnostics and rerun after correcting the prompt or CLI issue |
| Promotion produces no catalog diff | No branch or draft pull request is published | Confirm the latest complete artifact contains no eligible changes |
| Build or tests fail | No branch or PR mutation | Fix on a normal reviewed PR, then rerun maintenance |
| Generated metadata is malformed | Do not merge the draft | Fix the ingestion or validation rule, regenerate from `main`, and review again |
| A `Reject:` comment fails | Catalogs and PR body remain unchanged | Use IDs from the latest PR body and confirm the commenter is an owner, member, or collaborator |
| Push or PR update returns 403 | Publication fails without changing `main` | Verify `GALLERY_UPDATE_TOKEN` has Contents and Pull requests read/write access and organization approval |
| Copilot CLI authentication fails | Classification is incomplete; existing draft is preserved | Verify the token owner still has Copilot access, rotate `COPILOT_GITHUB_TOKEN`, and rerun manually |
| A localized Microsoft Learn URL is committed manually | Tests fail with `localized Microsoft documentation URL` | Remove the locale path segment, for example change `/en-us/azure/cosmos-db/...` to `/azure/cosmos-db/...` |

## Rollback and disablement

To pause maintenance without affecting the published gallery, disable `Audit gallery content` in the Actions UI. The site and existing catalog continue to work.

To discard a generated proposal:

1. close the draft maintenance pull request without merging;
2. close unwanted maintenance pull requests and delete their `automation/gallery-content-updates-<run-id>-<attempt>` branches; and
3. rerun the workflow when the underlying issue is fixed.

Every run starts a new branch from current `main`, so earlier proposal and rejection history remains intact. If a catalog PR was merged incorrectly, revert that catalog PR through the normal protected-branch process; do not force-push `main`.

## Local validation

```shell
npm ci
npm run test:gallery-audit
npm run gallery:audit:fixtures
npm run build
```

Live deterministic discovery can be run with `npm run gallery:audit`. It uses public endpoints and may be affected by network availability and rate limits. Copilot classification requires `COPILOT_GITHUB_TOKEN` and should not be run with broad tool permissions.

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
