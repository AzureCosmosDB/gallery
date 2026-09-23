import fs from 'node:fs/promises';
import path from 'node:path';
import { validateCatalog } from './core.mjs';
import { normalizeUrl, urlFingerprint } from './normalize.mjs';

const STRONG_RETIREMENT_REASONS = new Set([
  'github-archived',
  'github-disabled',
  'known-retired-term',
  'excluded-product',
]);

export function strongRetirementEvidence(entry) {
  const duplicate = (entry.duplicates?.exact?.length ?? 0) > 0 || (entry.duplicates?.normalized?.length ?? 0) > 0;
  return !duplicate && (entry.outcome === 'broken'
    || entry.reasonCodes.some((reason) => STRONG_RETIREMENT_REASONS.has(reason)));
}

function buildCatalogEntry(candidate, source) {
  const defaults = source.catalogDefaults;
  if (!defaults || !candidate.summary?.trim()) return null;
  const author = candidate.author?.trim() || defaults.author;
  if (!author || !defaults.website || !Array.isArray(defaults.tags) || defaults.tags.length === 0) return null;
  return {
    title: candidate.title.trim(),
    description: candidate.summary.trim(),
    preview: defaults.preview ?? 'coming soon',
    website: defaults.website,
    author,
    source: candidate.url,
    date: candidate.publishedAt.slice(0, 10),
    tags: [...defaults.tags],
  };
}

export function sortCatalogForPublishing(catalog) {
  return [...catalog].sort((left, right) => String(right.date ?? '').localeCompare(String(left.date ?? '')));
}

