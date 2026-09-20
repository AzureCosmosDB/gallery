# Content source policy

Automated discovery queries only sources listed in `.github/gallery-audit/sources.json`. Adding a URL to the catalog does not automatically approve its publisher for recurring discovery.

## Eligibility

A source is eligible when it:

- regularly publishes substantive Azure Cosmos DB technical content;
- provides a stable public feed, channel, organization-scoped API query, or bounded documentation index;
- has identifiable publisher ownership and provenance;
- supplies enough metadata to evaluate title, date, author, description, and canonical URL;
- permits deterministic availability and allowlist checks; and
- fits an existing catalog content type: `example`, `video`, `documentation`, or `blog`.

First-party Microsoft sources may use the `first-party` trust tier. Community sources require prior maintainer review and use `reviewed-community`.

## Source proposal requirements

A source change pull request must include:

1. a stable unique source ID;
2. source kind and exact endpoint;
3. allowed hostnames and, for GitHub, allowed owners;
4. trust tier and publisher identity;
5. lookback window and per-source candidate cap;
6. inclusion terms when the source is not Cosmos DB specific;
7. complete catalog defaults when candidates may be promoted;
8. fixture or parser tests for a new source kind; and
9. evidence that the endpoint returns public, reviewable metadata.

New community sources should be committed with `enabled: false` until a maintainer approves recurring collection.

## Exclusions

Do not automate discovery from:

- unrestricted web searches or crawls;
- social timelines;
- private or internal repositories;
- endpoints requiring secrets beyond the workflow's documented GitHub and Copilot credentials;
- generic publisher feeds with no reliable Azure Cosmos DB signal;
- pay-to-publish or unverifiable promotional sources; or
- sources that prohibit bounded automated access.

## Candidate requirements

A candidate may be proposed only when:

- its canonical URL remains on the source allowlist;
- its date is valid, not in the future, and within the source lookback window;
- it is not already present in the live or retired catalogs;
- its metadata is complete plain text without malformed URLs or encoded feed entities;
- Azure Cosmos DB is central rather than incidental; and
- it passes source-specific checks.

GitHub candidates must be public, active, non-fork repositories under an approved owner. Microsoft Learn candidates must remain within the approved Azure Cosmos DB documentation tree. YouTube candidates must originate from an approved channel and resolve through oEmbed.

## Canonical Microsoft documentation URLs

Published catalog URLs must not contain a locale path segment such as `/en-us/`, `/fr-fr/`, or `/ja-jp/`. Use locale-neutral URLs so readers receive the appropriate localized experience and equivalent pages do not appear as duplicates. For example:

```text
https://learn.microsoft.com/azure/cosmos-db/partitioning-overview
```

The Learn Search request may use a `locale` query parameter to obtain English metadata, but that parameter is not copied into catalog item URLs. Discovery removes locale path segments from `learn.microsoft.com` results, and catalog validation rejects localized Microsoft Learn or legacy `docs.microsoft.com` URLs in live and retired records.

## Retirement requirements

Age, inactivity, or a duplicate signal alone does not justify retirement.

Automatic retirement proposals require both:

- a high-confidence `retire-proposed` classification; and
- strong deterministic evidence such as a confirmed missing URL, archived or disabled repository, or known retired product term.

Azure DocumentDB is outside this gallery's product scope. A direct Azure DocumentDB resource or a legacy Cosmos DB URL that now resolves to Azure DocumentDB is excluded from discovery and may be proposed for retirement with `excluded-product` evidence. It must not be converted into a live URL update.

The retired record must preserve the original catalog metadata plus retirement time, reason, evidence, and a valid replacement URL when one is known.

## Review and removal

Review enabled sources at least quarterly. Disable a source when its ownership changes, endpoint becomes unreliable, metadata quality degrades, or its content no longer matches the gallery.

Disabling a source stops future discovery. It does not remove existing catalog entries. Existing entries follow the normal evidence-backed retirement process.
