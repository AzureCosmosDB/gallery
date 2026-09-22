import dns from 'node:dns/promises';
import net from 'node:net';
import { XMLParser } from 'fast-xml-parser';
import { normalizeUrl, urlFingerprint } from './normalize.mjs';

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const REQUIRED_STRING_FIELDS = ['title', 'description', 'preview', 'website', 'source', 'date'];
const NON_EMPTY_FIELDS = new Set(['title', 'description', 'source', 'date']);
const CONTENT_TYPES = new Set(['example', 'blog', 'video', 'documentation']);
const CATALOG_URL_FIELDS = ['source', 'website', 'preview', 'replacementUrl'];

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function privateAddress(address) {
  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    const dotted = normalized.match(/^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/);
    const hexadecimal = dotted
      ? `${dotted[1]}${dotted[2].split('.').reduce((parts, octet, index, octets) => {
        if (index % 2 === 0) parts.push(((Number(octet) << 8) | Number(octets[index + 1])).toString(16));
        return parts;
      }, []).join(':')}`
      : normalized;
    const [left, right = ''] = hexadecimal.split('::');
    const leftParts = left ? left.split(':') : [];
    const rightParts = right ? right.split(':') : [];
    const parts = hexadecimal.includes('::')
      ? [...leftParts, ...Array(8 - leftParts.length - rightParts.length).fill('0'), ...rightParts]
      : leftParts;
    if (parts.length === 8 && parts.slice(0, 5).every((part) => Number.parseInt(part, 16) === 0) && Number.parseInt(parts[5], 16) === 0xffff) {
      const high = Number.parseInt(parts[6], 16);
      const low = Number.parseInt(parts[7], 16);
      return privateAddress(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
    }
    return normalized === '::'
      || normalized === '::1'
      || normalized.startsWith('fc')
      || normalized.startsWith('fd')
      || normalized.startsWith('fe8')
      || normalized.startsWith('fe9')
      || normalized.startsWith('fea')
      || normalized.startsWith('feb')
      || normalized.startsWith('ff');
  }
  if (!net.isIPv4(address)) return true;
  const [first, second] = address.split('.').map(Number);
  return first === 0 || first === 10 || first === 127 || (first === 169 && second === 254) || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168);
}

async function assertSafeUrl(value, allowPrivate) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported-protocol');
  if (url.username || url.password) throw new Error('embedded-credentials');
  if (allowPrivate) return url;
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) throw new Error('private-host');
  const addresses = net.isIP(hostname) ? [{ address: hostname }] : await dns.lookup(hostname, { all: true });
  if (addresses.length === 0 || addresses.some(({ address }) => privateAddress(address))) throw new Error('private-host');
  return url;
}

