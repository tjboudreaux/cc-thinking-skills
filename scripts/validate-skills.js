#!/usr/bin/env node
'use strict';

/**
 * Thinking Skills structural validator (side-effect free).
 *
 * Enforces:
 * - frontmatter description < 200 chars
 * - required sections: When to Use, When NOT to Use, Procedure, Output, Verification
 * - catalog count from registry
 * - per-skill word budget from registry (survivors)
 *
 * Does NOT write quality-report.json or any tracked report.
 * Run: node scripts/validate-skills.js
 */

const fs = require('fs');
const path = require('path');
const { isDeepStrictEqual } = require('util');

const REPO_ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

let loadRegistry;
let validateRegistry;
let getSkillBudget;
try {
  ({ loadRegistry, validateRegistry, getSkillBudget } = require(path.join(REPO_ROOT, 'evals', 'lib', 'registry')));
} catch (_) {
  loadRegistry = null;
}

const DEFAULT_REQUIRED_SECTIONS = [
  'When to Use',
  'When NOT to Use',
  'Procedure',
  'Output',
  'Verification',
];

const DEFAULT_DESCRIPTION_MAX = 200;

function listSkillDirs(skillsDir = SKILLS_DIR) {
  if (!fs.existsSync(skillsDir)) return [];
  return fs.readdirSync(skillsDir)
    .filter(d => d.startsWith('thinking-'))
    .filter(d => fs.existsSync(path.join(skillsDir, d, 'SKILL.md')))
    .sort();
}

function listUnexpectedSkillFiles(repoRoot = REPO_ROOT) {
  const skippedDirectories = new Set([
    '.git',
    '.claude',
    'backups',
    'evals/checkouts',
    'node_modules',
  ]);
  const unexpected = [];

  function visit(directory, relativeDirectory = '') {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const relativePath = relativeDirectory
        ? `${relativeDirectory}/${entry.name}`
        : entry.name;
      if (entry.isDirectory()) {
        if (!skippedDirectories.has(relativePath)) {
          visit(path.join(directory, entry.name), relativePath);
        }
        continue;
      }
      if (!entry.isFile() || entry.name !== 'SKILL.md') continue;
      if (!/^skills\/thinking-[^/]+\/SKILL\.md$/.test(relativePath)) {
        unexpected.push(relativePath);
      }
    }
  }

  visit(repoRoot);
  return unexpected.sort();
}

