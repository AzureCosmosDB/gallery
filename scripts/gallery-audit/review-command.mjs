import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { markdownText, proposalCardDetails, proposalItem, retirementProof, sortCatalogForPublishing } from './promotion.mjs';

const ITEM_PATTERN = /<!-- gallery-item:([A-Za-z0-9_-]+) -->/g;

export function parseProposal(body) {
  const items = new Map();
  for (const match of body.matchAll(ITEM_PATTERN)) {
    const item = JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8'));
    if (!/^[AUR]\d+$/.test(item.id) || !['Add', 'Update', 'Retire'].includes(item.action)
      || typeof item.title !== 'string' || typeof item.url !== 'string'
      || (item.previousUrl !== null && typeof item.previousUrl !== 'string') || items.has(item.id)) {
      throw new Error('Invalid structured proposal item.');
    }
    items.set(item.id, item);
  }
  return items;
}

export function parseRejectCommand(comment) {
  const values = [];
  for (const match of comment.matchAll(/^\s*(?:@\S+\s+)?Reject\s*:\s*(.+)$/gim)) {
    values.push(...match[1].split(/[\s,]+/).filter(Boolean));
  }
  if (values.length === 0) throw new Error('Use `Reject: A1, U1, R1` with IDs from the current PR body.');
  const invalid = values.filter((value) => !/^[AUR]\d+$/.test(value));
  if (invalid.length > 0) throw new Error(`Invalid item ID: ${invalid.join(', ')}. Use IDs such as A1, U1, or R1.`);
  return [...new Set(values)];
}

function stripRetirementMetadata(entry) {
  const { retiredAt, retirementReason, replacementUrl, retirementEvidence, ...liveEntry } = entry;
  return liveEntry;
}

function catalogIdentity(entry) {
  const { source, ...metadata } = stripRetirementMetadata(entry);
  return JSON.stringify(metadata);
}

export function applyRejections({ baseCatalog, liveCatalog, retiredCatalog, proposal, rejectedIds }) {
  const live = liveCatalog.map((entry) => ({ ...entry }));
  const retired = retiredCatalog.map((entry) => ({ ...entry }));
  const unknown = rejectedIds.filter((id) => !proposal.has(id));
  if (unknown.length > 0) throw new Error(`Unknown or stale item ID: ${unknown.join(', ')}. Refresh the PR and use its current IDs.`);

  for (const id of rejectedIds) {
    const item = proposal.get(id);
    if (item.action === 'Add') {
      const index = live.findIndex((entry) => entry.source === item.url);
      if (index < 0) throw new Error(`${id} no longer matches an added catalog entry.`);
      live.splice(index, 1);
    } else if (item.action === 'Update') {
      if (!item.previousUrl) throw new Error(`${id} is missing its previous URL.`);
      const entry = live.find((candidate) => candidate.source === item.url);
      if (!entry) throw new Error(`${id} no longer matches an updated catalog entry.`);
      entry.source = item.previousUrl;
    } else {
      const index = retired.findIndex((entry) => entry.source === item.url);
      if (index < 0) throw new Error(`${id} no longer matches a retired catalog entry.`);
      const [entry] = retired.splice(index, 1);
      if (!live.some((candidate) => candidate.source === entry.source)) {
        live.push(stripRetirementMetadata(entry));
      }
    }
  }
  const baseOrder = new Map(baseCatalog.map((entry, index) => [entry.source, index]));
  const additions = live.filter((entry) => !baseOrder.has(entry.source));
  const existing = live
    .filter((entry) => baseOrder.has(entry.source))
    .sort((left, right) => baseOrder.get(left.source) - baseOrder.get(right.source));
  return { liveCatalog: sortCatalogForPublishing([...additions, ...existing]), retiredCatalog: retired };
}

