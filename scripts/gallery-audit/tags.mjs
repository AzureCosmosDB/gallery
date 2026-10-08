import { readFileSync } from 'node:fs';

const TAGS_SOURCE = new URL('../../src/data/tags.tsx', import.meta.url);
export const LANGUAGE_TAGS = ['python', 'csharp', 'java', 'javascript', 'typescript', 'go'];
const TAG_ALIASES = new Map([['azurevision', 'azure-vision']]);
const GITHUB_LANGUAGES = new Map([['python', 'python'], ['c#', 'csharp'], ['java', 'java'], ['javascript', 'javascript'], ['typescript', 'typescript'], ['go', 'go']]);

// Keyword rules run against title + description; first match per tag wins.
const RULES = [
  ['python', /\bpython\b|\bpip install\b|\.py\b|\bfastapi\b|\bflask\b|\bdjango\b/i],
  ['csharp', /\bc#|\bcsharp\b|\.net\b|\bdotnet\b|\basp\.net\b|\bblazor\b|\bentity framework\b|\befcore\b/i],
  ['java', /\bjava\b(?!script)|\bspring\b|\bquarkus\b|\bmicronaut\b/i],
  ['typescript', /\btypescript\b/i],
  ['javascript', /\bjavascript\b|\bnode\.?js\b|\bnext\.?js\b|\blangchain\.?js\b|\breact\b/i],
  ['go', /\bgolang\b|\bgo sdk\b|\bin go\b|\bgo (?:app|application|api|client)\b/i],
  ['generativeai', /\bai\b|\bgenerative\b|\bllm\b|\bopenai\b|\bagent|\bvector\b|\bembedding|\brag\b|retrieval[- ]augmented(?: generation)?|\bmcp\b|model context protocol|\bcopilot\b|\bsemantic kernel\b|\blangchain\b|\bgpt/i],
  ['agent', /\bagent/i],
  ['ragPattern', /\brag\b|retrieval[- ]augmented/i],
  ['mcp', /\bmcp\b|model context protocol/i],
  ['openai', /\bopenai\b/i],
  ['semantickernel', /\bsemantic kernel\b/i],
  ['langchain', /\blangchain\b/i],
];

let knownTags;
export function knownTagSet() {
  if (!knownTags) {
    const source = readFileSync(TAGS_SOURCE, 'utf8');
    const block = source.match(/export type TagType =([\s\S]*?);/)?.[1] ?? '';
    knownTags = new Set([...block.matchAll(/"([^"]+)"/g)].map((match) => match[1]));
  }
  return knownTags;
}

export function normalizeTag(tag) {
  const trimmed = String(tag).trim();
  const known = knownTagSet();
  if (known.has(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  return TAG_ALIASES.get(lower) ?? (known.has(lower) ? lower : null);
}

export function inferTags({ title, description, language }) {
  const text = `${title ?? ''} ${description ?? ''}`;
  const tags = RULES.filter(([, pattern]) => pattern.test(text)).map(([tag]) => tag);
  const repositoryLanguage = GITHUB_LANGUAGES.get(String(language ?? '').toLowerCase());
  const combined = repositoryLanguage && !tags.includes(repositoryLanguage) ? [...tags, repositoryLanguage] : tags;
  const languages = new Set(combined.filter((tag) => LANGUAGE_TAGS.includes(tag)).slice(0, 2));
  return combined.filter((tag) => !LANGUAGE_TAGS.includes(tag) || languages.has(tag));
}

export function mergeTags(existing, inferred) {
  const result = [];
  for (const tag of [...existing, ...inferred]) {
    const normalized = normalizeTag(tag);
    if (normalized && !result.includes(normalized)) result.push(normalized);
  }
  return result;
}

export function tagWarnings(entry) {
  const tags = entry.tags ?? [];
  const warnings = [];
  const known = knownTagSet();
  for (const tag of tags) {
    if (!known.has(tag)) warnings.push(`unknown tag "${tag}"`);
  }
  if (!tags.some((tag) => LANGUAGE_TAGS.includes(tag)) && !tags.includes('generativeai')) {
    warnings.push('no language or generativeai tag');
  }
  return warnings;
}
