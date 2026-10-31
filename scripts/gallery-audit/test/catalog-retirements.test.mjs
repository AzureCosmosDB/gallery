import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const catalog = JSON.parse(readFileSync('static/templates.json', 'utf8'));
const retiredCatalog = JSON.parse(readFileSync('static/retired-templates.json', 'utf8'));

test('preserves the three approved retirement records and evidence', () => {
  const expected = new Map([
    ['https://github.com/Azure/Real-time-Payment-Transaction-Processing-at-Scale', ['review', 200, 'github-archived']],
    ['https://github.com/azure-samples/cosmicworks', ['broken', 404, 'github-missing']],
    ['https://github.com/Azure-Samples/cosmos-db-rest-samples', ['broken', 404, 'github-missing']],
  ]);
  const retiredBySource = new Map(retiredCatalog.map((entry) => [entry.source, entry]));

  assert.equal(retiredBySource.size, 3);
  for (const [source, [outcome, status, reasonCode]] of expected) {
    assert.equal(catalog.some((entry) => entry.source === source), false);
    const retired = retiredBySource.get(source);
    assert.ok(retired);
    assert.match(retired.retiredAt, /^2026-10-31T/);
    assert.equal(retired.replacementUrl, null);
    assert.equal(retired.retirementEvidence.auditOutcome, outcome);
    assert.equal(retired.retirementEvidence.httpStatus, status);
    assert.ok(retired.retirementEvidence.reasonCodes.includes(reasonCode));
  }

  assert.ok(catalog.some((entry) => entry.source === 'https://github.com/AzureCosmosDB/cosmicworks'));
});
