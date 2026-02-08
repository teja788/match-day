import { Header } from '@/components/Header';
import { ScoreFeed } from '@/components/ScoreFeed';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-3xl mx-auto pb-20">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-extrabold">Live Scores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cricket & Football — AI-powered highlights
          </p>
        </div>
        <ScoreFeed />
      </div>
    </main>
  );
}