async function readBoundedBody(response, maximumBytes) {
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) throw new Error('response-too-large');
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximumBytes) {
      await reader.cancel();
      throw new Error('response-too-large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function boundedGet(value, policy, options = {}) {
  const timeoutSignal = AbortSignal.timeout(policy.requestTimeoutMs);
  let current = new URL(value);
  let redirects = 0;
  while (true) {
    await assertSafeUrl(current, options.allowPrivate === true);
    if (options.allowedHostnames && !options.allowedHostnames.includes(current.hostname.toLowerCase())) throw new Error('hostname-not-allowlisted');
    const response = await (options.fetchImpl ?? fetch)(current, {
      headers: options.headers,
      redirect: 'manual',
      signal: timeoutSignal,
    });
    if (REDIRECT_STATUSES.has(response.status) && response.headers.get('location')) {
      if (redirects >= policy.redirectLimit) throw new Error('redirect-limit');
      current = new URL(response.headers.get('location'), current);
      redirects += 1;
      continue;
    }
    return {
      body: await readBoundedBody(response, policy.maxResponseBytes),
      finalUrl: current.toString(),
      redirects,
      status: response.status,
    };
  }
}

function statusResult(result) {
  if (result.status === 404 || result.status === 410) return { outcome: 'broken', reason: `http-${result.status}` };
  if (result.status < 200 || result.status >= 300) return { outcome: 'indeterminate', reason: `http-${result.status}` };
  if (result.redirects > 0) return { outcome: 'redirected', reason: 'http-redirect' };
  return { outcome: 'healthy', reason: 'http-ok' };
}

function githubRepository(value) {
  const url = new URL(value);
  const parts = url.pathname.split('/').filter(Boolean);
  return url.hostname.toLowerCase() === 'github.com' && parts.length >= 2
    ? { owner: parts[0], repository: parts[1].replace(/\.git$/i, ''), hasPath: parts.length > 2 }
    : null;
}

function youtubeVideo(value) {
  const normalized = new URL(normalizeUrl(value));
  return normalized.hostname === 'www.youtube.com' && normalized.pathname === '/watch' && normalized.searchParams.has('v')
    ? normalized.toString()
    : null;
}

export async function checkUrl(value, policy, options = {}) {
  try {
    const videoUrl = youtubeVideo(value);
    if (videoUrl) {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
      const result = await boundedGet(oembedUrl, policy, { ...options, allowedHostnames: ['www.youtube.com'] });
      if (result.status === 404 || result.status === 410) return { ...result, finalUrl: videoUrl, outcome: 'broken', reason: 'youtube-unavailable' };
      if (result.status < 200 || result.status >= 300) return { ...result, finalUrl: videoUrl, outcome: 'indeterminate', reason: `youtube-http-${result.status}` };
      return { ...result, finalUrl: videoUrl, outcome: 'healthy', reason: 'youtube-available' };
    }
    const repository = githubRepository(value);
    if (repository && options.githubApi !== false) {
      const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'gallery-content-audit' };
      const githubToken = options.githubToken ?? process.env.GITHUB_TOKEN;
      if (githubToken) headers.Authorization = `Bearer ${githubToken}`;
      const apiResult = await boundedGet(`https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repository)}`, policy, {
        ...options,
        allowedHostnames: ['api.github.com'],
        headers,
      });
      if (apiResult.status === 404 || apiResult.status === 410) return { ...apiResult, outcome: 'broken', reason: 'github-missing' };
      if (apiResult.status < 200 || apiResult.status >= 300) return { ...apiResult, outcome: 'indeterminate', reason: `github-http-${apiResult.status}` };
      const metadata = JSON.parse(apiResult.body);
      if (metadata.private) return { ...apiResult, outcome: 'review', reason: 'github-private' };
      if (metadata.disabled) return { ...apiResult, outcome: 'review', reason: 'github-disabled' };
      if (metadata.archived) return { ...apiResult, outcome: 'review', reason: 'github-archived' };
      if (repository.hasPath) {
        const { headers: _headers, ...pathOptions } = options;
        const pathResult = await boundedGet(value, policy, { ...pathOptions, allowedHostnames: ['github.com'] });
        return { ...pathResult, ...statusResult(pathResult) };
      }
      const finalUrl = metadata.html_url ?? value;
      const repositoryChanged = urlFingerprint(finalUrl, policy.trackingParameters) !== urlFingerprint(value, policy.trackingParameters);
      return apiResult.redirects > 0 || repositoryChanged
        ? { ...apiResult, finalUrl, outcome: 'redirected', reason: 'github-redirect' }
        : { ...apiResult, finalUrl, outcome: 'healthy', reason: 'github-active' };
    }
    const result = await boundedGet(value, policy, options);
    return { ...result, ...statusResult(result) };
  } catch (error) {
    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return {
      finalUrl: value,
      status: null,
      outcome: 'indeterminate',
      reason: timeout ? 'timeout' : (error?.message ?? 'network-error'),
    };
  }
}

