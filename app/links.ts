export const ext = { target: '_blank', rel: 'noopener' } as const;

export function safeUrl(u: string | undefined) {
  return /^https?:\/\//i.test(u ?? '') ? (u as string) : '#';
}
