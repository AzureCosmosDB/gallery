import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { auditCatalog, checkUrl, discoverArticles, discoverContent, discoverFromFeed, findDuplicates, validateCatalog } from '../core.mjs';
import { buildClassificationPrompt, buildCopilotArguments, runCopilotClassification } from '../copilot.mjs';
import { urlFingerprint } from '../normalize.mjs';
import { planCatalogPromotion, promotionMarkdown, sortCatalogForPublishing, strongRetirementEvidence, validatePromotionResult } from '../promotion.mjs';

const policy = {
  requestTimeoutMs: 250,
  maxResponseBytes: 128,
  redirectLimit: 2,
  trackingParameters: ['utm_*', 'fbclid'],
  ageReviewThresholdDays: 730,
  inclusionTerms: ['azure cosmos db', 'cosmos db'],
  knownRetiredTerms: ['documentclient'],
};

function catalogEntry(overrides = {}) {
  return {
    title: 'Example', description: 'Azure Cosmos DB example', preview: 'coming soon', website: 'https://example.com',
    author: 'Author', source: 'https://example.com/item', date: '2026-01-01', tags: ['example'], ...overrides,
  };
}

test('validates catalogs and detects exact and normalized duplicates without mutation', async () => {
  const catalog = [
    catalogEntry(),
    catalogEntry({ title: 'Exact', source: 'https://example.com/item' }),
    catalogEntry({ title: 'Normalized', source: 'https://example.com/item/?utm_source=test#fragment' }),
  ];
  const before = JSON.stringify(catalog);
  validateCatalog(catalog);
  const duplicates = findDuplicates(catalog, policy.trackingParameters);
  assert.deepEqual(duplicates[0], { exact: [1], normalized: [1, 2] });
  const report = await auditCatalog(catalog, policy, {
    now: new Date('2026-09-17T00:00:00Z'),
    checker: async (url) => ({ outcome: 'healthy', reason: 'test', status: 200, finalUrl: url }),
  });
  assert.equal(report.length, catalog.length);
  assert.ok(report.every((entry) => entry.outcome === 'duplicate'));
  assert.ok(report.every((entry) => entry.reasonCodes.includes('duplicate')));
  assert.equal(JSON.stringify(catalog), before);
});

test('rejects localized Microsoft documentation URLs in live and retirement fields', () => {
  for (const entry of [
    catalogEntry({ source: 'https://learn.microsoft.com/en-us/azure/cosmos-db' }),
    catalogEntry({ website: 'https://docs.microsoft.com/fr-fr/azure/cosmos-db' }),
    catalogEntry({ replacementUrl: 'https://learn.microsoft.com/ja-jp/azure/cosmos-db' }),
    catalogEntry({ retirementEvidence: { finalUrl: 'https://learn.microsoft.com/de-de/azure/cosmos-db' } }),
  ]) {
    assert.throws(() => validateCatalog([entry]), /localized Microsoft documentation URL/);
  }
  assert.equal(validateCatalog([catalogEntry({ source: 'https://learn.microsoft.com/azure/cosmos-db' })]), 1);
});

test('audits catalog URLs with bounded concurrency while preserving order', async () => {
  const catalog = Array.from({ length: 9 }, (_, index) => catalogEntry({ title: `Item ${index}`, source: `https://example.com/${index}` }));
  let active = 0;
  let maximumActive = 0;
  const report = await auditCatalog(catalog, { ...policy, auditConcurrency: 3 }, {
    checker: async (url) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return { outcome: 'healthy', reason: 'test', status: 200, finalUrl: url };
    },
  });
  assert.equal(maximumActive, 3);
  assert.deepEqual(report.map((entry) => entry.catalogIndex), catalog.map((_, index) => index));
});

test('classifies age alone as review rather than broken or retired', async () => {
  const report = await auditCatalog([catalogEntry({ date: '2020-01-01' })], policy, {
    now: new Date('2026-09-17T00:00:00Z'),
    checker: async (url) => ({ outcome: 'healthy', reason: 'test', status: 200, finalUrl: url }),
  });
  assert.equal(report[0].outcome, 'review');
  assert.ok(report[0].reasonCodes.includes('age-review'));
});

test('flags DocumentDB destinations as excluded product retirement evidence', async () => {
  const [entry] = await auditCatalog([catalogEntry({ source: 'https://learn.microsoft.com/azure/cosmos-db/mongodb/vcore/rag' })], {
    ...policy,
    excludedCatalogTerms: ['azure documentdb', 'documentdb'],
    excludedCatalogUrlPrefixes: ['https://learn.microsoft.com/azure/documentdb'],
  }, {
    checker: async () => ({ outcome: 'redirected', reason: 'http-redirect', status: 200, finalUrl: 'https://learn.microsoft.com/azure/documentdb/rag' }),
  });
  assert.equal(entry.outcome, 'review');
  assert.ok(entry.reasonCodes.includes('excluded-product'));
  assert.equal(strongRetirementEvidence(entry), true);
});

test('excludes DocumentDB content from discovery', () => {
  const source = { id: 'feed', contentType: 'blog', trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['example.com'] };
  const xml = `<?xml version="1.0"?><rss><channel><item><title>Azure Cosmos DB moves to Azure DocumentDB</title><link>https://example.com/documentdb</link><pubDate>2026-09-20T00:00:00Z</pubDate><description>Azure DocumentDB guide</description></item></channel></rss>`;
  const candidates = discoverFromFeed(xml, source, {
    ...policy,
    excludedCatalogTerms: ['azure documentdb', 'documentdb'],
  }, new Set(), { now: new Date('2026-09-20T00:00:00Z') });
  assert.deepEqual(candidates, []);
});

test('filters RSS by lookback and inclusion terms and deduplicates live, retired, and feed URLs', () => {
  const source = { id: 'feed', contentType: 'blog', trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['example.com'] };
  const xml = `<?xml version="1.0"?><rss><channel>
    <item><title>Azure Cosmos DB new guide</title><link>https://example.com/new?utm_source=rss</link><pubDate>2026-09-10T00:00:00Z</pubDate><description>Technical tutorial</description></item>
    <item><title>Duplicate Cosmos DB guide</title><link>https://example.com/new</link><pubDate>2026-09-11T00:00:00Z</pubDate></item>
    <item><title>Existing Cosmos DB guide</title><link>https://example.com/live/</link><pubDate>2026-09-11T00:00:00Z</pubDate></item>
    <item><title>Retired Cosmos DB guide</title><link>https://example.com/retired</link><pubDate>2026-09-11T00:00:00Z</pubDate></item>
    <item><title>Unrelated article</title><link>https://example.com/other</link><pubDate>2026-09-11T00:00:00Z</pubDate></item>
    <item><title>Old Cosmos DB guide</title><link>https://example.com/old</link><pubDate>2025-01-01T00:00:00Z</pubDate></item>
  </channel></rss>`;
  const existing = new Set([
    urlFingerprint('https://example.com/live', policy.trackingParameters),
    urlFingerprint('https://example.com/retired/', policy.trackingParameters),
  ]);
  const candidates = discoverFromFeed(xml, source, policy, existing, { now: new Date('2026-09-17T00:00:00Z') });
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].url, 'https://example.com/new');
  assert.equal(candidates[0].contentType, 'blog');
});

