import { Analytics } from '@vercel/analytics/next';
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
  openGraph: {
    type: 'website',
    siteName: 'Diff of the Day',
    url: 'https://diffofday.com/',
    title: 'Diff of the Day',
    description: 'What changed in AI today, for engineers who build with it.',
  },
  twitter: { card: 'summary_large_image' },
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/feed.xml', 'text/markdown': '/', 'text/plain': '/llms.txt' },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
