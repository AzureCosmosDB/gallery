import test from 'node:test';
import assert from 'node:assert/strict';
import { applyRejections, parseProposal, parseRejectCommand, summarizeCatalogDiff } from '../review-command.mjs';

const entry = (title, source, extra = {}) => ({ title, description: title, preview: 'coming soon', website: 'https://example.com', author: 'Author', source, date: '2026-01-01', tags: ['example'], ...extra });

test('parses reject commands with an optional bot mention and rejects malformed IDs', () => {
  assert.deepEqual(parseRejectCommand('@copilot Reject: A1, U2 R3, A1'), ['A1', 'U2', 'R3']);
  assert.throws(() => parseRejectCommand('Reject: U!'), /Invalid item ID: U!/);
  assert.throws(() => parseRejectCommand('Looks good'), /Use `Reject:/);
});

test('applies addition, update, and retirement rejections by current PR IDs', () => {
  const body = [
    '- **A1** Add [Added](https://example.com/added)',
    '- **U1** Update [Updated](https://example.com/new) from https://example.com/old',
    '- **R1** Retire [Retired](https://example.com/retired): Missing.',
  ].join('\n');
  const proposal = parseProposal(body);
  const result = applyRejections({
    baseCatalog: [entry('Updated', 'https://example.com/old'), entry('Retired', 'https://example.com/retired')],
    liveCatalog: [entry('Added', 'https://example.com/added'), entry('Updated', 'https://example.com/new')],
    retiredCatalog: [entry('Retired', 'https://example.com/retired', { retiredAt: '2026-01-02', retirementReason: 'Missing.', replacementUrl: null, retirementEvidence: {} })],
    proposal,
    rejectedIds: ['A1', 'U1', 'R1'],
  });
  assert.deepEqual(result.liveCatalog.map((item) => [item.title, item.source]), [
    ['Updated', 'https://example.com/old'],
    ['Retired', 'https://example.com/retired'],
  ]);
  assert.equal('retiredAt' in result.liveCatalog[1], false);
  assert.deepEqual(result.retiredCatalog, []);
});

test('rejects unknown stale IDs without changing catalogs', () => {
  const liveCatalog = [entry('Added', 'https://example.com/added')];
  assert.throws(() => applyRejections({ baseCatalog: [], liveCatalog, retiredCatalog: [], proposal: new Map(), rejectedIds: ['A1'] }), /Unknown or stale/);
  assert.equal(liveCatalog.length, 1);
});

test('restores a cancelled retirement to its original base position', () => {
  const baseCatalog = [entry('First', 'https://example.com/first'), entry('Restored', 'https://example.com/restored'), entry('Last', 'https://example.com/last')];
  const proposal = parseProposal('- **R1** Retire [Restored](https://example.com/restored): Missing.');
  const result = applyRejections({
    baseCatalog,
    liveCatalog: [entry('Added', 'https://example.com/added'), baseCatalog[0], baseCatalog[2]],
    retiredCatalog: [entry('Restored', 'https://example.com/restored', { retiredAt: '2026-01-02', retirementReason: 'Missing.', retirementEvidence: {} })],
    proposal,
    rejectedIds: ['R1'],
  });
  assert.deepEqual(result.liveCatalog.map((item) => item.title), ['Added', 'First', 'Restored', 'Last']);
});

test('regenerates numbered summary from the actual catalog diff with retirement proof', () => {
  const baseCatalog = [entry('Updated', 'https://example.com/old'), entry('Retired', 'https://example.com/retired')];
  const catalog = [entry('Added', 'https://example.com/added'), entry('Updated', 'https://example.com/new')];
  const retiredCatalog = [entry('Retired', 'https://example.com/retired', {
    retirementReason: 'Missing.', replacementUrl: null,
    retirementEvidence: { auditOutcome: 'broken', httpStatus: 404, finalUrl: 'https://example.com/retired', reasonCodes: ['http-404'], criteria: ['source missing'] },
  })];
  const summary = summarizeCatalogDiff({ baseCatalog, catalog, baseRetiredCatalog: [], retiredCatalog, generatedAt: '2026-09-20T00:00:00.000Z' });
  assert.match(summary, /\*\*A1\*\* Add \[Added\]/);
  assert.match(summary, /\*\*U1\*\* Update \[Updated\]/);
  assert.match(summary, /\*\*R1\*\* Retire \[Retired\]/);
  assert.match(summary, /`Reject: A1, U1, R1`/);
  assert.match(summary, /Description: Added/);
  assert.match(summary, /Author: Author/);
  assert.match(summary, /Tags: example/);
  assert.match(summary, /Preview: coming soon/);
  assert.match(summary, /Audit outcome: broken/);
  assert.match(summary, /HTTP status: 404/);
  assert.match(summary, /Reason codes: http-404/);
});

test('distinguishes URL updates when catalog entries have duplicate titles', () => {
  const baseCatalog = [
    entry('Shared title', 'https://example.com/unchanged', { description: 'First' }),
    entry('Shared title', 'https://example.com/old', { description: 'Second' }),
  ];
  const catalog = [
    baseCatalog[0],
    entry('Shared title', 'https://example.com/new', { description: 'Second' }),
  ];
  const summary = summarizeCatalogDiff({ baseCatalog, catalog, baseRetiredCatalog: [], retiredCatalog: [], generatedAt: '2026-09-20T00:00:00.000Z' });
  assert.match(summary, /URL updates: 1/);
  assert.match(summary, /https:\/\/example\.com\/new\) from https:\/\/example\.com\/old/);
  assert.doesNotMatch(summary, /from https:\/\/example\.com\/unchanged/);
});