test('decodes feed entities and truncates summaries at a readable boundary', () => {
  const source = { id: 'feed', contentType: 'blog', trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['example.com'] };
  const repeated = 'Detailed Azure Cosmos DB guidance without punctuation '.repeat(30);
  const xml = `<rss><channel><item><title>Azure Cosmos DB guide</title><link>https://example.com/guide</link><pubDate>2026-09-10T00:00:00Z</pubDate><description>Use &amp; scale &#8230; ${repeated}</description></item></channel></rss>`;
  const [candidate] = discoverFromFeed(xml, source, policy, new Set(), { now: new Date('2026-09-17T00:00:00Z') });
  assert.match(candidate.summary, /^Use & scale …/);
  assert.ok(candidate.summary.length <= 1000);
  assert.match(candidate.summary, /\.\.\.$/);
  assert.doesNotMatch(candidate.summary, /guidan\.\.\.$/);
});

test('classifies HTTP outcomes, redirects, timeouts, and response limits', async (context) => {
  const server = http.createServer((request, response) => {
    if (request.url === '/redirect') { response.writeHead(302, { Location: '/ok' }); response.end(); return; }
    if (request.url === '/redirect-without-location') { response.writeHead(302); response.end(); return; }
    if (request.url === '/missing') { response.writeHead(404); response.end('missing'); return; }
    if (request.url === '/gone') { response.writeHead(410); response.end('gone'); return; }
    if (request.url === '/unauthorized') { response.writeHead(401); response.end('unauthorized'); return; }
    if (request.url === '/forbidden') { response.writeHead(403); response.end('forbidden'); return; }
    if (request.url === '/limited') { response.writeHead(429); response.end('limited'); return; }
    if (request.url === '/server-error') { response.writeHead(500); response.end('error'); return; }
    if (request.url === '/large') { response.writeHead(200, { 'Content-Length': '1024' }); response.end('x'.repeat(1024)); return; }
    if (request.url === '/slow') return;
    response.writeHead(200); response.end('ok');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => server.close());
  const { port } = server.address();
  const check = (route) => checkUrl(`http://127.0.0.1:${port}${route}`, policy, { allowPrivate: true, githubApi: false });
  assert.equal((await check('/ok')).outcome, 'healthy');
  assert.equal((await check('/redirect')).outcome, 'redirected');
  assert.equal((await check('/redirect-without-location')).outcome, 'indeterminate');
  assert.equal((await check('/missing')).outcome, 'broken');
  assert.equal((await check('/gone')).outcome, 'broken');
  for (const route of ['/unauthorized', '/forbidden', '/limited', '/server-error', '/large', '/slow']) assert.equal((await check(route)).outcome, 'indeterminate');
});

test('blocks IPv4-mapped private IPv6 addresses before fetching', async () => {
  let fetched = false;
  const result = await checkUrl('http://[::ffff:127.0.0.1]/', policy, {
    githubApi: false,
    fetchImpl: async () => { fetched = true; return new Response('ok'); },
  });
  assert.equal(result.outcome, 'indeterminate');
  assert.equal(result.reason, 'private-host');
  assert.equal(fetched, false);
});

test('blocks the unspecified IPv6 address before fetching', async () => {
  let fetched = false;
  const result = await checkUrl('http://[::]/', policy, {
    githubApi: false,
    fetchImpl: async () => { fetched = true; return new Response('ok'); },
  });
  assert.equal(result.outcome, 'indeterminate');
  assert.equal(result.reason, 'private-host');
  assert.equal(fetched, false);
});

test('validates YouTube videos through the bounded oEmbed endpoint', async () => {
  let requestedUrl;
  const result = await checkUrl('https://youtu.be/6IIUtEFKJec?si=tracking', policy, {
    allowPrivate: true,
    fetchImpl: async (url) => {
      requestedUrl = url.toString();
      return new Response('{"title":"Video"}', { status: 200, headers: { 'content-type': 'application/json' } });
    },
  });
  assert.match(requestedUrl, /^https:\/\/www\.youtube\.com\/oembed\?/);
  assert.match(requestedUrl, /6IIUtEFKJec/);
  assert.equal(result.outcome, 'healthy');
  assert.equal(result.reason, 'youtube-available');
  assert.equal(result.finalUrl, 'https://www.youtube.com/watch?v=6IIUtEFKJec');
});

test('treats an unhandled YouTube redirect as indeterminate', async () => {
  const result = await checkUrl('https://youtu.be/6IIUtEFKJec', policy, {
    allowPrivate: true,
    fetchImpl: async () => new Response('', { status: 302 }),
  });
  assert.equal(result.outcome, 'indeterminate');
  assert.equal(result.reason, 'youtube-http-302');
});

test('handles GitHub authentication, private repositories, and referenced paths conservatively', async () => {
  const unauthorized = await checkUrl('https://github.com/example/repository', policy, {
    fetchImpl: async () => new Response('{"message":"Bad credentials"}', { status: 401 }),
  });
  assert.equal(unauthorized.outcome, 'indeterminate');
  assert.equal(unauthorized.reason, 'github-http-401');

  const privateRepository = await checkUrl('https://github.com/example/repository', policy, {
    fetchImpl: async () => new Response('{"private":true,"html_url":"https://github.com/example/repository"}', { status: 200 }),
  });
  assert.equal(privateRepository.outcome, 'review');
  assert.equal(privateRepository.reason, 'github-private');

  const requests = [];
  const missingPath = await checkUrl('https://github.com/example/repository/blob/main/missing.md', policy, {
    fetchImpl: async (url) => {
      requests.push(url.toString());
      return url.hostname === 'api.github.com'
        ? new Response('{"private":false,"html_url":"https://github.com/example/repository"}', { status: 200 })
        : new Response('missing', { status: 404 });
    },
  });
  assert.equal(requests.length, 2);
  assert.equal(missingPath.outcome, 'broken');
  assert.equal(missingPath.reason, 'http-404');
});

test('reports renamed GitHub repositories as canonical URL redirects', async () => {
  const requested = [];
  const result = await checkUrl('https://github.com/example/old-name', policy, {
    allowPrivate: true,
    fetchImpl: async (url) => {
      requested.push(url.toString());
      if (url.pathname.endsWith('/old-name')) {
        return new Response('', { status: 301, headers: { location: 'https://api.github.com/repos/example/new-name' } });
      }
      return new Response('{"private":false,"disabled":false,"archived":false,"html_url":"https://github.com/example/new-name"}', { status: 200 });
    },
  });
  assert.equal(requested.length, 2);
  assert.equal(result.outcome, 'redirected');
  assert.equal(result.reason, 'github-redirect');
  assert.equal(result.finalUrl, 'https://github.com/example/new-name');
});

test('sends GitHub authorization only to the API host for referenced paths', async () => {
  const requests = [];
  const result = await checkUrl('https://github.com/example/repository/blob/main/README.md', policy, {
    headers: { Authorization: 'Bearer should-not-leak' },
    githubToken: 'api-token',
    fetchImpl: async (url, options) => {
      requests.push({ hostname: url.hostname, authorization: options.headers?.Authorization ?? null });
      return url.hostname === 'api.github.com'
        ? new Response('{"private":false,"html_url":"https://github.com/example/repository"}', { status: 200 })
        : new Response('ok', { status: 200 });
    },
  });
  assert.equal(result.outcome, 'healthy');
  assert.deepEqual(requests, [
    { hostname: 'api.github.com', authorization: 'Bearer api-token' },
    { hostname: 'github.com', authorization: null },
  ]);
});

test('rejects failed feeds and unresolved or off-host article candidates', async () => {
  const source = { id: 'feed', url: 'https://example.com/feed', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['example.com'] };
  const failed = await discoverArticles([source], policy, [], [], {
    feedProvider: async () => ({ status: 500, body: '<rss><channel></channel></rss>' }),
  });
  assert.equal(failed.sourceResults[0].status, 'partial');
  assert.equal(failed.sourceResults[0].error, 'source-http-500');

  const xml = `<?xml version="1.0"?><rss><channel>
    <item><title>Healthy Cosmos DB guide</title><link>https://example.com/healthy</link><pubDate>2026-09-10T00:00:00Z</pubDate></item>
    <item><title>Dead Cosmos DB guide</title><link>https://example.com/dead</link><pubDate>2026-09-10T00:00:00Z</pubDate></item>
    <item><title>Redirected Cosmos DB guide</title><link>https://example.com/redirected</link><pubDate>2026-09-10T00:00:00Z</pubDate></item>
  </channel></rss>`;
  const discovery = await discoverArticles([source], policy, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    feedProvider: async () => xml,
    checker: async (url) => {
      if (url.endsWith('/dead')) return { outcome: 'broken', finalUrl: url };
      if (url.endsWith('/redirected')) return { outcome: 'redirected', finalUrl: 'https://other.example/article' };
      return { outcome: 'healthy', finalUrl: url };
    },
  });
  assert.deepEqual(discovery.candidates.map((candidate) => candidate.url), ['https://example.com/healthy']);
  assert.equal(discovery.candidates[0].contentType, 'blog');
  assert.equal(discovery.sourceResults[0].candidateCount, 1);
});

