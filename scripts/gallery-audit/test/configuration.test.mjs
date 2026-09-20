import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('schedules one weekly maintenance run and notifies the designated reviewer for new PRs', () => {
  const workflow = read('.github/workflows/audit-gallery-content.yml');
  assert.deepEqual([...workflow.matchAll(/^\s*- cron:\s*'([^']+)'\s*$/gm)].map((match) => match[1]), ['17 6 * * 1']);
  assert.match(workflow, /^\s*NOTIFY_REVIEWER:\s*jagord_microsoft\s*$/m);
  assert.match(workflow, /gh pr create[^\n]*--reviewer "\$NOTIFY_REVIEWER"/);
});

test('pins and verifies the required curator skills', () => {
  const workflow = read('.github/workflows/audit-gallery-content.yml');
  const agent = read('.github/agents/gallery-curator.agent.md');
  const humanizer = read('.github/skills/humanizer/SKILL.md');

  assert.match(workflow, /CosmosDB-Agent-Kit\/[0-9a-f]{40}\/skills\/cosmosdb-best-practices\/SKILL\.md/);
  assert.match(workflow, /AGENT_KIT_SKILL_SHA256:\s*[0-9a-f]{64}/);
  assert.match(workflow, /copilot skill list --json/);
  for (const skill of ['cosmosdb-best-practices', 'humanizer']) {
    assert.match(workflow, new RegExp(skill));
    assert.match(agent, new RegExp(`\`${skill}\``));
  }
  assert.match(humanizer, /^name: humanizer$/m);
  assert.match(humanizer, /Preserve every fact, verdict, confidence value, index, URL, and JSON field\./);
});

test('stages the complete review-command module chain before switching branches', () => {
  const workflow = read('.github/workflows/apply-gallery-review.yml');
  for (const module of ['review-command.mjs', 'promotion.mjs', 'normalize.mjs']) {
    assert.match(workflow, new RegExp(`cp scripts/gallery-audit/${module.replace('.', '\\.')}`));
  }
  assert.match(workflow, /node "\$RUNNER_TEMP\/gallery-review\/review-command\.mjs"/);
});
