'use client';

import { useState, useEffect } from 'react';
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
  extras: Record<string, unknown>;
  summary?: string;
  summaryHi?: string;
  winProbability?: {
    teamA: number;
    teamB: number;
    draw?: number;
    confidence: 'low' | 'medium' | 'high';
    reasoning: string;
  };
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

  // Catch-up feature: track last visit and show what happened
  const [catchUp, setCatchUp] = useState<{ en: string; hi: string } | null>(null);
  const [catchUpDismissed, setCatchUpDismissed] = useState(false);

  useEffect(() => {
    const key = `matchday_lastvisit_${matchId}`;
    const lastVisit = localStorage.getItem(key);

    if (lastVisit && match?.status === 'live') {
      fetch(`/api/catchup/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastVisit }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.catchup) setCatchUp(data.catchup);
        })
        .catch(() => {});
    }

    localStorage.setItem(key, new Date().toISOString());
  }, [matchId, match?.status]);

  if (!match) return <div className="min-h-screen bg-surface" />;

  const isLive = match.status === 'live';

  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Catch-up card */}
        {catchUp && !catchUpDismissed && (
          <div className="bg-football/10 border border-football/20 rounded-xl px-4 py-3 mb-6 relative">
            <button
              onClick={() => setCatchUpDismissed(true)}
              className="absolute top-2 right-2 text-gray-500 hover:text-white text-xs"
            >
              X
            </button>
            <p className="text-xs text-football font-semibold mb-1">While you were away...</p>
            <p className="text-sm text-gray-300">{catchUp.en}</p>
            {catchUp.hi && (
              <p className="text-xs text-gray-500 mt-1">{catchUp.hi}</p>
            )}
          </div>
        )}

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

        {/* Win Probability */}
        {isLive && match.winProbability && (
          <div className="bg-surface-card rounded-xl p-4 border border-surface-border mb-6">
            <p className="text-xs text-gray-400 font-semibold mb-3 text-center">Win Probability</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold w-10 text-right">
                {match.teamA.shortName}
              </span>
              <div className="flex-1 h-3 rounded-full overflow-hidden bg-surface-border flex">
                <div
                  className="h-full bg-cricket transition-all duration-500"
                  style={{ width: `${match.winProbability.teamA}%` }}
                />
                {match.winProbability.draw != null && (
                  <div
                    className="h-full bg-gray-500 transition-all duration-500"
                    style={{ width: `${match.winProbability.draw}%` }}
                  />
                )}
                <div
                  className="h-full bg-football transition-all duration-500"
                  style={{ width: `${match.winProbability.teamB}%` }}
                />
              </div>
              <span className="text-xs font-bold w-10">
                {match.teamB.shortName}
              </span>
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-500">
              <span>{match.winProbability.teamA}%</span>
              {match.winProbability.draw != null && (
                <span>Draw {match.winProbability.draw}%</span>
              )}
              <span>{match.winProbability.teamB}%</span>
            </div>
            <p className="text-[10px] text-gray-600 text-center mt-2">
              {match.winProbability.reasoning}
            </p>
          </div>
        )}

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

        {/* Match Summary */}
        {match.summary && (
          <div className="bg-surface-card rounded-xl px-4 py-3 border border-surface-border mb-6">
            <p className="text-xs text-gray-400 font-semibold mb-2">Match Summary</p>
            <p className="text-sm text-gray-300 leading-relaxed">{match.summary}</p>
            {match.summaryHi && (
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{match.summaryHi}</p>
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
        {match.sport === 'cricket' && match.extras && (() => {
          const e = match.extras as Record<string, string | number | null>;
          return (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {e.runRate ? <StatBox label="Run Rate" value={String(e.runRate)} /> : null}
              {e.overs ? <StatBox label="Overs" value={String(e.overs)} /> : null}
              {e.partnership ? <StatBox label="Partnership" value={String(e.partnership)} /> : null}
            </div>
          );
        })()}

        {/* Football-specific extras */}
        {match.sport === 'football' && match.extras && (() => {
          const e = match.extras as Record<string, string | number | null>;
          return (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {e.possession ? <StatBox label="Possession" value={`${e.possession}%`} /> : null}
              {e.minute ? <StatBox label="Minute" value={`${e.minute}'`} /> : null}
            </div>
          );
        })()}
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