test('discovers catalog-aligned blogs, videos, repositories, and Learn documentation', async () => {
  const sources = [
    { id: 'blog', kind: 'feed', contentType: 'blog', url: 'https://example.com/feed', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['example.com'] },
    { id: 'video', kind: 'youtube', contentType: 'video', url: 'https://www.youtube.com/@AzureCosmosDB', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['www.youtube.com'] },
    { id: 'github', kind: 'github-search', contentType: 'example', url: 'https://api.github.com/search/repositories?q=cosmosdb', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['api.github.com', 'github.com'], allowedOwners: ['AzureCosmosDB'] },
    { id: 'learn', kind: 'learn-search', contentType: 'documentation', url: 'https://learn.microsoft.com/api/search?search=cosmosdb', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['learn.microsoft.com'], allowedPathPrefixes: ['/azure/cosmos-db/'] },
  ];
  const sourceProvider = async (source, requestUrl) => {
    if (source.id === 'blog') return '<rss><channel><item><title>Azure Cosmos DB indexing guide</title><link>https://example.com/indexing</link><pubDate>2026-09-10T00:00:00Z</pubDate><description>Technical guide.</description></item></channel></rss>';
    if (source.id === 'video') {
      if (!requestUrl.includes('/feeds/')) return '"externalId":"UC0000000000000000000000"';
      return '<feed><entry><title>Azure Cosmos DB vector search</title><link href="https://www.youtube.com/watch?v=video123"/><published>2026-09-11T00:00:00Z</published><author><name>Azure Cosmos DB Team</name></author><summary>Technical walkthrough.</summary></entry></feed>';
    }
    if (source.id === 'github') return JSON.stringify({ incomplete_results: false, items: [{ name: 'cosmosdb-new-sample', html_url: 'https://github.com/AzureCosmosDB/cosmosdb-new-sample', created_at: '2026-09-12T00:00:00Z', private: false, visibility: 'public', archived: false, disabled: false, fork: false, size: 10, description: 'Runnable Azure Cosmos DB sample.', topics: ['cosmosdb'], owner: { login: 'AzureCosmosDB' } }] });
    return JSON.stringify({ results: [{ title: 'Configure Azure Cosmos DB indexing', url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/indexing', lastUpdatedDate: '2026-09-13T00:00:00Z', description: 'Configure indexing for Azure Cosmos DB.', products: ['Azure Cosmos DB'] }] });
  };
  const discovery = await discoverContent(sources, policy, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider,
    checker: async (url) => ({ outcome: 'healthy', finalUrl: url }),
  });
  assert.deepEqual(discovery.candidates.map((candidate) => candidate.contentType), ['blog', 'video', 'example', 'documentation']);
  assert.deepEqual(discovery.candidates.map((candidate) => candidate.url), [
    'https://example.com/indexing',
    'https://www.youtube.com/watch?v=video123',
    'https://github.com/AzureCosmosDB/cosmosdb-new-sample',
    'https://learn.microsoft.com/azure/cosmos-db/indexing',
  ]);
  assert.equal(discovery.candidates.find((candidate) => candidate.contentType === 'example').author, null);
  assert.ok(discovery.sourceResults.every((result) => result.status === 'complete' && result.candidateCount === 1));
});

test('marks incomplete GitHub searches partial and bounds ordered candidate checks', async () => {
  const source = { id: 'github', kind: 'github-search', contentType: 'example', url: 'https://api.github.com/search/repositories?q=cosmosdb', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['api.github.com', 'github.com'], allowedOwners: ['AzureCosmosDB'] };
  const incomplete = await discoverContent([source], policy, [], [], {
    sourceProvider: async () => JSON.stringify({ incomplete_results: true, items: [] }),
  });
  assert.deepEqual(incomplete.sourceResults, [{ sourceId: 'github', status: 'partial', candidateCount: 0, error: 'github-search-incomplete' }]);

  const invalid = await discoverContent([source], policy, [], [], {
    sourceProvider: async () => JSON.stringify({ incomplete_results: false }),
  });
  assert.deepEqual(invalid.sourceResults, [{ sourceId: 'github', status: 'partial', candidateCount: 0, error: 'github-search-invalid' }]);

  const feedSource = { id: 'feed', kind: 'feed', contentType: 'blog', url: 'https://example.com/feed', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['example.com'] };
  const xml = `<rss><channel>${[1, 2, 3].map((number) => `<item><title>Cosmos DB guide ${number}</title><link>https://example.com/${number}</link><pubDate>2026-09-10T00:00:00Z</pubDate><description>Guide ${number}</description></item>`).join('')}</channel></rss>`;
  let active = 0;
  let maximumActive = 0;
  const concurrent = await discoverContent([feedSource], { ...policy, discoveryConcurrency: 2 }, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider: async () => xml,
    checker: async (url) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, url.endsWith('/1') ? 10 : 1));
      active -= 1;
      return { outcome: 'healthy', finalUrl: url };
    },
  });
  assert.equal(maximumActive, 2);
  assert.deepEqual(concurrent.candidates.map((candidate) => candidate.url), ['https://example.com/1', 'https://example.com/2', 'https://example.com/3']);
});

