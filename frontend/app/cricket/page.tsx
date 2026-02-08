import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { CricketFeed } from './CricketFeed';

export const metadata: Metadata = {
  title: 'Live Cricket Scores — T20 World Cup, IPL, Test Matches | MatchDay',
  description:
    'Real-time cricket scores with AI-powered match summaries. T20 World Cup 2026, IPL, Test matches, ODI — ball-by-ball updates.',
  keywords: [
    'live cricket score',
    'T20 World Cup 2026 live score',
    'IPL live score 2026',
    'India cricket score today',
    'cricket score today',
  ],
};

export default function CricketPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-3xl mx-auto pb-20">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-extrabold">Live Cricket Scores</h1>
          <p className="text-sm text-gray-500 mt-1">
            T20 World Cup — IPL — International — updated every 30 seconds
          </p>
        </div>
        <CricketFeed />
      </div>
    </main>
  );
}