export function summarizeCatalogDiff({ baseCatalog, catalog, baseRetiredCatalog, retiredCatalog, generatedAt }) {
  const baseSources = new Set(baseCatalog.map((entry) => entry.source));
  const catalogSources = new Set(catalog.map((entry) => entry.source));
  const baseRetiredSources = new Set(baseRetiredCatalog.map((entry) => entry.source));
  const unmatchedBase = baseCatalog.filter((entry) => !catalogSources.has(entry.source));
  const unmatchedCatalog = catalog.filter((entry) => !baseSources.has(entry.source));
  const updates = [];
  const additions = [];
  for (const entry of unmatchedCatalog) {
    const identity = catalogIdentity(entry);
    const previousIndex = unmatchedBase.findIndex((candidate) => catalogIdentity(candidate) === identity);
    if (previousIndex < 0) additions.push(entry);
    else {
      const [previous] = unmatchedBase.splice(previousIndex, 1);
      updates.push({ title: entry.title, previousUrl: previous.source, url: entry.source });
    }
  }
  const retirements = retiredCatalog.filter((entry) => !baseRetiredSources.has(entry.source));
  const removedWithoutRetirement = unmatchedBase.filter((entry) => !retirements.some((retired) => retired.source === entry.source));
  if (removedWithoutRetirement.length > 0) throw new Error(`Catalog entries were removed without retirement records: ${removedWithoutRetirement.map((entry) => entry.title).join(', ')}`);
  return [
    '# Automated gallery content update', '',
    `Generated: ${generatedAt}`, '',
    'Comment with item IDs to request changes, for example: `Reject: A1, U1, R1`.', '',
    `Additions: ${additions.length}`, '',
    ...additions.flatMap((entry, index) => [
      ...proposalItem(`A${index + 1}`, 'Add', entry),
      ...proposalCardDetails(entry),
    ]),
    '', `URL updates: ${updates.length}`, '',
    ...updates.flatMap((entry, index) => proposalItem(`U${index + 1}`, 'Update', { title: entry.title, source: entry.url }, entry.previousUrl)),
    '', `Retirements: ${retirements.length}`, '',
    ...retirements.flatMap((entry, index) => [
      ...proposalItem(`R${index + 1}`, 'Retire', entry, null, `: ${markdownText(entry.retirementReason)}`),
      ...retirementProof(entry),
    ]),
    '', 'This pull request remains a draft and requires human approval before merge.', '',
  ].join('\n');
}

function run() {
  const required = ['REVIEW_COMMAND', 'PR_BODY', 'BASE_CATALOG_PATH', 'CATALOG_PATH', 'BASE_RETIRED_PATH', 'RETIRED_PATH', 'SUMMARY_PATH', 'RESULT_PATH'];
  for (const name of required) if (!process.env[name]) throw new Error(`Missing ${name}`);
  try {
    const proposal = parseProposal(process.env.PR_BODY);
    const rejectedIds = parseRejectCommand(process.env.REVIEW_COMMAND);
    const baseCatalog = JSON.parse(fs.readFileSync(process.env.BASE_CATALOG_PATH, 'utf8'));
    const liveCatalog = JSON.parse(fs.readFileSync(process.env.CATALOG_PATH, 'utf8'));
    const baseRetiredCatalog = JSON.parse(fs.readFileSync(process.env.BASE_RETIRED_PATH, 'utf8'));
    const retiredCatalog = JSON.parse(fs.readFileSync(process.env.RETIRED_PATH, 'utf8'));
    const applied = applyRejections({ baseCatalog, liveCatalog, retiredCatalog, proposal, rejectedIds });
    fs.writeFileSync(process.env.CATALOG_PATH, `${JSON.stringify(applied.liveCatalog, null, 2)}\n`);
    fs.writeFileSync(process.env.RETIRED_PATH, `${JSON.stringify(applied.retiredCatalog, null, 2)}\n`);
    fs.writeFileSync(process.env.SUMMARY_PATH, summarizeCatalogDiff({
      baseCatalog,
      catalog: applied.liveCatalog,
      baseRetiredCatalog,
      retiredCatalog: applied.retiredCatalog,
      generatedAt: new Date().toISOString(),
    }));
    fs.writeFileSync(process.env.RESULT_PATH, JSON.stringify({ status: 'applied', rejectedIds }));
  } catch (error) {
    fs.writeFileSync(process.env.RESULT_PATH, JSON.stringify({ status: 'error', message: error.message }));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();