test('skips malformed source dates and propagates GitHub tokens to candidate checks', async () => {
  const source = { id: 'github', kind: 'github-search', contentType: 'example', url: 'https://api.github.com/search/repositories?q=cosmosdb', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['api.github.com', 'github.com'], allowedOwners: ['AzureCosmosDB'] };
  const repositories = {
    incomplete_results: false,
    items: [
      { name: 'invalid-date', html_url: 'https://github.com/AzureCosmosDB/invalid-date', created_at: 'not-a-date', private: false, visibility: 'public', archived: false, disabled: false, fork: false, size: 10, description: 'Azure Cosmos DB sample.', owner: { login: 'AzureCosmosDB' } },
      { name: 'internal-cosmosdb', html_url: 'https://github.com/AzureCosmosDB/internal-cosmosdb', created_at: '2026-09-12T00:00:00Z', private: false, visibility: 'internal', archived: false, disabled: false, fork: false, size: 10, description: 'Azure Cosmos DB sample.', owner: { login: 'AzureCosmosDB' } },
      { name: 'valid-cosmosdb', html_url: 'https://github.com/AzureCosmosDB/valid-cosmosdb', created_at: '2026-09-12T00:00:00Z', private: false, visibility: 'public', archived: false, disabled: false, fork: false, size: 10, description: 'Azure Cosmos DB sample.', owner: { login: 'AzureCosmosDB' } },
    ],
  };
  let receivedToken;
  const discovery = await discoverContent([source], policy, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    githubToken: 'test-token',
    sourceProvider: async () => JSON.stringify(repositories),
    checker: async (url, options) => {
      receivedToken = options.githubToken;
      return { outcome: 'healthy', finalUrl: url };
    },
  });
  assert.equal(discovery.sourceResults[0].status, 'complete');
  assert.deepEqual(discovery.candidates.map((candidate) => candidate.title), ['valid-cosmosdb']);
  assert.equal(receivedToken, 'test-token');
});

test('rejects Learn candidates redirected outside the approved product tree', async () => {
  const source = { id: 'learn', kind: 'learn-search', contentType: 'documentation', url: 'https://learn.microsoft.com/api/search?search=cosmosdb', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['learn.microsoft.com'] };
  const discovery = await discoverContent([source], policy, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider: async () => JSON.stringify({ results: [{ title: 'Azure Cosmos DB guide', url: 'https://learn.microsoft.com/azure/cosmos-db/guide', lastUpdatedDate: '2026-09-10T00:00:00Z', description: 'Azure Cosmos DB guide.' }] }),
    checker: async () => ({ outcome: 'redirected', finalUrl: 'https://learn.microsoft.com/azure/other-product/guide' }),
  });
  assert.equal(discovery.candidates.length, 0);
  assert.equal(discovery.sourceResults[0].status, 'complete');

  const accepted = await discoverContent([source], policy, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider: async () => JSON.stringify({ results: [{ title: 'Azure Cosmos DB guide', url: 'https://learn.microsoft.com/azure/cosmos-db/guide', lastUpdatedDate: '2026-09-10T00:00:00Z', description: 'Azure Cosmos DB guide.' }] }),
    checker: async (url) => ({ outcome: 'healthy', finalUrl: url }),
  });
  assert.equal(accepted.candidates.length, 1);

  const invalid = await discoverContent([source], policy, [], [], {
    sourceProvider: async () => JSON.stringify({ count: 0 }),
  });
  assert.deepEqual(invalid.sourceResults, [{ sourceId: 'learn', status: 'partial', candidateCount: 0, error: 'learn-search-invalid' }]);
});

test('accepts the Learn root, rejects future dates, and records source truncation', async () => {
  const learnSource = { id: 'learn', kind: 'learn-search', contentType: 'documentation', url: 'https://learn.microsoft.com/api/search?search=cosmosdb', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['learn.microsoft.com'] };
  const learn = await discoverContent([learnSource], policy, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider: async () => JSON.stringify({ results: [
      { title: 'Azure Cosmos DB documentation', url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/', lastUpdatedDate: '2026-09-10T00:00:00Z', description: 'Azure Cosmos DB documentation.' },
      { title: 'Future Azure Cosmos DB guide', url: 'https://learn.microsoft.com/azure/cosmos-db/future', lastUpdatedDate: '2026-09-18T00:00:00Z', description: 'Azure Cosmos DB guide.' },
    ] }),
    checker: async (url) => ({ outcome: 'healthy', finalUrl: url }),
  });
  assert.deepEqual(learn.candidates.map((candidate) => candidate.url), ['https://learn.microsoft.com/azure/cosmos-db']);

  const feedSource = { id: 'feed', kind: 'feed', contentType: 'blog', url: 'https://example.com/feed', enabled: true, trustTier: 'first-party', lookbackDays: 45, maxCandidates: 1, allowedHostnames: ['example.com'] };
  const xml = '<rss><channel><item><title>Cosmos DB one</title><link>https://example.com/one</link><pubDate>2026-09-10T00:00:00Z</pubDate><description>One</description></item><item><title>Cosmos DB two</title><link>https://example.com/two</link><pubDate>2026-09-11T00:00:00Z</pubDate><description>Two</description></item></channel></rss>';
  const truncated = await discoverContent([feedSource], policy, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider: async () => xml,
    checker: async (url) => ({ outcome: 'healthy', finalUrl: url }),
  });
  assert.deepEqual(truncated.sourceResults, [{ sourceId: 'feed', status: 'partial', candidateCount: 1, error: 'source-candidate-limit' }]);
});

test('restricts GitHub source redirects and records aggregate candidate truncation', async () => {
  const githubSource = { id: 'github', kind: 'github-search', contentType: 'example', url: 'https://api.github.com/search/repositories?q=cosmosdb', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['api.github.com', 'github.com'], allowedOwners: ['AzureCosmosDB'] };
  let redirectedFetch = false;
  const redirected = await discoverContent([githubSource], policy, [], [], {
    fetchImpl: async (url) => {
      if (url.hostname === 'api.github.com') return new Response('', { status: 302, headers: { location: 'https://github.com/search' } });
      redirectedFetch = true;
      return new Response('{}');
    },
  });
  assert.equal(redirectedFetch, false);
  assert.equal(redirected.sourceResults[0].error, 'hostname-not-allowlisted');

  const feedSource = { id: 'feed', kind: 'feed', contentType: 'blog', url: 'https://example.com/feed', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['example.com'] };
  const xml = `<rss><channel>${[1, 2, 3].map((number) => `<item><title>Cosmos DB guide ${number}</title><link>https://example.com/${number}</link><pubDate>2026-09-10T00:00:00Z</pubDate><description>Guide ${number}</description></item>`).join('')}</channel></rss>`;
  const truncated = await discoverContent([feedSource], { ...policy, discoveryCandidateLimit: 2 }, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider: async () => xml,
    checker: async (url) => ({ outcome: 'healthy', finalUrl: url }),
  });
  assert.equal(truncated.candidates.length, 2);
  assert.deepEqual(truncated.candidates.map((candidate) => candidate.candidateIndex), [0, 1]);
  assert.deepEqual(truncated.sourceResults, [{ sourceId: 'feed', status: 'partial', candidateCount: 2, error: 'aggregate-candidate-limit' }]);
});

test('shares the aggregate candidate budget fairly across configured sources', async () => {
  const sources = ['first', 'second'].map((id) => ({ id, kind: 'feed', contentType: 'blog', url: `https://${id}.example.com/feed`, enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: [`${id}.example.com`] }));
  const discovery = await discoverContent(sources, { ...policy, discoveryCandidateLimit: 2 }, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider: async (source) => `<rss><channel>${[1, 2].map((number) => `<item><title>Cosmos DB ${source.id} ${number}</title><link>https://${source.id}.example.com/${number}</link><pubDate>2026-09-10T00:00:00Z</pubDate><description>Guide</description></item>`).join('')}</channel></rss>`,
    checker: async (url) => ({ outcome: 'healthy', finalUrl: url }),
  });
  assert.deepEqual(discovery.candidates.map((candidate) => candidate.sourceId), ['first', 'second']);
  assert.ok(discovery.sourceResults.every((result) => result.status === 'partial' && result.candidateCount === 1 && result.error === 'aggregate-candidate-limit'));
});