export function validateCatalog(catalog) {
  if (!Array.isArray(catalog)) throw new TypeError('Catalog must be an array');
  catalog.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new TypeError(`Catalog entry ${index} must be an object`);
    for (const field of REQUIRED_STRING_FIELDS) {
      if (typeof entry[field] !== 'string' || (NON_EMPTY_FIELDS.has(field) && entry[field].trim() === '')) throw new TypeError(`Catalog entry ${index} has invalid ${field}`);
    }
    if ((typeof entry.author !== 'string' && !Array.isArray(entry.author)) || (Array.isArray(entry.author) && entry.author.some((author) => typeof author !== 'string'))) throw new TypeError(`Catalog entry ${index} has invalid author`);
    if (!Array.isArray(entry.tags) || entry.tags.some((tag) => typeof tag !== 'string')) throw new TypeError(`Catalog entry ${index} has invalid tags`);
    if (Number.isNaN(Date.parse(entry.date))) throw new TypeError(`Catalog entry ${index} has invalid date`);
    for (const [field, value] of [
      ...CATALOG_URL_FIELDS.map((field) => [field, entry[field]]),
      ['retirementEvidence.finalUrl', entry.retirementEvidence?.finalUrl],
    ]) {
      if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) continue;
      const url = new URL(value);
      if (['learn.microsoft.com', 'docs.microsoft.com'].includes(url.hostname.toLowerCase()) && /^\/[a-z]{2}-[a-z]{2}(?:\/|$)/i.test(url.pathname)) {
        throw new TypeError(`Catalog entry ${index} has localized Microsoft documentation URL in ${field}`);
      }
    }
    normalizeUrl(entry.source);
  });
  return catalog.length;
}

export function findDuplicates(catalog, trackingParameters = []) {
  const exact = new Map();
  const normalized = new Map();
  catalog.forEach((entry, index) => {
    const exactKey = entry.source.trim();
    const normalizedKey = urlFingerprint(entry.source, trackingParameters);
    exact.set(exactKey, [...(exact.get(exactKey) ?? []), index]);
    normalized.set(normalizedKey, [...(normalized.get(normalizedKey) ?? []), index]);
  });
  return catalog.map((entry) => ({
    exact: exact.get(entry.source.trim()).filter((index) => catalog[index] !== entry),
    normalized: normalized.get(urlFingerprint(entry.source, trackingParameters)).filter((index) => catalog[index] !== entry),
  }));
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  const workerCount = Math.min(items.length, Math.max(1, Number.isInteger(limit) ? limit : 1));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

function reviewSignals(entry, policy, now) {
  const signals = [];
  const ageDays = (now.getTime() - Date.parse(entry.date)) / 86_400_000;
  if (ageDays > policy.ageReviewThresholdDays) signals.push('age-review');
  const text = `${entry.title} ${entry.description} ${entry.source}`.toLowerCase();
  if (policy.knownRetiredTerms.some((term) => text.includes(term.toLowerCase()))) signals.push('known-retired-term');
  return signals;
}

function isExcludedCatalogContent(policy, ...values) {
  const text = values.filter(Boolean).join(' ').toLowerCase();
  if ((policy.excludedCatalogTerms ?? []).some((term) => text.includes(term.toLowerCase()))) return true;
  return values.some((value) => {
    try {
      const normalized = normalizeUrl(String(value), policy.trackingParameters);
      return (policy.excludedCatalogUrlPrefixes ?? []).some((prefix) => normalized.startsWith(prefix));
    } catch {
      return false;
    }
  });
}

export async function auditCatalog(catalog, policy, options = {}) {
  validateCatalog(catalog);
  const duplicates = findDuplicates(catalog, policy.trackingParameters);
  const scannedAt = (options.now ?? new Date()).toISOString();
  const checker = options.checker ?? ((url) => checkUrl(url, policy));
  return mapWithConcurrency(catalog, policy.auditConcurrency ?? 8, async (item, index) => {
    const normalizedUrl = normalizeUrl(item.source, policy.trackingParameters);
    const checked = await checker(normalizedUrl);
    const signals = reviewSignals(item, policy, options.now ?? new Date());
    if (isExcludedCatalogContent(policy, checked.finalUrl)) signals.push('excluded-product');
    if (checked.outcome === 'redirected' && checked.finalUrl) {
      try {
        if (new URL(normalizedUrl).hostname !== new URL(checked.finalUrl).hostname) signals.push('redirect-unapproved-host');
      } catch {
        signals.push('redirect-invalid-destination');
      }
    }
    let outcome = checked.outcome;
    const repairedLearnPivot = item.source.includes('&pivots=') && normalizedUrl.includes('?pivots=');
    if (outcome === 'healthy' && repairedLearnPivot) outcome = 'redirected';
    const duplicate = duplicates[index];
    if (!['broken', 'indeterminate'].includes(outcome) && (duplicate.exact.length > 0 || duplicate.normalized.length > 0)) outcome = 'duplicate';
    else if (['healthy', 'redirected'].includes(outcome) && signals.length > 0) outcome = 'review';
    return {
      catalogIndex: index,
      title: item.title,
      url: item.source,
      normalizedUrl,
      outcome,
      reasonCodes: [checked.reason, repairedLearnPivot ? 'repaired-learn-pivot' : null, outcome !== checked.outcome ? outcome : null, ...signals].filter(Boolean),
      httpStatus: checked.status ?? null,
      finalUrl: checked.finalUrl ?? normalizedUrl,
      duplicates: duplicate,
      scannedAt,
      classification: null,
    };
  });
}

function textValue(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object') return String(value['#text'] ?? value.name ?? '');
  return '';
}

function entryLink(entry) {
  for (const link of asArray(entry.link)) {
    if (typeof link === 'string') return link;
    if (link?.['@_href'] && (!link['@_rel'] || link['@_rel'] === 'alternate')) return link['@_href'];
    if (link?.['#text']) return link['#text'];
  }
  return '';
}

function inclusionSignals(source, policy, ...values) {
  const terms = source.inclusionTerms ?? policy.inclusionTerms;
  const haystack = values.filter(Boolean).join(' ').toLowerCase();
  return terms.filter((term) => haystack.includes(term.toLowerCase()));
}

function sourceContentType(source) {
  const contentType = source.contentType ?? ((source.kind ?? 'feed') === 'feed' ? 'blog' : null);
  if (!CONTENT_TYPES.has(contentType)) throw new Error('invalid-content-type');
  return contentType;
}

function learnPathPrefixes(source) {
  return source.allowedPathPrefixes ?? ['/azure/cosmos-db/'];
}

function matchesPathPrefix(pathname, prefix) {
  const root = prefix.replace(/\/$/, '');
  return pathname === root || pathname.startsWith(`${root}/`);
}

function decodeEntities(value) {
  const named = { amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"' };
  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);/gi, (match, entity) => {
    if (entity[0] !== '#') return named[entity.toLowerCase()] ?? match;
    const hexadecimal = entity[1]?.toLowerCase() === 'x';
    const codePoint = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : match;
  });
}

