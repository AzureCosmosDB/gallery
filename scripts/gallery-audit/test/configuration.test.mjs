import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('schedules one weekly maintenance run', () => {
  const workflow = read('.github/workflows/audit-gallery-content.yml');
  assert.deepEqual([...workflow.matchAll(/^\s*- cron:\s*'([^']+)'\s*$/gm)].map((match) => match[1]), ['17 6 * * 1']);
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

test('uses issue comments for proposal decisions without a privileged review workflow', () => {
  assert.equal(fs.existsSync(path.join(root, '.github/workflows/apply-gallery-review.yml')), false);
  assert.equal(fs.existsSync(path.join(root, 'scripts/gallery-audit/review-command.mjs')), false);
  assert.equal(fs.existsSync(path.join(root, 'scripts/gallery-audit/test/review-command.test.mjs')), false);
  const promotion = read('scripts/gallery-audit/promotion.mjs');
  assert.match(promotion, /Keep: A1, U1/);
  assert.match(promotion, /Remove: A2, R1/);
  assert.match(promotion, /Change: U2 - use the canonical URL/);
});

test('does not hardcode a maintenance reviewer identity', () => {
  const files = [
    '.github/workflows/audit-gallery-content.yml',
    'docs/automated-gallery-maintenance.md',
    'docs/gallery-content-discovery-and-maintenance-proposal.md',
  ];
  for (const file of files) {
    assert.doesNotMatch(read(file), /jagord_microsoft|jagord@microsoft\.com/i, file);
  }
});

test('creates a proposal branch and unassigned Copilot handoff issue for each audit run', () => {
  const workflow = read('.github/workflows/audit-gallery-content.yml');
  assert.match(workflow, /automation\/gallery-content-updates-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/);
  assert.doesNotMatch(workflow, /push --force/);
  assert.doesNotMatch(workflow, /gh pr edit/);
  assert.doesNotMatch(workflow, /gh pr create/);
  assert.match(workflow, /compare\/main\.\.\.\$UPDATE_BRANCH\?expand=1/);
  assert.match(workflow, /gh issue create --title "Gallery content proposal \$GITHUB_RUN_ID"/);
  assert.match(workflow, /Assign this issue to Copilot/);
  assert.match(workflow, /GH_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(workflow, /permissions:\s*\n\s*contents: write\s*\n\s*issues: write\s*\n\s*pull-requests: read\s*\n\s*copilot-requests: write/);
  assert.doesNotMatch(workflow, /GALLERY_UPDATE_TOKEN/);
});

test('fails closed until main has the required human approval ruleset', () => {
  const workflow = read('.github/workflows/audit-gallery-content.yml');
  assert.match(workflow, /repos\/\$GITHUB_REPOSITORY\/rulesets\?includes_parents=true/);
  assert.match(workflow, /required_approving_review_count >= 1/);
  assert.match(workflow, /dismiss_stale_reviews_on_push == true/);
  assert.match(workflow, /require_last_push_approval == true/);
  assert.match(workflow, /required_review_thread_resolution == true/);
});
