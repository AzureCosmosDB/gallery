import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { inferTags, mergeTags } from './tags.mjs';

// Usage: node update-issue-tags.mjs <repo> <issue...> [--apply]. Rewrites "Tags:" lines in proposal issues.
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const [repo, ...rest] = args.filter((arg) => arg !== '--apply');
const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8' });

for (const number of rest) {
  const body = JSON.parse(gh('issue', 'view', number, '-R', repo, '--json', 'body')).body;
  const labels = new Set();
  const updated = body.split(/(?=^- \*\*[A-Z]\d+\*\* )/m).map((block) => {
    if (!/^- \*\*A\d+\*\* Add /.test(block)) return block;
    const title = block.match(/^- \*\*A\d+\*\* Add \[(.*?)\]\(/)?.[1] ?? '';
    const description = block.match(/^ {2}- Description: (.*)$/m)?.[1] ?? '';
    const current = (block.match(/^ {2}- Tags: (.*)$/m)?.[1] ?? '').split(',').map((tag) => tag.trim()).filter(Boolean);
    const tags = mergeTags(current, inferTags({ title, description }));
    tags.filter((tag) => tag === 'generativeai').forEach((tag) => labels.add(tag));
    console.log(`#${number} ${title.slice(0, 60)}: ${current.join(',')} -> ${tags.join(',')}`);
    return block.replace(/^( {2}- Tags: ).*$/m, `$1${tags.join(', ')}`);
  }).join('');
  if (apply) {
    const bodyFile = join(tmpdir(), `issue-${number}-${randomUUID()}.md`);
    writeFileSync(bodyFile, updated);
    try {
      gh('issue', 'edit', number, '-R', repo, '--body-file', bodyFile);
    } finally {
      rmSync(bodyFile, { force: true });
    }
    for (const label of labels) {
      try { gh('label', 'create', label, '-R', repo, '--color', '0E8A16'); } catch { /* exists */ }
      gh('issue', 'edit', number, '-R', repo, '--add-label', label);
    }
  }
}
