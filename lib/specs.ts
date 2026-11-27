import { editionOn, latestEdition, recentEditions } from './editions';
import type { Edition, Idea, Play } from './types';

export type SpecKind = 'idea' | 'playbook';

async function editionFor(date: string | undefined) {
  return !date || date === 'latest' ? latestEdition() : editionOn(date);
}

export async function findIdea(date: string | undefined, n: number): Promise<{ edition: Edition; idea: Idea } | null> {
  const edition = await editionFor(date);
  const idea = edition?.ideas?.[n - 1];
  return edition && idea ? { edition, idea } : null;
}

export async function findSpec(kind: SpecKind, date: string | undefined, n: number) {
  const edition = await editionFor(date);
  if (!edition) return null;
  if (kind === 'playbook') {
    const play = edition.bigco?.[n - 1];
    return play ? { edition, title: play.title, spec: playSpecText(play) } : null;
  }
  const idea = edition.ideas?.[n - 1];
  return idea ? { edition, title: idea.title, spec: specText(edition, idea, n) } : null;
}

export async function recentPlays(days: number): Promise<(Play & { edition: string; n: number })[]> {
  const editions = await recentEditions(days);
  return editions.flatMap((e) => (e.bigco ?? []).map((p, i) => ({ ...p, edition: e.edition, n: i + 1 })));
}

export function fencedSpec(spec: string) {
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const body = spec.replace(/<{3,}|>{3,}/g, '');
  return { marker: `SPEC-${id}`, text: `<<<SPEC-${id}\n${body}\nSPEC-${id}>>>` };
}

export function specUrl(date: string, n: number, kind: SpecKind = 'idea') {
  return `https://diffofday.com/${kind === 'playbook' ? 'playbook' : 'ideas'}/${date}/${n}/spec.md`;
}

export function specText(_edition: Edition, idea: Idea, _n: number) {
  return idea.spec ?? `# Spec: ${idea.title}\n\n${idea.why}\n\n## Steps\n${idea.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`;
}

export function playSpecText(play: Play) {
  return play.spec ?? `# Spec: ${play.title} (small-team version)\n\n${play.small}\n\n## Steps\n${play.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`;
}
