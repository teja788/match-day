'use client';

import Link from 'next/link';
import { LiveIndicator } from './LiveIndicator';

interface Team {
  name: string;
  shortName: string;
  logo: string;
  score: string;
}

export interface Match {
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
}

const sportIcon: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
};

export function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'live';

  return (
    <Link
      href={`/match/${match.id}`}
      className={`block bg-surface-card rounded-xl p-4 border transition-all hover:bg-surface-hover hover:border-gray-600 group ${
        isLive ? 'border-live/25' : 'border-surface-border'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-semibold">
          {sportIcon[match.sport]} {match.tournament}
          {match.sport === 'football' && match.extras?.minute
            ? ` • ${match.extras.minute}'`
            : ''}
        </span>
        {isLive && <LiveIndicator />}
        {match.status === 'upcoming' && (
          <span className="text-xs text-gray-500">
            {new Date(match.startTime).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        {match.status === 'completed' && (
          <span className="text-xs text-gray-500 font-bold">FT</span>
        )}
      </div>

      {/* Team scores */}
      <div className="space-y-1.5 mb-3">
        <TeamRow team={match.teamA} isLive={isLive} />
        <TeamRow team={match.teamB} isLive={isLive} />
      </div>

      {/* AI headline */}
      {match.headline && (
        <div className="bg-headline/10 rounded-md px-3 py-1.5 mb-2">
          <p className="text-headline text-xs font-semibold truncate">
            {match.headline}
          </p>
        </div>
      )}

      {/* Venue */}
      {match.venue && (
        <p className="text-[11px] text-gray-500 truncate">{match.venue}</p>
      )}
    </Link>
  );
}

function TeamRow({ team, isLive }: { team: Team; isLive: boolean }) {
  const innings = team.score.split(' & ');

  return (
    <div className="flex items-start gap-2">
      {team.logo && (
        <img
          src={team.logo}
          alt={team.name}
          width={20}
          height={20}
          className="w-5 h-5 rounded-full object-cover mt-0.5"
        />
      )}
      <span className="text-sm font-semibold text-white flex-1 mt-0.5">
        {team.shortName || team.name}
      </span>
      <div className="text-right">
        {innings.map((inn, i) => (
          <div
            key={i}
            className={`text-sm font-bold font-mono leading-tight ${
              isLive ? 'text-score' : 'text-gray-300'
            } ${i > 0 ? 'text-xs opacity-70' : ''}`}
          >
            {inn}
          </div>
        ))}
      </div>
    </div>
  );
}
