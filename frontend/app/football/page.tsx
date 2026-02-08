import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { FootballFeed } from './FootballFeed';
import { getScores } from '@/lib/scoreAggregator';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Live Football Scores — Premier League, La Liga, Champions League | MatchDay',
  description:
    'Real-time football scores with AI-powered match summaries. Premier League, La Liga, Champions League, Serie A — live goal updates.',
  keywords: [
    'live football score',
    'Premier League live score',
    'La Liga live score',
    'Champions League live score',
    'football score today',
  ],
};

export default async function FootballPage() {
  let initialData = null;
  try {
    initialData = await getScores('football');
  } catch {
    // Will fall back to client-only fetch
  }

  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-3xl mx-auto pb-20">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-extrabold">Live Football Scores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Premier League — La Liga — Champions League — updated every 30 seconds
          </p>
        </div>
        <FootballFeed initialData={initialData} />
      </div>
    </main>
  );
}
