import { danger, markdown,message, warn } from 'danger';

const pr = danger.github.pr;
const modified = danger.git.modified_files;
const created = danger.git.created_files;
const allFiles = [...modified, ...created];

// ========================================
// PR Size Check
// ========================================
const bigPRThreshold = 500;
const changedLines = pr.additions + pr.deletions;

if (changedLines > bigPRThreshold) {
  warn(
    `🚨 This PR is quite large (${changedLines} lines changed). Consider splitting it into smaller PRs for easier review.`
  );
}

// ========================================
// Test Coverage Check
// ========================================
const hasSourceChanges = allFiles.some(
  (f) =>
    (f.includes('/src/') || f.includes('/lib/')) &&
    !f.includes('.spec.ts') &&
    !f.includes('.test.ts') &&
    !f.endsWith('.md')
);

const hasTestChanges = allFiles.some((f) => f.includes('.spec.ts') || f.includes('.test.ts'));

if (hasSourceChanges && !hasTestChanges) {
  warn(
    `⚠️ This PR modifies source code but doesn't include test changes. Please add tests to maintain code coverage!`
  );
}

// ========================================
// CHANGELOG Check
// ========================================
const hasChangelog = modified.includes('CHANGELOG.md') || created.includes('CHANGELOG.md');
const prTitle = pr.title.toLowerCase();
const isFeature = prTitle.includes('feat');
const isFix = prTitle.includes('fix');
const isBreaking = prTitle.includes('!') || pr.body?.toLowerCase().includes('breaking change');

if ((isFeature || isFix || isBreaking) && !hasChangelog) {
  warn(
    `📝 This PR adds a feature or fix but doesn't update CHANGELOG.md. Please document user-facing changes!`
  );
}

// ========================================
// ADR Check (for architectural changes)
// ========================================
const architectureFiles = allFiles.filter(
  (f) =>
    f.includes('.module.ts') ||
    f.includes('.service.ts') ||
    f.includes('.guard.ts') ||
    f.includes('.interceptor.ts') ||
    f.includes('.resolver.ts')
);

const hasADR = created.some((f) => f.includes('docs/ADRs/ADR-'));

if (architectureFiles.length > 0 && !hasADR && isFeature) {
  message(
    `💭 This PR introduces new architectural components (services, guards, etc.). Consider adding an ADR (Architecture Decision Record) if this introduces new patterns.`
  );
}

// ========================================
// Documentation Check
// ========================================
const hasDocChanges = allFiles.some((f) => f.includes('docs/') && f.endsWith('.md'));
const hasReadmeChanges = modified.includes('README.md') || created.includes('README.md');

if (hasSourceChanges && !hasDocChanges && !hasReadmeChanges && isFeature) {
  message(
    `📚 Consider updating documentation for this feature in the \`docs/\` directory or README.md`
  );
}

// ========================================
// Lockfile Check
// ========================================
const hasPackageJson = modified.includes('package.json');
const hasLockfile = modified.includes('package-lock.json');

if (hasPackageJson && !hasLockfile) {
  warn(
    `🔒 package.json was modified but package-lock.json was not updated. Run \`npm install\` to update the lockfile.`
  );
}

// ========================================
// Config File Changes
// ========================================
const configFiles = allFiles.filter(
  (f) =>
    f.endsWith('.json') ||
    f.endsWith('.config.js') ||
    f.endsWith('.config.ts') ||
    f.endsWith('.config.mjs') ||
    f.includes('tsconfig') ||
    f.includes('eslint') ||
    f.includes('prettier')
);

if (configFiles.length > 0) {
  message(
    `⚙️ This PR modifies configuration files: ${configFiles.map((f) => `\`${f}\``).join(', ')}. Please ensure all team members are aware of these changes.`
  );
}

// ========================================
// Dependency Changes
// ========================================
if (hasPackageJson) {
  message(
    `📦 Dependencies were modified. Please ensure:
- Security audit passes (\`npm audit\`)
- No circular dependencies (\`npm run deps:check\`)
- New dependencies are justified in the PR description`
  );
}

// ========================================
// Migration or Schema Changes
// ========================================
const hasPrismaSchema = modified.some((f) => f.includes('prisma/schema.prisma'));
const hasMigration = created.some((f) => f.includes('prisma/migrations/'));

if (hasPrismaSchema && !hasMigration) {
  warn(
    `🗄️ Prisma schema was modified but no migration was created. Run \`npx prisma migrate dev\` to create a migration.`
  );
}

// ========================================
// Accessibility Changes (UI)
// ========================================
const hasUIChanges = allFiles.some(
  (f) =>
    (f.endsWith('.component.ts') ||
      f.endsWith('.component.html') ||
      f.endsWith('.tsx') ||
      f.endsWith('.jsx')) &&
    f.includes('frontend')
);

if (hasUIChanges) {
  markdown(
    `### ♿ Accessibility Checklist

This PR includes UI changes. Please verify:

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader compatible (ARIA labels)
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG 2.1 Level AA (4.5:1)
- [ ] No reliance on color alone to convey information`
  );
}

// ========================================
// ADHD/Dyslexia Design Principles (UI)
// ========================================
if (hasUIChanges) {
  markdown(
    `### 🧠 ADHD/Dyslexia Design Check

Please verify these design principles:

- [ ] Visual hierarchy is clear and uncluttered
- [ ] Maximum 3 levels of nested information
- [ ] Important actions are visually prominent
- [ ] Labels are clear and descriptive (not abbreviated)
- [ ] Appropriate use of whitespace`
  );
}

// ========================================
// PR Description Check
// ========================================
if (!pr.body || pr.body.length < 50) {
  warn(
    `📝 This PR has a very short or missing description. Please provide context about what this PR does and why.`
  );
}

// Check for Linear task reference
const hasLinearTask = pr.body?.match(/TASK-\d+/) || pr.title.match(/TASK-\d+/);

if (!hasLinearTask) {
  warn(
    `🎫 This PR doesn't reference a Linear task (TASK-xxx). Please link to the relevant task for traceability.`
  );
}

// ========================================
// File-Specific Checks
// ========================================

// Check for TODOs in new code (should create tasks instead)
const addedLines = danger.git.commits
  .map((c) => c.message)
  .join('\n')
  .toLowerCase();

if (addedLines.includes('todo') || addedLines.includes('fixme')) {
  warn(
    `⚠️ Found TODO or FIXME in commit messages. Consider creating Linear tasks (TASK-xxx) instead of leaving TODOs.`
  );
}

// ========================================
// Success Message
// ========================================
message('✅ Thanks for your contribution! The automated checks above help maintain code quality.');
