import { editionOn, latestEdition } from './editions';
import type { Edition, Idea } from './types';

export async function findIdea(date: string | undefined, n: number): Promise<{ edition: Edition; idea: Idea } | null> {
  const edition = !date || date === 'latest' ? await latestEdition() : await editionOn(date);
  const idea = edition?.ideas?.[n - 1];
  return edition && idea ? { edition, idea } : null;
}

export function fencedSpec(spec: string) {
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const body = spec.replace(/<{3,}|>{3,}/g, '');
  return { marker: `SPEC-${id}`, text: `<<<SPEC-${id}\n${body}\nSPEC-${id}>>>` };
}

export function specUrl(date: string, n: number) {
  return `https://diffofday.com/ideas/${date}/${n}/spec.md`;
}

export function specText(edition: Edition, idea: Idea, n: number) {
  return idea.spec ?? `# Spec: ${idea.title}\n\n${idea.why}\n\n## Steps\n${idea.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`;
}
