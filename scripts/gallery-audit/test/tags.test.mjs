import test from 'node:test';
import assert from 'node:assert/strict';
import { validateClassification } from '../copilot.mjs';
import { inferTags, mergeTags, normalizeTag, tagWarnings } from '../tags.mjs';

test('inferTags adds generativeai, agent and language tags from content', () => {
  const tags = inferTags({ title: 'Build an AI agent with Python', description: 'Uses vector search.' });
  assert.ok(tags.includes('generativeai'));
  assert.ok(tags.includes('agent'));
  assert.ok(tags.includes('python'));
});

test('inferTags does not tag language-neutral content', () => {
  assert.deepEqual(inferTags({ title: 'Choose a partition key', description: 'Throughput and scale.' }), []);
});

test('java does not match javascript', () => {
  const tags = inferTags({ title: 'Node.js quickstart', description: '' });
  assert.ok(tags.includes('javascript'));
  assert.ok(!tags.includes('java'));
});

test('LangChain.js and langchainjs identify JavaScript content', () => {
  for (const title of ['LangChain.js quickstart', 'langchainjs quickstart']) {
    assert.ok(inferTags({ title, description: '' }).includes('javascript'));
  }
});

test('expanded MCP and RAG names identify generative AI content', () => {
  for (const title of ['Model Context Protocol with Azure Cosmos DB', 'Retrieval-Augmented Generation']) {
    assert.ok(inferTags({ title, description: '' }).includes('generativeai'));
  }
});

test('GitHub repository language becomes a language tag', () => {
  const tags = inferTags({ title: 'cosmos-starter', description: 'A starter.', language: 'C#' });
  assert.deepEqual(tags, ['csharp']);
  assert.deepEqual(inferTags({ title: 'x', description: '', language: 'Shell' }), []);
});

test('language tags remain capped at two after adding the GitHub repository language', () => {
  const tags = inferTags({ title: 'Python JavaScript starter', description: '', language: 'Go' });
  assert.deepEqual(tags.filter((tag) => ['python', 'csharp', 'java', 'javascript', 'typescript', 'go'].includes(tag)), ['python', 'javascript']);
});

test('mergeTags normalizes aliases and drops unknown tags', () => {
  assert.deepEqual(mergeTags(['blog', 'Microsoft'], ['generativeai', 'blog', 'not-a-tag']), ['blog', 'microsoft', 'generativeai']);
  assert.equal(normalizeTag('azurevision'), 'azure-vision');
});

test('tagWarnings flags cards without language or generativeai tags', () => {
  assert.deepEqual(tagWarnings({ tags: ['blog', 'microsoft'] }), ['no language or generativeai tag']);
  assert.deepEqual(tagWarnings({ tags: ['blog', 'python'] }), []);
});

test('classification tags are optional, normalized, and restricted to the taxonomy', () => {
  const item = (extra) => ({ candidateIndex: 0, url: 'https://example.com/a', verdict: 'include', confidence: 'high', criteria: ['x'], evidence: 'y', relatedUrl: null, ...extra });
  const candidates = [{ url: 'https://example.com/a' }];
  const sourceOwnedTags = ['blog', 'video', 'documentation', 'example', 'deck', 'tools', 'microsoft', 'community', 'featured'];
  const withTags = validateClassification({ newContent: [item({ tags: ['generativeai', 'python', ...sourceOwnedTags, 'made-up'] })], existingContent: [] }, candidates, []);
  assert.deepEqual(withTags.newContent[0].tags, ['generativeai', 'python']);
  const withoutTags = validateClassification({ newContent: [item({})], existingContent: [] }, candidates, []);
  assert.equal('tags' in withoutTags.newContent[0], false);
  assert.throws(() => validateClassification({ newContent: [item({ tags: 'python' })], existingContent: [] }, candidates, []), /invalid tags/);
});