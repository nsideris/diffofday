import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono, Public_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const display = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-display-face' });
const body = Public_Sans({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-body-face' });
const mono = JetBrains_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-mono-face' });

export const metadata: Metadata = {
  metadataBase: new URL('https://diffofday.com'),
  title: 'Diff of the Day',
  description: 'What changed in AI today, for engineers who build with it: top stories, must-reads, trends and the best posts, repos and blogs.',
  openGraph: { title: 'Diff of the Day', description: 'What changed in AI today, for engineers who build with it.' },
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
