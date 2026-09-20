import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { auditCatalog, discoverContent, validateCatalog } from './core.mjs';
import { runCopilotClassification } from './copilot.mjs';
import { applyCatalogPromotion, strongRetirementEvidence } from './promotion.mjs';

const root = process.cwd();
const outputDirectory = path.join(root, 'output', 'gallery-content-review');
const readJson = async (file) => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const writeJson = async (file, value) => fs.writeFile(path.join(outputDirectory, file), `${JSON.stringify(value, null, 2)}\n`);

function markdownCell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replace(/\s+/g, ' ');
}

function auditMarkdown(report) {
  const counts = report.entries.reduce((grouped, entry) => {
    grouped[entry.outcome] = [...(grouped[entry.outcome] ?? []), entry];
    return grouped;
  }, {});
  const lines = [
    '# Gallery content audit', '',
    `Generated: ${report.generatedAt}`, '',
    `Catalog entries: ${report.entries.length}`, '',
    '| Outcome | Count |', '| --- | ---: |',
    ...['healthy', 'redirected', 'review', 'broken', 'duplicate', 'indeterminate'].map((outcome) => `| ${outcome} | ${(counts[outcome] ?? []).length} |`),
    '', '| Title | Outcome | Reason | URL |', '| --- | --- | --- | --- |',
    ...report.entries.filter((entry) => entry.outcome !== 'healthy').map((entry) => `| ${markdownCell(entry.title)} | ${entry.outcome} | ${markdownCell(entry.reasonCodes.join(', '))} | ${markdownCell(entry.url)} |`),
    '',
  ];
  return lines.join('\n');
}

function candidatesMarkdown(report) {
  return [
    '# Content candidates', '',
    `Generated: ${report.generatedAt}`, '',
    `Candidates: ${report.candidates.length}`, '',
    '| Published | Type | Source | Title | Classification | URL |', '| --- | --- | --- | --- | --- | --- |',
    ...report.candidates.map((candidate) => `| ${candidate.publishedAt.slice(0, 10)} | ${candidate.contentType} | ${candidate.sourceId} | ${markdownCell(candidate.title)} | ${candidate.classification?.verdict ?? 'unclassified'} | ${markdownCell(candidate.url)} |`),
    '',
  ].join('\n');
}

async function writeReports(auditReport, candidateReport, metadata) {
  await fs.mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeJson('audit-report.json', auditReport),
    fs.writeFile(path.join(outputDirectory, 'audit-summary.md'), auditMarkdown(auditReport)),
    writeJson('article-candidates.json', candidateReport),
    fs.writeFile(path.join(outputDirectory, 'article-candidates.md'), candidatesMarkdown(candidateReport)),
    writeJson('run-metadata.json', metadata),
  ]);
}

async function classifyOnly({ promote = false } = {}) {
  const [catalog, prompt, auditReport, candidateReport, metadata] = await Promise.all([
    readJson('static/templates.json'),
    fs.readFile(path.join(root, '.github', 'gallery-audit', 'relevance-prompt.md'), 'utf8'),
    readJson('output/gallery-content-review/audit-report.json'),
    readJson('output/gallery-content-review/article-candidates.json'),
    readJson('output/gallery-content-review/run-metadata.json'),
  ]);
  if (!process.env.COPILOT_GITHUB_TOKEN) {
    metadata.copilot = { status: 'skipped', reason: 'COPILOT_GITHUB_TOKEN not configured' };
    await writeJson('run-metadata.json', metadata);
    return;
  }
  const existingEntries = auditReport.entries.filter(strongRetirementEvidence);
  const result = runCopilotClassification({
    prompt,
    candidatePath: path.join(outputDirectory, 'article-candidates.json'),
    auditPath: path.join(outputDirectory, 'audit-report.json'),
    catalogPath: path.join(root, 'static', 'templates.json'),
    candidates: candidateReport.candidates,
    catalog,
    existingEntries,
  });
  if (result.status === 'complete') {
    result.classification.newContent.forEach((classification) => {
      candidateReport.candidates[classification.candidateIndex].classification = classification;
    });
    result.classification.existingContent.forEach((classification) => {
      auditReport.entries[classification.catalogIndex].classification = classification;
    });
    metadata.copilot = { status: 'complete', attempts: result.attempts, responseCaptured: true, retirementCandidates: existingEntries.length };
  } else {
    metadata.complete = false;
    metadata.copilot = { status: 'incomplete', attempts: result.attempts, error: result.error };
  }
  await writeReports(auditReport, candidateReport, metadata);
  if (promote && result.status === 'complete') await applyCatalogPromotion({ root });
}

async function run() {
  const flags = new Set(process.argv.slice(2));
  if (flags.has('--classify-only')) return classifyOnly({ promote: flags.has('--promote') });
  const fixtures = flags.has('--fixtures');
  const now = new Date();
  const [catalog, retiredCatalog, sourcesDocument, policy] = await Promise.all([
    readJson('static/templates.json'),
    readJson('static/retired-templates.json'),
    readJson('.github/gallery-audit/sources.json'),
    readJson('.github/gallery-audit/policy.json'),
  ]);
  const fixtureFeed = fixtures
    ? (await fs.readFile(path.join(root, 'scripts', 'gallery-audit', 'test', 'fixtures', 'feed.xml'), 'utf8')).replaceAll('{{PUBLISHED_AT}}', now.toISOString())
    : null;
  validateCatalog(retiredCatalog);
  const checker = fixtures
    ? async (url) => ({ status: 200, finalUrl: url, outcome: 'healthy', reason: 'fixture-http-ok' })
    : undefined;
  const auditEntries = await auditCatalog(catalog, policy, { checker, now });
  const fixtureSourceProvider = fixtures ? async (source, requestUrl) => {
    if ((source.kind ?? 'feed') === 'feed') return fixtureFeed;
    if (source.kind === 'youtube') return requestUrl.includes('/feeds/') ? '<feed></feed>' : '"channelId":"UC0000000000000000000000"';
    if (source.kind === 'github-search') return '{"items":[]}';
    if (source.kind === 'learn-search') return '{"results":[]}';
    throw new Error('unsupported-fixture-source');
  } : undefined;
  const discovery = await discoverContent(sourcesDocument.sources, policy, catalog, retiredCatalog, {
    now,
    sourceProvider: fixtureSourceProvider,
    checker,
  });
  const generatedAt = now.toISOString();
  const auditReport = { generatedAt, catalogCount: catalog.length, entries: auditEntries };
  const candidateReport = { generatedAt, candidateCount: discovery.candidates.length, candidates: discovery.candidates };
  const sourceErrors = discovery.sourceResults.filter((source) => source.status !== 'complete');
  const metadata = {
    generatedAt,
    mode: fixtures ? 'fixtures' : 'live',
    complete: sourceErrors.length === 0,
    sourceCommit: process.env.GITHUB_SHA ?? null,
    workflowRun: process.env.GITHUB_RUN_ID ?? null,
    enabledSources: sourcesDocument.sources.filter((source) => source.enabled).map((source) => source.id),
    sourceResults: discovery.sourceResults,
    counts: { catalogEntries: catalog.length, auditEntries: auditEntries.length, candidates: discovery.candidates.length, sourceErrors: sourceErrors.length },
    copilot: { status: 'skipped', reason: 'COPILOT_GITHUB_TOKEN not configured or classification not requested' },
  };
  await writeReports(auditReport, candidateReport, metadata);
  if (flags.has('--classify')) await classifyOnly({ promote: flags.has('--promote') });
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});