'use client';

import { useLiveScores } from '@/lib/swr';
import { MatchCard } from '@/components/MatchCard';

export function FootballFeed({ initialData }: { initialData?: unknown }) {
  const { data, isLoading } = useLiveScores('football', initialData);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="px-4 space-y-3">
      {data?.matches?.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No football matches right now</p>
          <p className="text-sm mt-1">Check back during match hours</p>
        </div>
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {data?.matches?.map((match: any) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-4 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-36 bg-surface-card rounded-xl animate-pulse border border-surface-border"
        />
      ))}
    </div>
  );
}
