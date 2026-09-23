import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUrl, urlFingerprint } from '../normalize.mjs';

test('normalizes Learn locale, tracking parameters, fragments, and trailing slashes', () => {
  assert.equal(
    normalizeUrl('https://LEARN.microsoft.com/en-us/azure/cosmos-db/?utm_source=test#section', ['fbclid']),
    'https://learn.microsoft.com/azure/cosmos-db',
  );
});

test('canonicalizes YouTube IDs across common URL forms', () => {
  assert.equal(
    normalizeUrl('https://youtu.be/abc123?t=10'),
    'https://www.youtube.com/watch?v=abc123',
  );
  assert.equal(
    normalizeUrl('https://www.youtube.com/watch?v=abc123&utm_medium=social'),
    'https://www.youtube.com/watch?v=abc123',
  );
});

test('fingerprints GitHub repository roots case-insensitively', () => {
  assert.equal(
    urlFingerprint('https://github.com/AzureCosmosDB/CosmosDB-Agent-Kit.git/'),
    'github.com/azurecosmosdb/cosmosdb-agent-kit',
  );
});

test('fingerprints GitHub owner and repository casing while retaining paths', () => {
  assert.equal(
    urlFingerprint('https://github.com/Microsoft/Repo/blob/main/README.md'),
    'github.com/microsoft/repo/blob/main/README.md',
  );
});

test('repairs Learn pivot parameters accidentally embedded in the path', () => {
  assert.equal(
    normalizeUrl('https://learn.microsoft.com/semantic-kernel/connector&pivots=programming-language-python'),
    'https://learn.microsoft.com/semantic-kernel/connector?pivots=programming-language-python',
  );
});