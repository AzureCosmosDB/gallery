import { readFileSync, writeFileSync } from 'node:fs';
import { LANGUAGE_TAGS, inferTags, mergeTags } from './tags.mjs';

// Usage: node backfill-tags.mjs [--apply]. Dry run prints the diff only.
const apply = process.argv.includes('--apply');
const files = ['static/templates.json', 'static/retired-templates.json'];
let changed = 0;

for (const file of files) {
  const catalog = JSON.parse(readFileSync(file, 'utf8'));
  for (const entry of catalog) {
    const before = entry.tags ?? [];
    // Entries that already have a language or generativeai tag are left untouched.
    if (before.some((tag) => tag === 'generativeai' || LANGUAGE_TAGS.includes(tag))) continue;
    const inferred = inferTags(entry).filter((tag) => tag === 'generativeai' || tag === 'agent' || tag === 'mcp' || LANGUAGE_TAGS.includes(tag));
    const after = [...before, ...mergeTags([], inferred)];
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    changed += 1;
    console.log(`${file} | ${entry.title.slice(0, 70)}\n    ${before.join(',')}  ->  ${after.join(',')}`);
    entry.tags = after;
  }
  if (apply) writeFileSync(file, `${JSON.stringify(catalog, null, 2)}\n`);
}
console.log(`${changed} entries ${apply ? 'updated' : 'would change'}`);