test('applies the aggregate budget before checks and enforces final GitHub owners', async () => {
  const sources = ['first', 'second'].map((id) => ({ id, kind: 'feed', contentType: 'blog', url: `https://${id}.example.com/feed`, enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: [`${id}.example.com`] }));
  let checks = 0;
  const budgeted = await discoverContent(sources, { ...policy, discoveryCandidateLimit: 3 }, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider: async (source) => `<rss><channel>${[1, 2, 3].map((number) => `<item><title>Cosmos DB ${source.id} ${number}</title><link>https://${source.id}.example.com/${number}</link><pubDate>2026-09-10T00:00:00Z</pubDate><description>Guide</description></item>`).join('')}</channel></rss>`,
    checker: async (url) => { checks += 1; return { outcome: 'healthy', finalUrl: url }; },
  });
  assert.equal(checks, 3);
  assert.deepEqual(budgeted.candidates.map((candidate) => candidate.sourceId), ['first', 'second', 'first']);

  const githubSource = { id: 'github', kind: 'github-search', contentType: 'example', url: 'https://api.github.com/search/repositories?q=cosmosdb', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['api.github.com', 'github.com'], allowedOwners: ['AzureCosmosDB'] };
  const repositories = { incomplete_results: false, items: [{ name: 'cosmosdb', html_url: 'https://github.com/AzureCosmosDB/cosmosdb', created_at: '2026-09-12T00:00:00Z', visibility: 'public', size: 10, description: 'Azure Cosmos DB sample.', owner: { login: 'AzureCosmosDB' } }, null, 'bad'] };
  const escaped = await discoverContent([githubSource], policy, [], [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider: async () => JSON.stringify(repositories),
    checker: async () => ({ outcome: 'redirected', finalUrl: 'https://github.com/unapproved/cosmosdb' }),
  });
  assert.equal(escaped.sourceResults[0].status, 'complete');
  assert.equal(escaped.candidates.length, 0);
});

test('authenticates GitHub source requests only to the API host', async () => {
  const source = { id: 'github', kind: 'github-search', contentType: 'example', url: 'https://api.github.com/search/repositories?q=cosmosdb', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['api.github.com', 'github.com'], allowedOwners: ['AzureCosmosDB'] };
  let request;
  const discovery = await discoverContent([source], policy, [], [], {
    githubToken: 'source-token',
    fetchImpl: async (url, options) => {
      request = { hostname: url.hostname, authorization: options.headers.Authorization };
      return new Response('{"incomplete_results":false,"items":[]}', { status: 200 });
    },
  });
  assert.deepEqual(request, { hostname: 'api.github.com', authorization: 'Bearer source-token' });
  assert.equal(discovery.sourceResults[0].status, 'complete');
});

test('skips malformed GitHub results and deduplicates canonical redirect destinations', async () => {
  const githubSource = { id: 'github', kind: 'github-search', contentType: 'example', url: 'https://api.github.com/search/repositories?q=cosmosdb', enabled: true, trustTier: 'first-party', lookbackDays: 45, allowedHostnames: ['api.github.com', 'github.com'], allowedOwners: ['AzureCosmosDB'] };
  const repositories = { incomplete_results: false, items: [
    { name: 'malformed', html_url: 'not-a-url', created_at: '2026-09-12T00:00:00Z', visibility: 'public', size: 10, description: 'Azure Cosmos DB sample.', owner: { login: 'AzureCosmosDB' } },
    { name: 'valid-cosmosdb', html_url: 'https://github.com/AzureCosmosDB/alias', created_at: '2026-09-12T00:00:00Z', visibility: 'public', size: 10, description: 'Azure Cosmos DB sample.', owner: { login: 'AzureCosmosDB' } },
  ] };
  const existing = [catalogEntry({ source: 'https://github.com/AzureCosmosDB/canonical' })];
  const discovery = await discoverContent([githubSource], policy, existing, [], {
    now: new Date('2026-09-17T00:00:00Z'),
    sourceProvider: async () => JSON.stringify(repositories),
    checker: async () => ({ outcome: 'redirected', finalUrl: 'https://github.com/AzureCosmosDB/canonical' }),
  });
  assert.equal(discovery.sourceResults[0].status, 'complete');
  assert.equal(discovery.candidates.length, 0);
});

test('retries malformed Copilot output once and returns an incomplete fallback', () => {
  let calls = 0;
  const result = runCopilotClassification({
    prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json', candidates: [], catalog: [],
    execute: () => { calls += 1; return { status: 0, stdout: calls === 1 ? 'not json' : '{"newContent":[]}' }; },
  });
  assert.equal(calls, 2);
  assert.equal(result.status, 'incomplete');
  assert.equal(result.attempts, 2);
});

test('repairs ANSI-wrapped malformed model JSON through the classification path', () => {
  const candidate = { url: 'https://example.com/new' };
  const response = `{
    newContent: [{
      candidateIndex: 0,
      url: "${candidate.url}",
      verdict: "review",
      confidence: "low",
      criteria: ["uncertain",],
      evidence: "Needs
review.",
      relatedUrl: null,
    },],
    existingContent: [],
  }`;
  const result = runCopilotClassification({
    prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json',
    candidates: [candidate], catalog: [], execute: () => ({ status: 0, stdout: `\u001b[32m${response}\u001b[0m` }),
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.classification.newContent[0].url, candidate.url);
  assert.equal(result.classification.newContent[0].evidence, 'Needs\nreview.');
});

test('embeds JSON inputs as untrusted prompt data without native attachments', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'gallery-copilot-'));
  const documents = [
    { candidates: [{ title: 'Candidate', url: 'https://example.com/new', summary: 'Useful guide.' }] },
    { entries: [
      { catalogIndex: 0, title: 'Healthy', url: 'https://example.com/healthy', outcome: 'healthy', reasonCodes: ['http-ok'] },
      { catalogIndex: 1, title: 'Existing', url: 'https://example.com/old', outcome: 'broken', reasonCodes: ['http-404'] },
    ] },
    [
      { title: 'Healthy', description: 'Keep this.', source: 'https://example.com/healthy', tags: ['blog'] },
      { title: 'Existing', description: 'Catalog description.', source: 'https://example.com/old', tags: ['blog'] },
    ],
  ];
  const files = ['candidates.json', 'audit.json', 'catalog.json'].map((name, index) => {
    const file = path.join(directory, name);
    writeFileSync(file, JSON.stringify(documents[index]));
    return file;
  });
  const options = {
    prompt: 'Classify the documents.',
    candidatePath: files[0],
    auditPath: files[1],
    catalogPath: files[2],
    existingEntries: [{ catalogIndex: 1, url: 'https://example.com/old' }],
  };
  const prompt = buildClassificationPrompt(options);
  const argumentsList = buildCopilotArguments(options);
  assert.match(prompt, /BEGIN CONTENT CANDIDATES/);
  assert.match(prompt, /BEGIN RETIREMENT CANDIDATES/);
  assert.match(prompt, /BEGIN CATALOG COMPARISON ONLY/);
  assert.match(prompt, /Catalog description/);
  assert.match(prompt, /Keep this/);
  const retirementSection = prompt.match(/BEGIN RETIREMENT CANDIDATES ---([\s\S]*?)--- END RETIREMENT CANDIDATES/)?.[1] ?? '';
  assert.doesNotMatch(retirementSection, /Keep this/);
  assert.equal(argumentsList[0], '-p');
  assert.equal(argumentsList[1], prompt);
  assert.ok(argumentsList.includes('--no-color'));
  assert.deepEqual(argumentsList.slice(argumentsList.indexOf('--dynamic-retrieval'), argumentsList.indexOf('--dynamic-retrieval') + 2), ['--dynamic-retrieval', 'skills=on']);
  assert.equal(argumentsList.some((argument) => argument.startsWith('--attachment')), false);
  assert.ok(Buffer.byteLength(prompt, 'utf8') <= 96 * 1024);
});

