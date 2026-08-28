'use strict';

/** Helpers for loading the thinking skills and their frontmatter. */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'plugin', 'skills');

function listSkillDirs() {
  return fs.readdirSync(SKILLS_DIR)
    .filter(d => d.startsWith('thinking-'))
    .filter(d => fs.existsSync(path.join(SKILLS_DIR, d, 'SKILL.md')))
    .sort();
}

function skillPath(name) {
  return path.join(SKILLS_DIR, name, 'SKILL.md');
}

function readSkill(name) {
  const content = fs.readFileSync(skillPath(name), 'utf8');
  return { name, content, ...parseFrontmatter(content) };
}

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
      if (kv) fm[kv[1]] = kv[2].trim();
    }
  }
  return { description: fm.description || '', frontmatter: fm };
}

function loadAllSkills() {
  return listSkillDirs().map(readSkill);
}

/** All skills minus the meta routers/selectors (leaf models only). */
function leafSkills() {
  const meta = new Set(['thinking-model-router', 'thinking-model-combination']);
  return loadAllSkills().filter(s => !meta.has(s.name));
}

module.exports = { REPO_ROOT, SKILLS_DIR, listSkillDirs, skillPath, readSkill, loadAllSkills, leafSkills, parseFrontmatter };
