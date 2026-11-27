import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const SECRET_PATTERNS = [
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /xox[abprs]-[A-Za-z0-9-]{10,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /Account[K]ey=/,
  /Shared[A]ccessSignature|[?&]sig=[A-Za-z0-9%]{20,}/,
  /(password|passwd|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"]{6,}/i,
  /postgres(ql)?:\/\/[^\s"']+:[^\s"']+@/,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./,
];
const CHANNEL = /(?<![\w&/;])#(?!x[0-9a-f]+;)[a-z][a-z0-9_-]{2,}/;

function privatePatterns(): RegExp[] {
  const fromEnv = process.env.DIFFOFDAY_GUARD_PATTERNS;
  const file = process.env.DIFFOFDAY_GUARD ?? join(homedir(), '.config', 'diffofday', 'guard-patterns.txt');
  const source = fromEnv ?? (existsSync(file) ? readFileSync(file, 'utf8') : null);
  if (source === null) throw new Error(`guard: pattern file ${file} is missing; refusing to continue`);
  const rules = source.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => (l.startsWith('cs:') ? new RegExp(l.slice(3)) : new RegExp(l, 'i')));
  if (!rules.length) throw new Error('guard: no private patterns loaded; refusing to continue');
  return rules;
}

export function decodedStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(decodedStrings);
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => [k, ...decodedStrings(v)]);
  return [];
}

export function findProblems(text: string, checkChannels = true): string[] {
  const rules = [...privatePatterns(), ...SECRET_PATTERNS, ...(checkChannels ? [CHANNEL] : [])];
  const problems: string[] = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const hits = rules.filter((r) => r.test(line)).length;
    if (hits) problems.push(`line ${i + 1}: matches ${hits} rule(s)`);
  });
  return problems;
}

if (import.meta.main) {
  const files = process.argv.slice(2);
  if (!files.length) throw new Error('usage: npm run guard -- <file> [...]');
  let blocked = false;
  for (const file of files) {
    const problems = findProblems(readFileSync(file, 'utf8'), /\.(json|xml)$/.test(file));
    if (problems.length) {
      blocked = true;
      console.log(`guard: ${file} blocked\n  ${problems.join('\n  ')}`);
    }
  }
  if (blocked) process.exit(1);
  console.log(`guard: ok (${files.length} file(s))`);
}
