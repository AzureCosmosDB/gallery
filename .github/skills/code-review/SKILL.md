---
name: code-review
description: Review gallery pull requests for correctness, security, automation safety, catalog integrity, and missing tests. Use for GitHub Copilot code review in this repository.
owner: jagord
created: 2026-09-19
---

# Code review

## Use This When

Reviewing a pull request that changes the gallery application, GitHub Actions workflows, discovery and promotion automation, or catalog content.

## Review Priorities

Review in this order:

1. Behavioral defects and regressions.
2. Security risks, credential exposure, unsafe redirects, untrusted-input handling, and excessive permissions.
3. Automation that can merge, deploy, publish, or mutate `main` without explicit human approval.
4. Incomplete scans, silent truncation, nondeterministic ordering, duplicate content, and summaries that disagree with the actual PR diff.
5. Missing focused tests for changed behavior and failure paths.

Do not report style preferences, naming opinions, formatting differences, or speculative improvements unless they create a concrete correctness or maintenance risk.

## Repository Invariants

- The gallery remains a static Docusaurus site deployed through GitHub Pages.
- Maintenance automation mutates only the repository where its workflow runs. Treat external repositories as read-only.
- Validated catalog proposals remain in unassigned issues until a maintainer records decisions and assigns the issue to Copilot. Only Copilot creates the draft pull request branch; automation must never create, approve, merge, or enable automerge.
- Discovery uses exact allowlisted public sources, bounded requests, deterministic validation, canonical URL deduplication, and explicit content types.
- GitHub discovery accepts only public repositories under approved owners. Authentication must never cross to a different host during redirects.
- Microsoft Learn discovery stays within the approved Azure Cosmos DB product tree.
- Partial, malformed, rate-limited, truncated, or otherwise incomplete discovery must not be reported as complete or promoted.
- Copilot output is untrusted until strict schema and authoritative-index validation succeeds.
- Age or inactivity alone is not retirement evidence.
- Maintenance PR summaries must match the cumulative catalog diff against `main`. Every proposed addition, retirement, and skipped item must have an unambiguous `A<n>`, `R<n>`, or `S<n>` identifier.
- Content publication requires human review and merge.

## Catalog Review

For changes to `static/templates.json` or `static/retired-templates.json`:

1. Compare the complete base-to-head diff, not only the latest commit.
2. Confirm each addition has a unique canonical source URL, required metadata, a valid catalog content type, and direct Azure Cosmos DB value.
3. Confirm each retirement has strong deterministic evidence and preserves the original record plus retirement metadata.
4. Check that the generated PR body counts and numbered items match the actual additions and retirements.
5. Flag accidental removals, duplicated resources, unsupported tags, generated marketing copy, or unrelated catalog rewrites.

## Workflow Review

For GitHub Actions and automation changes:

1. Verify least-privilege permissions and that checkout credentials are not exposed to pull request code.
2. Verify secrets are available only to the step that needs them and are never logged or forwarded across hosts.
3. Verify pull request validation cannot execute promotion, publication, deployment, or branch mutation.
4. Verify branch updates use safe, explicit refs and that force pushes are lease-protected.
5. Verify failed or partial source processing cannot produce a misleading successful promotion.

## Finding Format

Report only actionable findings. For each finding include:

- Severity: critical, high, medium, or low.
- A concise defect statement.
- The affected file and line.
- The concrete failure mode or user impact.
- The smallest reasonable correction.

Order findings by severity. If there are no actionable findings, say so explicitly and mention only meaningful residual test gaps.

## Quality Gates

Before completing the review:

- Every finding is grounded in changed code or a directly affected contract.
- Security and automation findings describe a reachable failure mode.
- Catalog findings are checked against the cumulative PR diff.
- Suggested fixes preserve the static architecture and human approval boundary.
- No style-only or duplicate findings are included.
