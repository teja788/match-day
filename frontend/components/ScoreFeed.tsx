'use client';

import { useLiveScores } from '@/lib/swr';
import { useScoreStore } from '@/stores/useScoreStore';
import { MatchCard } from './MatchCard';
import { SportFilter } from './SportFilter';

export function ScoreFeed() {
  const { activeSport } = useScoreStore();
  const sportParam = activeSport === 'all' ? undefined : activeSport;
  const { data, error, isLoading, isValidating } = useLiveScores(sportParam);

  return (
    <div>
      <SportFilter />

      {/* Loading state */}
      {isLoading && (
        <div className="px-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 bg-surface-card rounded-xl animate-pulse border border-surface-border"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Failed to load scores</p>
          <p className="text-sm mt-1">Retrying automatically...</p>
        </div>
      )}

      {/* Match cards */}
      {data && (
        <div className="px-4 space-y-3">
          {/* Refreshing indicator */}
          {isValidating && !isLoading && (
            <div className="flex justify-center">
              <span className="text-[10px] text-gray-600 bg-surface-card px-3 py-1 rounded-full">
                Updating...
              </span>
            </div>
          )}

          {data.matches.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">No matches right now</p>
              <p className="text-sm mt-1">Check back during match hours</p>
            </div>
          ) : (
            data.matches.map((match: Record<string, unknown>) => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <MatchCard key={match.id as string} match={match as any} />
            ))
          )}

          {/* Last updated */}
          {data.lastUpdated && (
            <p className="text-center text-[10px] text-gray-600 py-4">
              Last updated{' '}
              {new Date(data.lastUpdated as string).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
              {' • '}Auto-refreshes every 30s
            </p>
          )}
        </div>
      )}
    </div>
  );
}