test('accepts a fenced strict Copilot response with exact indexes and URLs', () => {
  const candidates = [{ url: 'https://example.com/new' }];
  const catalog = [{ source: 'https://example.com/existing' }];
  const response = {
    newContent: [{ candidateIndex: 0, url: candidates[0].url, verdict: 'review', confidence: 'low', criteria: ['uncertain'], evidence: 'Needs review.', relatedUrl: null }],
    existingContent: [{ catalogIndex: 0, url: catalog[0].source, verdict: 'keep', confidence: 'high', criteria: ['useful'], evidence: 'Still useful.', relatedUrl: null }],
  };
  const result = runCopilotClassification({
    prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json', candidates, catalog,
    execute: () => ({ status: 0, stdout: `\`\`\`json\n${JSON.stringify(response)}\n\`\`\`` }),
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.attempts, 1);
});

test('rejects empty Copilot classification criteria', () => {
  const candidates = [{ url: 'https://example.com/new' }];
  const response = {
    newContent: [{ candidateIndex: 0, url: candidates[0].url, verdict: 'review', confidence: 'low', criteria: [' '], evidence: 'Needs review.', relatedUrl: null }],
    existingContent: [],
  };
  const result = runCopilotClassification({
    prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json', candidates, catalog: [],
    execute: () => ({ status: 0, stdout: JSON.stringify(response) }),
  });
  assert.equal(result.status, 'incomplete');
  assert.match(result.error, /invalid criteria/);
});

test('rejects malformed retirement replacement URLs', () => {
  const existingEntries = [{ catalogIndex: 0, url: 'https://example.com/old' }];
  for (const relatedUrl of [
    'https://example.com/new\nline',
    'https://learn.microsoft.com/semantic-kernel/connector&pivots=csharp',
  ]) {
    const response = {
      newContent: [],
      existingContent: [{ catalogIndex: 0, url: existingEntries[0].url, verdict: 'retire-proposed', confidence: 'high', criteria: ['broken'], evidence: 'Broken.', relatedUrl }],
    };
    const result = runCopilotClassification({
      prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json',
      candidates: [], catalog: [], existingEntries, execute: () => ({ status: 0, stdout: JSON.stringify(response) }),
    });
    assert.equal(result.status, 'incomplete');
    assert.match(result.error, /invalid relatedUrl/);
  }
});

test('promotes only high-confidence additions with complete source metadata', () => {
  const candidate = {
    sourceId: 'feed', title: 'New Cosmos DB article', url: 'https://example.com/new', publishedAt: '2026-09-10T00:00:00Z',
    author: null, summary: 'A practical Azure Cosmos DB guide.',
    classification: { verdict: 'include', confidence: 'high', evidence: 'Directly teaches an Azure Cosmos DB scenario.', criteria: ['cosmos-db-specific'] },
  };
  const result = planCatalogPromotion({
    catalog: [catalogEntry()], retiredCatalog: [], candidateReport: { candidates: [candidate] }, auditReport: { entries: [] }, policy,
    sourcesDocument: { sources: [{ id: 'feed', catalogDefaults: { website: 'https://example.com', author: 'Publisher', tags: ['blog'] } }] },
  });
  assert.equal(result.additions.length, 1);
  assert.equal(result.catalog[0].source, candidate.url);
  assert.equal(result.catalog[0].author, 'Publisher');
  assert.deepEqual(result.catalog[0].tags, ['blog']);
  assert.equal(result.additions[0].recommendationReason, 'Directly teaches an Azure Cosmos DB scenario.');
  assert.deepEqual(result.additions[0].recommendationCriteria, ['cosmos-db-specific']);
  assert.equal('recommendationReason' in result.catalog[0], false);
});

test('updates redirected catalog URLs instead of retiring live content', () => {
  const catalog = [catalogEntry({ source: 'https://example.com/old' })];
  const result = planCatalogPromotion({
    catalog, retiredCatalog: [], candidateReport: { candidates: [] }, sourcesDocument: { sources: [] }, policy,
    auditReport: { entries: [{ catalogIndex: 0, url: catalog[0].source, outcome: 'redirected', finalUrl: 'https://example.com/new', reasonCodes: ['http-redirect'], classification: null, duplicates: { exact: [], normalized: [] } }] },
  });
  assert.equal(result.catalog[0].source, 'https://example.com/new');
  assert.deepEqual(result.updates, [{
    title: 'Example', previousUrl: 'https://example.com/old', url: 'https://example.com/new',
    recommendationReason: 'The published source redirects to this canonical URL.', recommendationCriteria: ['http-redirect'],
  }]);
  assert.equal(result.retirements.length, 0);
});

test('keeps cross-host redirects review-only and out of promotion', async () => {
  const catalog = [catalogEntry({ source: 'https://example.com/old' })];
  const [auditEntry] = await auditCatalog(catalog, policy, {
    checker: async () => ({ outcome: 'redirected', reason: 'http-redirect', status: 200, finalUrl: 'https://other.example/new' }),
  });
  assert.equal(auditEntry.outcome, 'review');
  assert.ok(auditEntry.reasonCodes.includes('redirect-unapproved-host'));
  const result = planCatalogPromotion({
    catalog, retiredCatalog: [], candidateReport: { candidates: [] }, sourcesDocument: { sources: [] }, policy,
    auditReport: { entries: [{ ...auditEntry, outcome: 'redirected' }] },
  });
  assert.equal(result.catalog[0].source, catalog[0].source);
  assert.deepEqual(result.updates, []);
});

test('normalizes redirect destinations and rejects retired-ledger conflicts', () => {
  const catalog = [catalogEntry({ source: 'https://example.com/old' })];
  const auditEntry = { catalogIndex: 0, url: catalog[0].source, outcome: 'redirected', finalUrl: 'https://example.com/new/?utm_source=a#fragment', reasonCodes: ['http-redirect'] };
  const normalized = planCatalogPromotion({
    catalog, retiredCatalog: [], candidateReport: { candidates: [] }, sourcesDocument: { sources: [] }, policy,
    auditReport: { entries: [auditEntry] },
  });
  assert.equal(normalized.catalog[0].source, 'https://example.com/new');

  const conflicted = planCatalogPromotion({
    catalog, retiredCatalog: [catalogEntry({ source: 'https://example.com/new' })], candidateReport: { candidates: [] }, sourcesDocument: { sources: [] }, policy,
    auditReport: { entries: [auditEntry] },
  });
  assert.equal(conflicted.catalog[0].source, catalog[0].source);
  assert.deepEqual(conflicted.updates, []);
});

test('validates live and retired promotion catalogs before publication', () => {
  assert.throws(() => validatePromotionResult({
    catalog: [catalogEntry()],
    retiredCatalog: [catalogEntry({ replacementUrl: 'https://learn.microsoft.com/en-us/azure/cosmos-db/' })],
  }), /localized Microsoft documentation URL/);
});

test('does not automatically retire duplicate-source entries', () => {
  const catalog = [catalogEntry(), catalogEntry({ title: 'Duplicate' })];
  const result = planCatalogPromotion({
    catalog, retiredCatalog: [], candidateReport: { candidates: [] }, sourcesDocument: { sources: [] }, policy,
    auditReport: { entries: [{
      catalogIndex: 0, url: catalog[0].source, outcome: 'broken', finalUrl: catalog[0].source,
      reasonCodes: ['http-404'], duplicates: { exact: [1], normalized: [1] },
      classification: { verdict: 'retire-proposed', confidence: 'high', evidence: 'Broken.', relatedUrl: null, criteria: ['broken'] },
    }] },
  });
  assert.deepEqual(result.catalog, catalog);
  assert.equal(result.retirements.length, 0);
});

test('numbers every proposal issue item for unambiguous issue editing', () => {
  const markdown = promotionMarkdown({
    additions: [{ title: 'First addition', source: 'https://example.com/add', recommendationReason: 'Relevant example.', recommendationCriteria: ['specific'] }],
    updates: [{ title: 'Moved', previousUrl: 'https://example.com/old', url: 'https://example.com/new', recommendationReason: 'Canonical redirect.', recommendationCriteria: ['http-redirect'] }],
    retirements: [{ title: 'First retirement', source: 'https://example.com/retire', retirementReason: 'Superseded.' }],
    skippedAdditions: [{ url: 'https://example.com/skip', reason: 'already-cataloged' }],
  }, '2026-09-18T00:00:00.000Z');
  assert.match(markdown, /\*\*A1\*\* Add \[First addition\]/);
  assert.match(markdown, /Reason: Relevant example\./);
  assert.match(markdown, /Criteria: specific/);
  assert.match(markdown, /\*\*U1\*\* Update \[Moved\]/);
  assert.match(markdown, /Reason: Canonical redirect\./);
  assert.match(markdown, /\*\*R1\*\* Retire \[First retirement\]/);
  assert.match(markdown, /Reason: Superseded\./);
  assert.match(markdown, /\*\*S1\*\* https:\/\/example\.com\/skip/);
  assert.match(markdown, /Edit this issue before assigning it to Copilot/);
  assert.match(markdown, /Delete recommendations you do not want/);
  assert.match(markdown, /edited issue body is the source of truth/);
});

test('shows complete card metadata and flags missing fields in maintenance PR additions', () => {
  const markdown = promotionMarkdown({
    additions: [{
      title: 'Card', description: 'Card description.', preview: '', website: 'https://example.com',
      author: ['One', 'Two'], source: 'https://example.com/card', date: '2026-09-20', tags: ['video', 'microsoft'],
    }],
    retirements: [], skippedAdditions: [],
  }, '2026-09-20T00:00:00.000Z');
  assert.match(markdown, /Description: Card description\./);
  assert.match(markdown, /Author: One, Two/);
  assert.match(markdown, /Date: 2026-09-20/);
  assert.match(markdown, /Tags: video, microsoft/);
  assert.match(markdown, /Website: https:\/\/example\.com/);
  assert.match(markdown, /Preview: \*\*MISSING\*\*/);
  assert.match(markdown, /Source: https:\/\/example\.com\/card/);
});

test('retires only high-confidence classifications backed by strong deterministic evidence', () => {
  const catalog = [catalogEntry(), catalogEntry({ title: 'Old', source: 'https://example.com/old' })];
  const classifications = [
    { verdict: 'retire-proposed', confidence: 'high', evidence: 'Old but still available.', relatedUrl: null, criteria: ['age'] },
    { verdict: 'retire-proposed', confidence: 'high', evidence: 'The source is gone.', relatedUrl: 'https://example.com/new', criteria: ['broken'] },
  ];
  const result = planCatalogPromotion({
    catalog, retiredCatalog: [], candidateReport: { candidates: [] }, sourcesDocument: { sources: [] }, policy,
    auditReport: { entries: [
      { catalogIndex: 0, url: catalog[0].source, outcome: 'review', reasonCodes: ['age-review'], classification: classifications[0] },
      { catalogIndex: 1, url: catalog[1].source, outcome: 'broken', reasonCodes: ['http-404'], classification: classifications[1] },
    ] },
    now: new Date('2026-09-17T00:00:00Z'),
  });
  assert.deepEqual(result.catalog, [catalog[0]]);
  assert.equal(result.retirements.length, 1);
  assert.equal(result.retirements[0].source, catalog[1].source);
  assert.equal(result.retirements[0].retiredAt, '2026-09-17T00:00:00.000Z');
});

test('promotion is a no-op for review verdicts and already cataloged URLs', () => {
  const catalog = [catalogEntry()];
  const result = planCatalogPromotion({
    catalog, retiredCatalog: [], policy, auditReport: { entries: [] },
    sourcesDocument: { sources: [{ id: 'feed', catalogDefaults: { website: 'https://example.com', author: 'Publisher', tags: ['blog'] } }] },
    candidateReport: { candidates: [
      { sourceId: 'feed', title: 'Review', url: 'https://example.com/review', publishedAt: '2026-09-10T00:00:00Z', summary: 'Summary', classification: { verdict: 'review', confidence: 'high' } },
      { sourceId: 'feed', title: 'Duplicate', url: 'https://example.com/item/', publishedAt: '2026-09-10T00:00:00Z', summary: 'Summary', classification: { verdict: 'include', confidence: 'high' } },
    ] },
  });
  assert.deepEqual(result.catalog, catalog);
  assert.equal(result.additions.length, 0);
  assert.deepEqual(result.skippedAdditions, [{ url: 'https://example.com/item/', reason: 'already-cataloged' }]);
});

test('does not retire entries based only on duplicate findings', () => {
  const catalog = [catalogEntry()];
  const classification = { verdict: 'retire-proposed', confidence: 'high', evidence: 'Shares a source.', relatedUrl: null, criteria: ['duplicate'] };
  const result = planCatalogPromotion({
    catalog, retiredCatalog: [], candidateReport: { candidates: [] }, sourcesDocument: { sources: [] }, policy,
    auditReport: { entries: [{ catalogIndex: 0, url: catalog[0].source, outcome: 'duplicate', reasonCodes: ['duplicate'], classification }] },
  });
  assert.deepEqual(result.catalog, catalog);
  assert.equal(result.retirements.length, 0);
});

test('validates a sparse retirement candidate set with original catalog indexes', () => {
  const catalog = [catalogEntry(), catalogEntry({ source: 'https://example.com/retire' })];
  const existingEntries = [{ catalogIndex: 1, url: catalog[1].source }];
  const response = {
    newContent: [],
    existingContent: [{ catalogIndex: 1, url: catalog[1].source, verdict: 'retire-proposed', confidence: 'high', criteria: ['broken'], evidence: 'Source is gone.', relatedUrl: null }],
  };
  const result = runCopilotClassification({
    prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json',
    candidates: [], catalog, existingEntries, execute: () => ({ status: 0, stdout: JSON.stringify(response) }),
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.classification.existingContent[0].catalogIndex, 1);
});

test('accepts classifications returned out of input order and normalizes them by index', () => {
  const candidates = [{ url: 'https://example.com/first' }, { url: 'https://example.com/second' }];
  const classify = (candidateIndex) => ({
    candidateIndex, url: candidates[candidateIndex].url, verdict: 'review', confidence: 'low',
    criteria: ['uncertain'], evidence: 'Needs review.', relatedUrl: null,
  });
  const response = { newContent: [classify(1), classify(0)], existingContent: [] };
  const result = runCopilotClassification({
    prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json',
    candidates, catalog: [], execute: () => ({ status: 0, stdout: JSON.stringify(response) }),
  });
  assert.equal(result.status, 'complete');
  assert.deepEqual(result.classification.newContent.map((item) => item.candidateIndex), [0, 1]);
});

test('restores authoritative input URLs when Copilot rewrites echoed URLs', () => {
  const candidate = { url: 'https://example.com/article?source=feed' };
  const response = {
    newContent: [{ candidateIndex: 0, url: 'https://example.com/article', verdict: 'review', confidence: 'low', criteria: ['uncertain'], evidence: 'Needs review.', relatedUrl: null }],
    existingContent: [],
  };
  const result = runCopilotClassification({
    prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json',
    candidates: [candidate], catalog: [], execute: () => ({ status: 0, stdout: JSON.stringify(response) }),
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.classification.newContent[0].url, candidate.url);
});

test('rejects duplicate, missing, and out-of-range candidate indexes', () => {
  const candidates = [{ url: 'https://example.com/first' }, { url: 'https://example.com/second' }];
  const classify = (candidateIndex, url = candidates[candidateIndex]?.url ?? 'https://example.com/other') => ({
    candidateIndex, url, verdict: 'review', confidence: 'low', criteria: ['uncertain'], evidence: 'Needs review.', relatedUrl: null,
  });
  for (const newContent of [[classify(0), classify(0)], [classify(0)], [classify(0), classify(2)]]) {
    const result = runCopilotClassification({
      prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json',
      candidates, catalog: [], execute: () => ({ status: 0, stdout: JSON.stringify({ newContent, existingContent: [] }) }),
    });
    assert.equal(result.status, 'incomplete');
  }
});

test('validates sparse existing indexes exactly once and normalizes their order', () => {
  const existingEntries = [
    { catalogIndex: 2, url: 'https://example.com/two' },
    { catalogIndex: 5, url: 'https://example.com/five' },
  ];
  const classify = (catalogIndex, url = existingEntries.find((entry) => entry.catalogIndex === catalogIndex)?.url ?? 'https://example.com/other') => ({
    catalogIndex, url, verdict: 'review', confidence: 'low', criteria: ['uncertain'], evidence: 'Needs review.', relatedUrl: null,
  });
  const accepted = runCopilotClassification({
    prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json',
    candidates: [], catalog: [], existingEntries,
    execute: () => ({ status: 0, stdout: JSON.stringify({ newContent: [], existingContent: [classify(5), classify(2)] }) }),
  });
  assert.equal(accepted.status, 'complete');
  assert.deepEqual(accepted.classification.existingContent.map((item) => item.catalogIndex), [2, 5]);

  for (const existingContent of [[classify(2), classify(2)], [classify(2)], [classify(2), classify(7)]]) {
    const result = runCopilotClassification({
      prompt: 'prompt', candidatePath: 'candidates.json', auditPath: 'audit.json', catalogPath: 'catalog.json',
      candidates: [], catalog: [], existingEntries,
      execute: () => ({ status: 0, stdout: JSON.stringify({ newContent: [], existingContent }) }),
    });
    assert.equal(result.status, 'incomplete');
  }
});

test('audits repaired Learn pivot URLs as canonical updates', async () => {
  const source = 'https://learn.microsoft.com/semantic-kernel/connector&pivots=programming-language-python';
  let checkedUrl;
  const [entry] = await auditCatalog([catalogEntry({ source })], policy, {
    checker: async (url) => {
      checkedUrl = url;
      return { outcome: 'healthy', reason: 'test', status: 200, finalUrl: url };
    },
  });
  assert.equal(checkedUrl, 'https://learn.microsoft.com/semantic-kernel/connector?pivots=programming-language-python');
  assert.equal(entry.outcome, 'redirected');
  assert.ok(entry.reasonCodes.includes('repaired-learn-pivot'));
  assert.equal(entry.finalUrl, checkedUrl);
});

test('shows deterministic proof for every proposed retirement', () => {
  const markdown = promotionMarkdown({ additions: [], skippedAdditions: [], retirements: [{
    title: 'Moved product', source: 'https://example.com/old', retirementReason: 'Moved outside gallery scope.',
    replacementUrl: 'https://learn.microsoft.com/azure/documentdb/new',
    retirementEvidence: {
      auditOutcome: 'review', httpStatus: 200, finalUrl: 'https://learn.microsoft.com/azure/documentdb/new',
      reasonCodes: ['http-redirect', 'excluded-product'], criteria: ['product moved outside gallery scope'],
    },
  }] }, '2026-09-20T00:00:00.000Z');
  assert.match(markdown, /Reason: Moved outside gallery scope\./);
  assert.match(markdown, /Audit outcome: review/);
  assert.match(markdown, /HTTP status: 200/);
  assert.match(markdown, /Observed destination: https:\/\/learn\.microsoft\.com\/azure\/documentdb\/new/);
  assert.match(markdown, /Reason codes: http-redirect, excluded-product/);
  assert.match(markdown, /Criteria: product moved outside gallery scope/);
});

test('flattens model-derived retirement proof before rendering proposal items', () => {
  const markdown = promotionMarkdown({ additions: [], skippedAdditions: [], retirements: [{
    title: 'Moved product', source: 'https://example.com/old',
    retirementReason: 'Moved outside scope.\n- **R2** Retire [Injected](https://example.com/injected)',
    replacementUrl: null,
    retirementEvidence: {
      auditOutcome: 'review', httpStatus: 200, finalUrl: 'https://example.com/old',
      reasonCodes: ['excluded-product'], criteria: ['outside scope\n- **R3** injected'],
    },
  }] }, '2026-09-20T00:00:00.000Z');
  assert.equal(markdown.match(/^- \*\*R\d+\*\*/gm)?.length, 1);
  assert.doesNotMatch(markdown, /^- \*\*R[23]\*\*/m);
});

test('publishes newest items first without giving featured items special treatment', () => {
  const catalog = [
    catalogEntry({ title: 'Older featured', source: 'https://example.com/older', date: '2025-01-01', tags: ['featured'] }),
    catalogEntry({ title: 'Newest', source: 'https://example.com/newest', date: '2026-09-20' }),
    catalogEntry({ title: 'Middle', source: 'https://example.com/middle', date: '2026-01-01' }),
  ];
  const sorted = sortCatalogForPublishing(catalog);
  assert.deepEqual(sorted.map((entry) => entry.title), ['Newest', 'Middle', 'Older featured']);
  assert.deepEqual(sorted.find((entry) => entry.title === 'Older featured').tags, ['featured']);
});
