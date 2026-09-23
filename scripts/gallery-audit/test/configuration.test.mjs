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

test('uses direct issue editing for proposal decisions without a privileged review workflow', () => {
  assert.equal(fs.existsSync(path.join(root, '.github/workflows/apply-gallery-review.yml')), false);
  assert.equal(fs.existsSync(path.join(root, 'scripts/gallery-audit/review-command.mjs')), false);
  assert.equal(fs.existsSync(path.join(root, 'scripts/gallery-audit/test/review-command.test.mjs')), false);
  const promotion = read('scripts/gallery-audit/promotion.mjs');
  assert.match(promotion, /Edit this issue before assigning it to Copilot/);
  assert.match(promotion, /edited issue body is the source of truth/);
});

test('does not hardcode a maintenance reviewer identity', () => {
  const files = [
    '.github/workflows/audit-gallery-content.yml',
    '.github/workflows/publish-gallery-proposal.yml',
    'docs/automated-gallery-maintenance.md',
    'docs/gallery-content-discovery-and-maintenance-proposal.md',
  ];
  for (const file of files) {
    assert.doesNotMatch(read(file), /jagord_microsoft|jagord@microsoft\.com/i, file);
  }
});

test('keeps audit read-only and publishes only an issue through trusted workflow_run', () => {
  const audit = read('.github/workflows/audit-gallery-content.yml');
  assert.match(audit, /permissions:\s*\n\s*contents: read\s*\n\s*pull-requests: read\s*\n\s*copilot-requests: write/);
  assert.match(audit, /gallery-content-proposal-\$\{\{ github\.run_id \}\}/);
  assert.match(audit, /path: output\/gallery-content-review\/promotion-summary\.md/);
  assert.match(audit, /r\.additions\?\.length[\s\S]*r\.updates\?\.length[\s\S]*r\.retirements\?\.length/);
  assert.match(audit, /steps\.actionable\.outputs\.available == 'true'/);
  assert.doesNotMatch(audit, /contents: write|issues: write|git push|gh issue create/);

  const publisher = read('.github/workflows/publish-gallery-proposal.yml');
  assert.match(publisher, /workflow_run:[\s\S]*workflows: \[Audit gallery content\][\s\S]*types: \[completed\]/);
  assert.match(publisher, /workflow_run\.conclusion == 'success'/);
  assert.match(publisher, /workflow_run\.event != 'pull_request'/);
  assert.match(publisher, /workflow_run\.head_branch == github\.event\.repository\.default_branch/);
  assert.match(publisher, /permissions:\s*\n\s*actions: read\s*\n\s*issues: write/);
  assert.match(publisher, /gh issue create --title "Gallery content proposal \$SOURCE_RUN_ID"/);
  assert.match(publisher, /Treat the edited issue body as the complete source of truth/);
  assert.doesNotMatch(publisher, /contents: write|actions\/checkout|git push|gh pr create|gh pr edit|automation\/gallery-content-updates|GALLERY_UPDATE_TOKEN/);
});

test('fails closed until main has the required human approval ruleset', () => {
  const workflow = read('.github/workflows/audit-gallery-content.yml');
  assert.match(workflow, /repos\/\$GITHUB_REPOSITORY\/rulesets\?includes_parents=true/);
  assert.match(workflow, /required_approving_review_count >= 1/);
  assert.match(workflow, /dismiss_stale_reviews_on_push == true/);
  assert.match(workflow, /require_last_push_approval == true/);
  assert.match(workflow, /required_review_thread_resolution == true/);
});