function validatePluginManifests(repoRoot = REPO_ROOT) {
  const manifestPaths = [
    '.claude-plugin/plugin.json',
    '.github/plugin/plugin.json',
  ];
  const fields = [
    'name',
    'description',
    'version',
    'author',
    'homepage',
    'repository',
    'license',
    'keywords',
    'skills',
  ];
  const errors = [];
  const manifests = [];

  for (const relativePath of manifestPaths) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      errors.push(`manifest missing: ${relativePath}`);
      continue;
    }
    try {
      const manifest = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
      manifests.push({ relativePath, manifest });
      if (!isDeepStrictEqual(manifest.skills, ['skills/'])) {
        errors.push(`manifest skills must equal ["skills/"]: ${relativePath}`);
      }
    } catch (error) {
      errors.push(`manifest invalid JSON: ${relativePath}: ${error.message}`);
    }
  }

  if (manifests.length === manifestPaths.length) {
    const [first, second] = manifests;
    for (const field of fields) {
      if (!isDeepStrictEqual(first.manifest[field], second.manifest[field])) {
        errors.push(`manifest field mismatch: ${field}`);
      }
    }
  }

  return errors;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const frontmatter = {};
  const errors = [];
  if (!match) {
    return { frontmatter, body: content, has_frontmatter: false, errors };
  }

  const lines = match[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 2;
    if (/^\s*(?:#.*)?$/.test(line)) continue;

    const keyValue = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!keyValue || keyValue[2].trim().length === 0) {
      errors.push(`frontmatter line ${lineNumber}: expected key: scalar`);
      continue;
    }

    const key = keyValue[1];
    if (Object.prototype.hasOwnProperty.call(frontmatter, key)) {
      errors.push(`frontmatter line ${lineNumber}: duplicate key "${key}"`);
      continue;
    }

    const scalar = keyValue[2].trim();
    let value;
    if (scalar.startsWith("'")) {
      if (!scalar.endsWith("'") || scalar.length < 2) {
        errors.push(`frontmatter line ${lineNumber}: unclosed single-quoted scalar`);
        continue;
      }
      const inner = scalar.slice(1, -1);
      if (/(^|[^'])'(?:[^']|$)/.test(inner)) {
        errors.push(`frontmatter line ${lineNumber}: unclosed single-quoted scalar`);
        continue;
      }
      value = inner.replace(/''/g, "'");
    } else if (scalar.startsWith('"')) {
      try {
        value = JSON.parse(scalar);
        if (typeof value !== 'string') throw new TypeError('not a string');
      } catch (_) {
        errors.push(`frontmatter line ${lineNumber}: invalid double-quoted scalar`);
        continue;
      }
    } else {
      const ambiguousToken = [': ', ' #'].find(token => scalar.includes(token));
      if (ambiguousToken) {
        errors.push(`frontmatter line ${lineNumber}: ambiguous bare scalar contains "${ambiguousToken}"`);
        continue;
      }
      value = scalar;
    }

    if (value.length === 0) {
      errors.push(`frontmatter line ${lineNumber}: expected key: scalar`);
      continue;
    }
    frontmatter[key] = value;
  }

  const body = content.slice(match[0].length);
  return { frontmatter, body, has_frontmatter: true, errors };
}

function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function sectionHeadingPattern(name) {
  // Match ## When to Use / ## When NOT to Use etc.
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^##\\s+${escaped}\\s*$`, 'mi');
}

function hasSection(content, name) {
  return sectionHeadingPattern(name).test(content);
}

function sectionBody(content, name) {
  const match = sectionHeadingPattern(name).exec(content);
  if (!match) return '';
  const start = match.index + match[0].length;
  const remainder = content.slice(start);
  const next = remainder.search(/^##\s+/m);
  return (next === -1 ? remainder : remainder.slice(0, next)).trim();
}

function numberedStepCount(content) {
  return sectionBody(content, 'Procedure')
    .split('\n')
    .filter(line => /^\s*\d+\.\s+\S/.test(line))
    .length;
}

/**
 * Pure validation of a single skill body.
 * @returns {object} structured result with pass/fail details
 */
function validateSkillContent(content, opts = {}) {
  const skillName = opts.name || 'unknown';
  const requiredSections = opts.requiredSections || DEFAULT_REQUIRED_SECTIONS;
  const descriptionMax = opts.descriptionMax ?? DEFAULT_DESCRIPTION_MAX;
  const maxWords = opts.maxWords != null ? opts.maxWords : null;
  const enforceBudget = opts.enforceBudget !== false && maxWords != null;
  const requireDisableModelInvocation = opts.requireDisableModelInvocation === true;
  const forbiddenSkillIds = opts.forbiddenSkillIds || [];

  const { frontmatter, has_frontmatter, errors: frontmatterErrors } = parseFrontmatter(content);
  const words = countWords(content);
  const description = frontmatter.description || '';
  const descriptionLen = description.length;
  const procedureSteps = numberedStepCount(content);
  const nonEmptySections = requiredSections.filter(name => sectionBody(content, name).length > 0);
  const forbiddenRefs = forbiddenSkillIds.filter(id => content.includes(`thinking-${id}`));

  const sections = requiredSections.map(name => ({
    name,
    found: hasSection(content, name),
  }));

  const checks = [];
  checks.push({
    name: 'YAML Frontmatter',
    pass: has_frontmatter &&
      frontmatterErrors.length === 0 &&
      frontmatter.name === skillName &&
      Boolean(frontmatter.description),
    detail: frontmatterErrors.length > 0
      ? frontmatterErrors.join('; ')
      : has_frontmatter
        ? `name=${frontmatter.name || 'missing'}`
        : 'missing frontmatter',
  });
  checks.push({
    name: 'Description Length',
    pass: descriptionLen > 0 && descriptionLen <= descriptionMax,
    detail: descriptionLen
      ? `${descriptionLen} chars (max ${descriptionMax})`
      : 'No description found',
  });

  for (const section of sections) {
    checks.push({
      name: `Section: ${section.name}`,
      pass: section.found,
      detail: section.found ? 'found' : 'missing',
    });
  }
  checks.push({
    name: 'Required Section Content',
    pass: nonEmptySections.length === requiredSections.length,
    detail: nonEmptySections.length === requiredSections.length
      ? 'all required sections are non-empty'
      : `empty: ${requiredSections.filter(name => !nonEmptySections.includes(name)).join(', ')}`,
  });
  checks.push({
    name: 'Procedure Steps',
    pass: procedureSteps >= 3 && procedureSteps <= 7,
    detail: `${procedureSteps} numbered steps (required 3-7)`,
  });
  if (requireDisableModelInvocation) {
    checks.push({
      name: 'Manual-only Quarantine',
      pass: frontmatter['disable-model-invocation'] === 'true',
      detail: `disable-model-invocation=${frontmatter['disable-model-invocation'] || 'missing'}`,
    });
  }
  checks.push({
    name: 'Deleted Skill References',
    pass: forbiddenRefs.length === 0,
    detail: forbiddenRefs.length === 0
      ? 'none'
      : forbiddenRefs.map(id => `thinking-${id}`).join(', '),
  });

  if (enforceBudget) {
    checks.push({
      name: 'Word Budget',
      pass: words <= maxWords,
      detail: `${words} words (max ${maxWords})`,
    });
  } else if (maxWords != null) {
    checks.push({
      name: 'Word Budget',
      pass: true,
      detail: `${words} words (budget ${maxWords}; not enforced for non-survivors)`,
    });
  }

  const failed = checks.filter(c => !c.pass);
  const score = checks.filter(c => c.pass).length;
  const maxScore = checks.length;

  return {
    name: skillName,
    description,
    description_length: descriptionLen,
    words,
    max_words: maxWords,
    procedure_steps: procedureSteps,
    forbidden_skill_refs: forbiddenRefs,
    sections,
    checks,
    failed,
    score,
    maxScore,
    pass: failed.length === 0,
    frontmatter,
  };
}

function validateSkillFile(skillPath, opts = {}) {
  const content = fs.readFileSync(skillPath, 'utf8');
  const skillName = opts.name || path.basename(path.dirname(skillPath));
  return {
    ...validateSkillContent(content, { ...opts, name: skillName }),
    path: skillPath,
  };
}

function loadCatalogExpectations(registryPath) {
  if (!loadRegistry) {
    return {
      expectedCount: null,
      requiredSections: DEFAULT_REQUIRED_SECTIONS,
      descriptionMax: DEFAULT_DESCRIPTION_MAX,
      budgets: {},
      registry: null,
      registryValidation: null,
    };
  }
  const { registry } = loadRegistry(registryPath);
  const registryValidation = validateRegistry(registry);
  const budgets = {};
  for (const [id, skill] of Object.entries(registry.skills || {})) {
    const b = getSkillBudget(registry, id);
    if (b != null) budgets[id] = b;
  }
  return {
    expectedCount: registry.catalog?.expected_count ?? registry.catalog?.baseline_count ?? null,
    requiredSections: registry.required_skill_sections || DEFAULT_REQUIRED_SECTIONS,
    descriptionMax: registry.frontmatter?.description_max_chars ?? DEFAULT_DESCRIPTION_MAX,
    budgets,
    survivors: new Set(registry.catalog?.survivors || []),
    quarantined: new Set(Object.entries(registry.skills || {})
      .filter(([, skill]) => skill.disposition?.disable_model_invocation_until_elevated === true)
      .map(([id]) => id)),
    deletions: new Set(registry.catalog?.deletions || []),
    registry,
    registryValidation,
  };
}

/**
 * Validate all skills under skillsDir. Pure: no file writes.
 */
function validateAllSkills(opts = {}) {
  const repoRoot = opts.repoRoot || REPO_ROOT;
  const skillsDir = opts.skillsDir || path.join(repoRoot, 'skills');
  const catalog = loadCatalogExpectations(opts.registryPath);
  const dirs = listSkillDirs(skillsDir);
  const results = [];

  for (const dir of dirs) {
    const id = dir.replace(/^thinking-/, '');
    const maxWords = catalog.budgets[id] != null ? catalog.budgets[id] : null;
    // Enforce budget only for declared survivors (Phase 3 lean contracts).
    // Baseline pre-rewrite bodies will fail budgets/sections — that is intentional observability.
    const enforceBudget = catalog.survivors ? catalog.survivors.has(id) : maxWords != null;
    const skillPath = path.join(skillsDir, dir, 'SKILL.md');
    results.push(validateSkillFile(skillPath, {
      name: dir,
      requiredSections: catalog.requiredSections,
      descriptionMax: catalog.descriptionMax,
      maxWords,
      enforceBudget,
      requireDisableModelInvocation: catalog.quarantined?.has(id) || false,
      forbiddenSkillIds: [...(catalog.deletions || [])],
    }));
  }

  const errors = [];
  if (catalog.expectedCount != null && results.length !== catalog.expectedCount) {
    errors.push(`catalog count ${results.length} != expected ${catalog.expectedCount}`);
  }
  if (catalog.registryValidation && !catalog.registryValidation.ok) {
    for (const e of catalog.registryValidation.errors) errors.push(`registry: ${e}`);
  }
  for (const skillPath of listUnexpectedSkillFiles(repoRoot)) {
    errors.push(`unexpected SKILL.md: ${skillPath}`);
  }
  errors.push(...validatePluginManifests(repoRoot));

  const failedSkills = results.filter(r => !r.pass);
  return {
    ok: errors.length === 0 && failedSkills.length === 0,
    catalog_errors: errors,
    expected_count: catalog.expectedCount,
    found_count: results.length,
    required_sections: catalog.requiredSections,
    results,
    failed: failedSkills,
    summary: {
      total: results.length,
      passed: results.filter(r => r.pass).length,
      failed: failedSkills.length,
    },
    registry_validation: catalog.registryValidation,
  };
}

function printResults(report) {
  const GREEN = '\x1b[32m';
  const RED = '\x1b[31m';
  const YELLOW = '\x1b[33m';
  const RESET = '\x1b[0m';
  const BOLD = '\x1b[1m';

  console.log(`\n${BOLD}=== Thinking Skills Structural Validation ===${RESET}\n`);
  if (report.expected_count != null) {
    console.log(`Catalog: found ${report.found_count}, expected ${report.expected_count}`);
  } else {
    console.log(`Catalog: found ${report.found_count}`);
  }
  for (const e of report.catalog_errors || []) console.log(`${RED}CATALOG: ${e}${RESET}`);

  for (const skill of report.results) {
    const color = skill.pass ? GREEN : RED;
    console.log(`${BOLD}${skill.name}${RESET}: ${color}${skill.score}/${skill.maxScore}${RESET} words=${skill.words}${skill.max_words != null ? `/${skill.max_words}` : ''}`);
    for (const c of skill.failed) {
      console.log(`  ${YELLOW}- ${c.name}: ${c.detail}${RESET}`);
    }
  }

  console.log(`\n${BOLD}=== Summary ===${RESET}`);
  console.log(`Passed: ${report.summary.passed}/${report.summary.total}`);
  console.log(`Failed: ${report.summary.failed}`);
  // Explicit: no tracked report write
  console.log('(side-effect free: no quality-report.json written)');
}

function main() {
  const report = validateAllSkills();
  // Sort failures first for visibility
  report.results.sort((a, b) => Number(a.pass) - Number(b.pass) || a.name.localeCompare(b.name));
  printResults(report);
  if (!report.ok) process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = {
  DEFAULT_REQUIRED_SECTIONS,
  DEFAULT_DESCRIPTION_MAX,
  listSkillDirs,
  listUnexpectedSkillFiles,
  validatePluginManifests,
  parseFrontmatter,
  countWords,
  hasSection,
  sectionBody,
  numberedStepCount,
  validateSkillContent,
  validateSkillFile,
  validateAllSkills,
  loadCatalogExpectations,
  printResults,
  main,
  SKILLS_DIR,
  REPO_ROOT,
};
