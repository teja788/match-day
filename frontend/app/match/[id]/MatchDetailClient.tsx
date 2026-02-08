'use client';

import useSWR from 'swr';
import { fetchMatch } from '@/lib/api';
import { Header } from '@/components/Header';
import { LiveIndicator } from '@/components/LiveIndicator';

interface Team {
  name: string;
  shortName: string;
  logo: string;
  score: string;
}

interface MatchData {
  id: string;
  sport: 'cricket' | 'football';
  status: 'upcoming' | 'live' | 'completed';
  tournament: string;
  teamA: Team;
  teamB: Team;
  headline: string;
  headlineHi: string;
  startTime: string;
  venue: string;
  extras: Record<string, string | number | null>;
}

export function MatchDetailClient({
  matchId,
  initialData,
}: {
  matchId: string;
  initialData: MatchData | null;
}) {
  const { data: match } = useSWR<MatchData>(
    ['match', matchId],
    () => fetchMatch(matchId),
    {
      fallbackData: initialData ?? undefined,
      refreshInterval: 15_000,
      revalidateOnFocus: true,
    }
  );

  if (!match) return <div className="min-h-screen bg-surface" />;

  const isLive = match.status === 'live';

  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Match header */}
        <div className="text-center mb-8">
          <p className="text-xs text-gray-400 font-semibold mb-2">
            {match.tournament}
          </p>
          {isLive && (
            <div className="flex justify-center mb-3">
              <LiveIndicator />
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="bg-surface-card rounded-2xl p-6 border border-surface-border mb-6">
          <div className="flex items-center justify-between">
            {/* Team A */}
            <div className="text-center flex-1">
              {match.teamA.logo && (
                <img
                  src={match.teamA.logo}
                  alt=""
                  className="w-12 h-12 rounded-full mx-auto mb-2"
                />
              )}
              <p className="font-bold text-lg">
                {match.teamA.shortName || match.teamA.name}
              </p>
              <p className="text-2xl font-extrabold font-mono mt-1">
                {match.teamA.score}
              </p>
            </div>

            <span className="text-gray-600 text-xl font-bold px-4">vs</span>

            {/* Team B */}
            <div className="text-center flex-1">
              {match.teamB.logo && (
                <img
                  src={match.teamB.logo}
                  alt=""
                  className="w-12 h-12 rounded-full mx-auto mb-2"
                />
              )}
              <p className="font-bold text-lg">
                {match.teamB.shortName || match.teamB.name}
              </p>
              <p className="text-2xl font-extrabold font-mono mt-1">
                {match.teamB.score}
              </p>
            </div>
          </div>
        </div>

        {/* AI Headline */}
        {match.headline && (
          <div className="bg-headline/10 rounded-xl px-4 py-3 mb-6 text-center">
            <p className="text-headline font-semibold">{match.headline}</p>
            {match.headlineHi && (
              <p className="text-headline/70 text-sm mt-1">
                {match.headlineHi}
              </p>
            )}
          </div>
        )}

        {/* Match info */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          {match.venue && <p>{match.venue}</p>}
          <p>
            {new Date(match.startTime).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Cricket-specific extras */}
        {match.sport === 'cricket' && match.extras && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {match.extras.runRate && (
              <StatBox label="Run Rate" value={String(match.extras.runRate)} />
            )}
            {match.extras.overs && (
              <StatBox label="Overs" value={String(match.extras.overs)} />
            )}
            {match.extras.partnership && (
              <StatBox
                label="Partnership"
                value={String(match.extras.partnership)}
              />
            )}
          </div>
        )}

        {/* Football-specific extras */}
        {match.sport === 'football' && match.extras && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {match.extras.possession && (
              <StatBox
                label="Possession"
                value={`${match.extras.possession}%`}
              />
            )}
            {match.extras.minute && (
              <StatBox label="Minute" value={`${match.extras.minute}'`} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-card rounded-lg p-3 text-center border border-surface-border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold font-mono mt-1">{value}</p>
    </div>
  );
}
