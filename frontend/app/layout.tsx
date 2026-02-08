import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'MatchDay — Live Cricket & Football Scores',
  description:
    'Real-time cricket and football scores on one screen. T20 World Cup, IPL, Premier League, La Liga — AI-powered match highlights.',
  keywords: [
    'live cricket score',
    'live football score',
    'T20 World Cup 2026 live',
    'IPL live score',
    'Premier League live score',
    'cricket football scores',
  ],
  openGraph: {
    title: 'MatchDay — Live Cricket & Football Scores',
    description: 'One screen. Two sports. AI-powered highlights.',
    url: 'https://matchday.live',
    siteName: 'MatchDay',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MatchDay — Live Cricket & Football Scores',
    description: 'One screen. Two sports. AI-powered highlights.',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <head>
        <meta name="theme-color" content="#0F1117" />
      </head>
      <body>{children}</body>
    </html>
  );
}