function boundedSummary(value, maximumLength = 1000) {
  const plainText = decodeEntities(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
  if (plainText.length <= maximumLength) return plainText;
  const sentenceEnd = Math.max(
    plainText.lastIndexOf('.', maximumLength),
    plainText.lastIndexOf('!', maximumLength),
    plainText.lastIndexOf('?', maximumLength),
  );
  if (sentenceEnd >= Math.floor(maximumLength / 2)) return plainText.slice(0, sentenceEnd + 1);
  const wordEnd = plainText.lastIndexOf(' ', maximumLength - 1);
  return `${plainText.slice(0, wordEnd > 0 ? wordEnd : maximumLength - 1).trimEnd()}...`;
}

function candidateFromMetadata(source, policy, metadata, now) {
  const publishedTime = Date.parse(metadata.publishedAt);
  if (!Number.isFinite(publishedTime) || publishedTime > now.getTime()) return null;
  const contentType = sourceContentType(source);
  if (isExcludedCatalogContent(policy, metadata.title, metadata.summary, metadata.url, ...(metadata.topics ?? []))) return null;
  const matchedTerms = inclusionSignals(source, policy, metadata.title, metadata.summary, metadata.url, ...(metadata.topics ?? []));
  if (matchedTerms.length === 0) return null;
  return {
    candidateIndex: 0,
    sourceId: source.id,
    contentType,
    title: metadata.title.trim(),
    url: normalizeUrl(metadata.url, policy.trackingParameters),
    publishedAt: new Date(publishedTime).toISOString(),
    author: metadata.author?.trim() || null,
    summary: boundedSummary(metadata.summary),
    signals: [`trust:${source.trustTier}`, `type:${contentType}`, ...matchedTerms.map((term) => `term:${term.toLowerCase()}`)],
    discoveredAt: now.toISOString(),
    classification: null,
  };
}

export function discoverFromFeed(xml, source, policy, existingFingerprints, options = {}) {
  const parser = new XMLParser({ ignoreAttributes: false, processEntities: false, trimValues: true });
  const parsed = parser.parse(xml);
  const entries = asArray(parsed.rss?.channel?.item ?? parsed.feed?.entry);
  const now = options.now ?? new Date();
  const earliest = now.getTime() - source.lookbackDays * 86_400_000;
  const seen = new Set();
  const candidates = [];
  for (const entry of entries) {
    const title = textValue(entry.title).trim();
    const rawUrl = entryLink(entry).trim();
    const publishedAt = textValue(entry.pubDate ?? entry.published ?? entry.updated).trim();
    const summary = textValue(entry.description ?? entry.summary ?? entry.content ?? entry['media:group']?.['media:description']);
    if (!title || !rawUrl || !publishedAt || Number.isNaN(Date.parse(publishedAt)) || Date.parse(publishedAt) < earliest) continue;
    let normalized;
    try {
      normalized = normalizeUrl(rawUrl, policy.trackingParameters);
    } catch {
      continue;
    }
    if (!source.allowedHostnames.includes(new URL(normalized).hostname.toLowerCase())) continue;
    const fingerprint = urlFingerprint(normalized, policy.trackingParameters);
    const candidate = candidateFromMetadata(source, policy, {
      title,
      url: normalized,
      publishedAt,
      author: textValue(entry.author ?? entry['dc:creator']),
      summary,
    }, now);
    if (!candidate || existingFingerprints.has(fingerprint) || seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    candidate.candidateIndex = candidates.length;
    candidates.push(candidate);
  }
  return candidates;
}

export function discoverFromGithubSearch(value, source, policy, existingFingerprints, options = {}) {
  const document = typeof value === 'string' ? JSON.parse(value) : value;
  if (!document || typeof document !== 'object' || !Array.isArray(document.items)) throw new Error('github-search-invalid');
  if (document.incomplete_results === true) throw new Error('github-search-incomplete');
  const now = options.now ?? new Date();
  const earliest = now.getTime() - source.lookbackDays * 86_400_000;
  const allowedOwners = new Set((source.allowedOwners ?? []).map((owner) => owner.toLowerCase()));
  return asArray(document.items).flatMap((repository) => {
    if (!repository || typeof repository !== 'object' || Array.isArray(repository)) return [];
    const timestamp = repository.created_at;
    if (!repository?.name || !repository.html_url || !timestamp || Date.parse(timestamp) < earliest) return [];
    if (repository.private || repository.visibility !== 'public' || repository.archived || repository.disabled || repository.fork || repository.size === 0) return [];
    if (!allowedOwners.has(String(repository.owner?.login).toLowerCase())) return [];
    let fingerprint;
    try {
      fingerprint = urlFingerprint(repository.html_url, policy.trackingParameters);
    } catch {
      return [];
    }
    if (existingFingerprints.has(fingerprint)) return [];
    const candidate = candidateFromMetadata(source, policy, {
      title: repository.name,
      url: repository.html_url,
      publishedAt: timestamp,
      author: null,
      summary: repository.description ?? '',
      topics: repository.topics,
    }, now);
    return candidate?.summary ? [candidate] : [];
  });
}

export function discoverFromLearnSearch(value, source, policy, existingFingerprints, options = {}) {
  const document = typeof value === 'string' ? JSON.parse(value) : value;
  if (!document || typeof document !== 'object' || !Array.isArray(document.results)) throw new Error('learn-search-invalid');
  const now = options.now ?? new Date();
  const earliest = now.getTime() - source.lookbackDays * 86_400_000;
  const prefixes = learnPathPrefixes(source);
  return asArray(document.results).flatMap((result) => {
    if (!result?.title || !result.url || !result.lastUpdatedDate || Date.parse(result.lastUpdatedDate) < earliest) return [];
    let normalized;
    try {
      normalized = normalizeUrl(result.url, policy.trackingParameters);
    } catch {
      return [];
    }
    const url = new URL(normalized);
    if (url.hostname !== 'learn.microsoft.com' || !prefixes.some((prefix) => matchesPathPrefix(url.pathname, prefix))) return [];
    const fingerprint = urlFingerprint(normalized, policy.trackingParameters);
    if (existingFingerprints.has(fingerprint)) return [];
    const candidate = candidateFromMetadata(source, policy, {
      title: result.title,
      url: normalized,
      publishedAt: result.lastUpdatedDate,
      author: source.catalogDefaults?.author,
      summary: result.description ?? '',
      topics: result.products,
    }, now);
    return candidate?.summary ? [candidate] : [];
  });
}

async function sourceBody(source, requestUrl, policy, options, allowedHostnames = source.allowedHostnames) {
  const provided = options.sourceProvider
    ? await options.sourceProvider(source, requestUrl)
    : options.feedProvider && (source.kind ?? 'feed') === 'feed'
      ? await options.feedProvider(source)
      : null;
  if (provided !== null) {
    if (typeof provided === 'string') return provided;
    if (provided.status < 200 || provided.status >= 300) throw new Error(`source-http-${provided.status}`);
    return provided.body;
  }
  const headers = { 'User-Agent': 'gallery-content-discovery' };
  if (requestUrl.startsWith('https://api.github.com/')) {
    headers.Accept = 'application/vnd.github+json';
    const token = options.githubToken ?? process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const result = await boundedGet(requestUrl, policy, { allowedHostnames, fetchImpl: options.fetchImpl, headers });
  if (result.status < 200 || result.status >= 300) throw new Error(`source-http-${result.status}`);
  return result.body;
}

async function discoverSource(source, policy, existing, options) {
  const kind = source.kind ?? 'feed';
  if (kind === 'youtube') {
    const handlePolicy = { ...policy, maxResponseBytes: source.handleMaxResponseBytes ?? 4 * 1024 * 1024 };
    const handleBody = await sourceBody(source, source.url, handlePolicy, options, ['www.youtube.com']);
    const channelMatch = String(handleBody).match(/"(?:channelId|externalId|browseId)":"(UC[A-Za-z0-9_-]{20,})"|youtube\.com\/channel\/(UC[A-Za-z0-9_-]{20,})/);
    const channelId = channelMatch?.[1] ?? channelMatch?.[2];
    if (!channelId) throw new Error('youtube-channel-id-not-found');
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
    const xml = await sourceBody(source, feedUrl, policy, options, ['www.youtube.com']);
    return discoverFromFeed(xml, source, policy, existing, { now: options.now });
  }
  const sourceHostnames = kind === 'github-search' ? ['api.github.com'] : source.allowedHostnames;
  const body = await sourceBody(source, source.url, policy, options, sourceHostnames);
  if (kind === 'github-search') return discoverFromGithubSearch(body, source, policy, existing, { now: options.now });
  if (kind === 'learn-search') return discoverFromLearnSearch(body, source, policy, existing, { now: options.now });
  return discoverFromFeed(body, source, policy, existing, { now: options.now });
}

export async function discoverContent(sources, policy, liveCatalog, retiredCatalog, options = {}) {
  const existing = new Set([...liveCatalog, ...retiredCatalog].map((entry) => urlFingerprint(entry.source, policy.trackingParameters)));
  const enabledSources = sources.filter((item) => item.enabled);
  const candidateLimit = policy.discoveryCandidateLimit ?? 40;
  const candidates = [];
  const sourceStates = [];
  const seen = new Set();
  for (const source of enabledSources) {
    try {
      const sourceUrl = new URL(source.url);
      if (!source.allowedHostnames.includes(sourceUrl.hostname.toLowerCase())) throw new Error('source-hostname-not-allowlisted');
      const discovered = await discoverSource(source, policy, existing, options);
      const sourceLimit = source.maxCandidates ?? 25;
      const sourceTruncated = discovered.length > sourceLimit;
      sourceStates.push({
        source,
        discovered: discovered.slice(0, sourceLimit),
        status: sourceTruncated ? 'partial' : 'complete',
        error: sourceTruncated ? 'source-candidate-limit' : null,
      });
    } catch (error) {
      sourceStates.push({ source, discovered: [], status: 'partial', error: error?.message ?? 'source-error' });
    }
  }

  const discoveredCount = sourceStates.reduce((total, state) => total + state.discovered.length, 0);
  let selected = sourceStates.flatMap((state) => state.discovered.map((candidate) => ({ candidate, source: state.source })));
  if (discoveredCount > candidateLimit) {
    selected = [];
    let round = 0;
    while (selected.length < candidateLimit) {
      let added = false;
      for (const state of sourceStates) {
        const candidate = state.discovered[round];
        if (!candidate) continue;
        selected.push({ candidate, source: state.source });
        added = true;
        if (selected.length === candidateLimit) break;
      }
      if (!added) break;
      round += 1;
    }
    const selectedCounts = new Map();
    for (const item of selected) selectedCounts.set(item.source.id, (selectedCounts.get(item.source.id) ?? 0) + 1);
    for (const state of sourceStates) {
      if ((selectedCounts.get(state.source.id) ?? 0) === state.discovered.length) continue;
      state.status = 'partial';
      state.error = 'aggregate-candidate-limit';
    }
  }

  const checkedCandidates = await mapWithConcurrency(selected, policy.discoveryConcurrency ?? policy.auditConcurrency ?? 8, async ({ candidate, source }) => {
    const checked = await (options.checker ?? ((url, checkOptions) => checkUrl(url, policy, checkOptions)))(candidate.url, {
      allowedHostnames: source.allowedHostnames,
      fetchImpl: options.fetchImpl,
      githubToken: options.githubToken,
    });
    if (!['healthy', 'redirected'].includes(checked.outcome)) return null;
    const finalUrl = new URL(normalizeUrl(checked.finalUrl ?? candidate.url, policy.trackingParameters));
    if (isExcludedCatalogContent(policy, finalUrl.toString())) return null;
    if (!source.allowedHostnames.includes(finalUrl.hostname.toLowerCase())) return null;
    if (source.kind === 'learn-search' && !learnPathPrefixes(source).some((prefix) => matchesPathPrefix(finalUrl.pathname, prefix))) return null;
    if (source.kind === 'github-search') {
      const repository = githubRepository(finalUrl.toString());
      const allowedOwners = new Set((source.allowedOwners ?? []).map((owner) => owner.toLowerCase()));
      if (!repository || !allowedOwners.has(repository.owner.toLowerCase())) return null;
    }
    const finalFingerprint = urlFingerprint(finalUrl.toString(), policy.trackingParameters);
    if (existing.has(finalFingerprint)) return null;
    candidate.url = finalUrl.toString();
    return candidate;
  });
  for (const candidate of checkedCandidates) {
    if (!candidate) continue;
    const fingerprint = urlFingerprint(candidate.url, policy.trackingParameters);
    if (seen.has(fingerprint)) continue;
    candidate.candidateIndex = candidates.length;
    seen.add(fingerprint);
    candidates.push(candidate);
  }
  const acceptedCounts = new Map();
  for (const candidate of candidates) acceptedCounts.set(candidate.sourceId, (acceptedCounts.get(candidate.sourceId) ?? 0) + 1);
  const sourceResults = sourceStates.map((state) => ({
    sourceId: state.source.id,
    status: state.status,
    candidateCount: acceptedCounts.get(state.source.id) ?? 0,
    ...(state.error ? { error: state.error } : {}),
  }));
  return { candidates, sourceResults };
}

export const discoverArticles = discoverContent;