export function maintenanceText(value, fallback = '**MISSING**') {
  const text = String(value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

export function markdownText(value, fallback) {
  const text = maintenanceText(value, '');
  return text ? text.replace(/([\\`*_[\]<>])/g, '\\$1') : (fallback ?? '');
}

function markdownUrl(value) {
  return `<${maintenanceText(value).replaceAll('>', '%3E')}>`;
}

export function proposalItem(id, action, entry, previousUrl = null, suffix = '') {
  const url = entry.source ?? entry.url;
  const metadata = Buffer.from(JSON.stringify({ id, action, title: entry.title, url, previousUrl })).toString('base64url');
  const line = `- **${id}** ${action} [${markdownText(entry.title)}](${markdownUrl(url)})${previousUrl ? ` from ${markdownUrl(previousUrl)}` : ''}${suffix}`;
  return [`<!-- gallery-item:${metadata} -->`, line];
}

export function proposalCardDetails(entry) {
  return [
    `  - Description: ${markdownText(entry.description, '**MISSING**')}`,
    `  - Author: ${markdownText(Array.isArray(entry.author) ? entry.author.join(', ') : entry.author, '**MISSING**')}`,
    `  - Date: ${markdownText(entry.date, '**MISSING**')}`,
    `  - Tags: ${markdownText(entry.tags?.length ? entry.tags.join(', ') : null, '**MISSING**')}`,
    `  - Website: ${markdownText(entry.website, '**MISSING**')}`,
    `  - Preview: ${markdownText(entry.preview, '**MISSING**')}`,
    `  - Source: ${markdownText(entry.source, '**MISSING**')}`,
  ];
}

export function retirementProof(entry) {
  const evidence = entry.retirementEvidence ?? {};
  return [
    `  - Reason: ${markdownText(entry.retirementReason)}`,
    `  - Audit outcome: ${markdownText(evidence.auditOutcome)}`,
    `  - HTTP status: ${markdownText(evidence.httpStatus)}`,
    `  - Observed destination: ${markdownText(evidence.finalUrl)}`,
    `  - Replacement URL: ${markdownText(entry.replacementUrl, '**NONE**')}`,
    `  - Reason codes: ${markdownText(evidence.reasonCodes?.join(', '))}`,
    `  - Criteria: ${markdownText(evidence.criteria?.join(', '))}`,
  ];
}

export function planCatalogPromotion({ catalog, retiredCatalog, candidateReport, auditReport, sourcesDocument, policy, now = new Date() }) {
  const sourceById = new Map(sourcesDocument.sources.map((source) => [source.id, source]));
  const knownUrls = new Set([...catalog, ...retiredCatalog].map((entry) => urlFingerprint(entry.source, policy.trackingParameters)));
  const additions = [];
  const skippedAdditions = [];
  const updates = [];
  const updatedCatalog = catalog.map((entry) => ({ ...entry }));

  for (const auditEntry of auditReport.entries) {
    if (auditEntry.outcome !== 'redirected' || !auditEntry.finalUrl) continue;
    const original = updatedCatalog[auditEntry.catalogIndex];
    if (!original || original.source !== auditEntry.url) continue;
    let previousFingerprint;
    let finalFingerprint;
    let finalUrl;
    try {
      previousFingerprint = urlFingerprint(original.source, policy.trackingParameters);
      finalUrl = normalizeUrl(auditEntry.finalUrl, policy.trackingParameters);
      if (new URL(original.source).hostname.toLowerCase() !== new URL(finalUrl).hostname.toLowerCase()) continue;
      finalFingerprint = urlFingerprint(finalUrl, policy.trackingParameters);
    } catch {
      continue;
    }
    if (previousFingerprint === finalFingerprint) continue;
    if (knownUrls.has(finalFingerprint)) continue;
    const previousUrl = original.source;
    original.source = finalUrl;
    knownUrls.delete(previousFingerprint);
    knownUrls.add(finalFingerprint);
    updates.push({ title: original.title, previousUrl, url: original.source });
  }

  for (const candidate of candidateReport.candidates) {
    const classification = candidate.classification;
    if (classification?.verdict !== 'include' || classification.confidence !== 'high') continue;
    const fingerprint = urlFingerprint(candidate.url, policy.trackingParameters);
    const entry = buildCatalogEntry(candidate, sourceById.get(candidate.sourceId) ?? {});
    if (knownUrls.has(fingerprint)) {
      skippedAdditions.push({ url: candidate.url, reason: 'already-cataloged' });
    } else if (!entry) {
      skippedAdditions.push({ url: candidate.url, reason: 'missing-catalog-metadata' });
    } else {
      knownUrls.add(fingerprint);
      additions.push(entry);
    }
  }

  const retirements = [];
  const retirementIndexes = new Set();
  for (const auditEntry of auditReport.entries) {
    const classification = auditEntry.classification;
    if (classification?.verdict !== 'retire-proposed' || classification.confidence !== 'high' || !strongRetirementEvidence(auditEntry)) continue;
    const original = updatedCatalog[auditEntry.catalogIndex];
    if (!original || (original.source !== auditEntry.url && auditEntry.outcome !== 'redirected')) continue;
    retirementIndexes.add(auditEntry.catalogIndex);
    retirements.push({
      ...original,
      retiredAt: now.toISOString(),
      retirementReason: classification.evidence,
      replacementUrl: classification.relatedUrl,
      retirementEvidence: {
        auditOutcome: auditEntry.outcome,
        httpStatus: auditEntry.httpStatus,
        finalUrl: auditEntry.finalUrl,
        reasonCodes: [...auditEntry.reasonCodes],
        criteria: [...classification.criteria],
      },
    });
  }

  additions.sort((left, right) => right.date.localeCompare(left.date) || left.title.localeCompare(right.title));
  return {
    catalog: sortCatalogForPublishing([...additions, ...updatedCatalog.filter((_, index) => !retirementIndexes.has(index))]),
    retiredCatalog: [...retiredCatalog, ...retirements],
    additions,
    updates,
    retirements,
    skippedAdditions,
  };
}

export function promotionMarkdown(result, generatedAt) {
  const updates = result.updates ?? [];
  return [
    '# Automated gallery content update', '',
    `Generated: ${generatedAt}`, '',
    'Before assigning this issue to Copilot, comment with item IDs and decisions, for example: `Keep: A1, U1`, `Remove: A2, R1`, or `Change: U2 - use the canonical URL`.', '',
    `Additions: ${result.additions.length}`, '',
    ...result.additions.flatMap((entry, index) => [
      ...proposalItem(`A${index + 1}`, 'Add', entry),
      ...proposalCardDetails(entry),
    ]),
    '', `URL updates: ${updates.length}`, '',
    ...updates.flatMap((entry, index) => proposalItem(`U${index + 1}`, 'Update', { title: entry.title, source: entry.url }, entry.previousUrl)),
    '', `Retirements: ${result.retirements.length}`, '',
    ...result.retirements.flatMap((entry, index) => [
      ...proposalItem(`R${index + 1}`, 'Retire', entry, null, `: ${markdownText(entry.retirementReason)}`),
      ...retirementProof(entry),
    ]),
    '', `Skipped high-confidence additions: ${result.skippedAdditions.length}`, '',
    ...result.skippedAdditions.map((entry, index) => `- **S${index + 1}** ${markdownText(entry.url)}: ${markdownText(entry.reason)}`),
    '', 'Assign this issue to Copilot only after maintainers record their decisions. The resulting draft pull request requires human approval before merge.', '',
  ].join('\n');
}

export function validatePromotionResult(result) {
  validateCatalog(result.catalog);
  validateCatalog(result.retiredCatalog);
}

export async function applyCatalogPromotion({ root, now = new Date() }) {
  const readJson = async (file) => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
  const outputDirectory = path.join(root, 'output', 'gallery-content-review');
  const [catalog, retiredCatalog, candidateReport, auditReport, metadata, sourcesDocument, policy] = await Promise.all([
    readJson('static/templates.json'),
    readJson('static/retired-templates.json'),
    readJson('output/gallery-content-review/article-candidates.json'),
    readJson('output/gallery-content-review/audit-report.json'),
    readJson('output/gallery-content-review/run-metadata.json'),
    readJson('.github/gallery-audit/sources.json'),
    readJson('.github/gallery-audit/policy.json'),
  ]);
  if (!metadata.complete || metadata.copilot?.status !== 'complete') {
    throw new Error('Promotion requires a complete deterministic scan and Copilot classification');
  }
  const result = planCatalogPromotion({ catalog, retiredCatalog, candidateReport, auditReport, sourcesDocument, policy, now });
  validatePromotionResult(result);
  await Promise.all([
    fs.writeFile(path.join(root, 'static', 'templates.json'), `${JSON.stringify(result.catalog, null, 2)}\n`),
    fs.writeFile(path.join(root, 'static', 'retired-templates.json'), `${JSON.stringify(result.retiredCatalog, null, 2)}\n`),
    fs.writeFile(path.join(outputDirectory, 'promotion-result.json'), `${JSON.stringify({
      generatedAt: now.toISOString(),
      additions: result.additions,
      updates: result.updates,
      retirements: result.retirements,
      skippedAdditions: result.skippedAdditions,
    }, null, 2)}\n`),
    fs.writeFile(path.join(outputDirectory, 'promotion-summary.md'), promotionMarkdown(result, now.toISOString())),
  ]);
  return result;
}